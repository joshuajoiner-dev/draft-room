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
    `<p>Thanks for purchasing <strong>${PRODUCT_NAME}</strong>.</p>`,
    `<p><strong>Unlock code:</strong> ${formattedCode}<br />`,
    `<strong>License ID:</strong> ${input.publicLicenseId}</p>`,
    `<p><a href="${appUrl}">Open JoinDraftPick</a></p>`,
    "<p>Enter this unlock code on the organizer screen to unlock Complete on this browser.</p>",
    "<p>Keep this email for your records.</p>",
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
      ok: false,
      error: sanitizeEmailError(error),
    };
  }
}
