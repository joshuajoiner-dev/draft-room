import { getCommerceServerConfig } from "./env";
import type { LicenseOwnerEmail, PublicLicenseId, UnlockCode } from "./types";
import { formatUnlockCode } from "./validation";

type SendUnlockCodeEmailInput = {
  licenseOwnerEmail: LicenseOwnerEmail;
  publicLicenseId: PublicLicenseId;
  unlockCode: UnlockCode;
};

type SendUnlockCodeEmailSuccess = {
  ok: true;
  messageId: string | null;
};

type SendUnlockCodeEmailFailure = {
  diagnostics: PostmarkEmailFailureDiagnostics;
  ok: false;
  error: string;
};

export type SendUnlockCodeEmailResult =
  | SendUnlockCodeEmailSuccess
  | SendUnlockCodeEmailFailure;

type PostmarkSendResponse = {
  ErrorCode?: number;
  Message?: string;
  MessageID?: string;
  [key: string]: unknown;
};

type PostmarkEmailFailureDiagnostics = {
  errorCode?: number;
  message?: string;
  provider: "postmark";
  responseBody?: Record<string, unknown>;
  statusCode?: number;
};

const POSTMARK_SEND_ENDPOINT = "https://api.postmarkapp.com/email";
const EMAIL_SUBJECT = "Your JoinDraftPick Complete unlock code";
const PRODUCT_NAME = "JoinDraftPick Complete";

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error("Commerce email can only be sent from server-side code.");
  }
}

function sanitizeEmailError(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (/postmark|commerce|email|fetch|network|disabled|missing/i.test(error.message)) {
      return error.message;
    }
  }

  return "Could not send unlock-code email.";
}

function sanitizeDiagnosticText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.replace(/[\r\n]+/g, " ").slice(0, 500);
}

function sanitizePostmarkResponseBody(
  responseBody: PostmarkSendResponse,
): Record<string, unknown> | undefined {
  const safeBody: Record<string, unknown> = {};

  if (typeof responseBody.ErrorCode === "number") {
    safeBody.ErrorCode = responseBody.ErrorCode;
  }

  const message = sanitizeDiagnosticText(responseBody.Message);

  if (message) {
    safeBody.Message = message;
  }

  return Object.keys(safeBody).length > 0 ? safeBody : undefined;
}

function buildPostmarkFailureDiagnostics(input: {
  responseBody: PostmarkSendResponse;
  statusCode: number;
}): PostmarkEmailFailureDiagnostics {
  const message = sanitizeDiagnosticText(input.responseBody.Message);
  const responseBody = sanitizePostmarkResponseBody(input.responseBody);

  return {
    provider: "postmark",
    statusCode: input.statusCode,
    ...(typeof input.responseBody.ErrorCode === "number"
      ? { errorCode: input.responseBody.ErrorCode }
      : {}),
    ...(message ? { message } : {}),
    ...(responseBody ? { responseBody } : {}),
  };
}

function buildGenericFailureDiagnostics(): PostmarkEmailFailureDiagnostics {
  return {
    provider: "postmark",
  };
}

function buildUnlockCodeEmailText(input: SendUnlockCodeEmailInput, appUrl: string): string {
  const formattedCode = formatUnlockCode(input.unlockCode);

  return [
    `Thanks for purchasing ${PRODUCT_NAME}.`,
    "",
    `Unlock code: ${formattedCode}`,
    `License ID: ${input.publicLicenseId}`,
    "",
    `Open JoinDraftPick: ${appUrl}`,
    "",
    "Enter this unlock code on the organizer screen to unlock Complete on this browser.",
    "Keep this email for your records.",
  ].join("\n");
}

function buildUnlockCodeEmailHtml(input: SendUnlockCodeEmailInput, appUrl: string): string {
  const formattedCode = formatUnlockCode(input.unlockCode);

  return [
    '<div style="margin:0;background:#f7f7f7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;color:#171717;">',
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e8e8;border-radius:8px;padding:28px;">',
    `<p style="margin:0 0 18px;font-size:16px;line-height:1.5;">Thanks for purchasing <strong>${PRODUCT_NAME}</strong>.</p>`,
    '<p style="margin:0 0 8px;color:#555555;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Unlock code</p>',
    `<div style="margin:0 0 18px;padding:18px;border:1px solid #ffd0a3;border-radius:8px;background:#fff5eb;color:#171717;font-size:30px;font-weight:800;letter-spacing:0.08em;line-height:1.2;text-align:center;">${formattedCode}</div>`,
    `<p style="margin:0 0 22px;color:#666666;font-size:13px;line-height:1.45;">License ID: <span style="font-weight:700;color:#333333;">${input.publicLicenseId}</span></p>`,
    `<p style="margin:0 0 22px;"><a href="${appUrl}" style="display:inline-block;border-radius:8px;background:#ff8a1f;color:#180b00;font-size:16px;font-weight:800;padding:14px 18px;text-decoration:none;">Open JoinDraftPick</a></p>`,
    '<p style="margin:0 0 8px;font-size:15px;line-height:1.5;">Enter this code on the organizer screen to unlock Complete on this browser.</p>',
    '<p style="margin:0;color:#666666;font-size:13px;line-height:1.5;">Keep this email for your records.</p>',
    "</div>",
    "</div>",
  ].join("");
}

export async function sendUnlockCodeEmail(
  input: SendUnlockCodeEmailInput,
): Promise<SendUnlockCodeEmailResult> {
  assertServerOnly();

  try {
    const config = getCommerceServerConfig();

    if (!config.commerceEnabled) {
      return {
        diagnostics: buildGenericFailureDiagnostics(),
        ok: false,
        error: "Commerce email is disabled.",
      };
    }

    const response = await fetch(POSTMARK_SEND_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": config.postmarkServerToken,
      },
      body: JSON.stringify({
        From: config.postmarkFromEmail,
        To: input.licenseOwnerEmail,
        Subject: EMAIL_SUBJECT,
        TextBody: buildUnlockCodeEmailText(input, config.appUrl),
        HtmlBody: buildUnlockCodeEmailHtml(input, config.appUrl),
        MessageStream: config.postmarkMessageStream ?? undefined,
      }),
    });

    const responseBody = (await response.json().catch(() => ({}))) as PostmarkSendResponse;

    if (!response.ok || responseBody.ErrorCode) {
      return {
        diagnostics: buildPostmarkFailureDiagnostics({
          responseBody,
          statusCode: response.status,
        }),
        ok: false,
        error: "Postmark rejected the unlock-code email request.",
      };
    }

    return {
      ok: true,
      messageId: responseBody.MessageID ?? null,
    };
  } catch (error) {
    return {
      diagnostics: buildGenericFailureDiagnostics(),
      ok: false,
      error: sanitizeEmailError(error),
    };
  }
}
