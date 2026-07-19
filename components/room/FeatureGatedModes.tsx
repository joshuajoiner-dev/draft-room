"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { validateUnlockCode } from "@/lib/room/actions";

const COMPLETE_UNLOCK_KEY = "draft-room-complete-unlocked";
// Temporary launch access: flip this off when the first 100-user feedback window ends.
const FOUNDER_ACCESS_ENABLED = true;
const FOUNDER_ACCESS_MESSAGE = "All Complete features are currently unlocked while we build our first community.";

type FeatureGatedModesProps = {
  quickRandom: ReactNode;
  captainDraft: ReactNode;
};

type UnlockMessage = {
  tone: "success" | "error";
  text: string;
};

type BrowserUnlockPayload = {
  lastVerifiedAt: string;
  licenseId: string;
  productKey: string;
  publicLicenseId: string;
  unlocked: true;
  unlockedAt: string;
};

type StoredUnlockPayload = {
  lastVerifiedAt?: string;
  licenseId?: string;
  productKey?: string;
  publicLicenseId?: string;
  unlocked: true;
  unlockedAt: string;
};

function hasLocalUnlock() {
  try {
    const storedValue = window.localStorage.getItem(COMPLETE_UNLOCK_KEY);
    const parsedValue = storedValue ? (JSON.parse(storedValue) as { unlocked?: unknown }) : null;

    return parsedValue?.unlocked === true;
  } catch {
    return false;
  }
}

function isBrowserUnlockPayload(value: unknown): value is BrowserUnlockPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<BrowserUnlockPayload>;

  return (
    payload.unlocked === true &&
    typeof payload.licenseId === "string" &&
    typeof payload.publicLicenseId === "string" &&
    typeof payload.productKey === "string" &&
    typeof payload.unlockedAt === "string" &&
    typeof payload.lastVerifiedAt === "string"
  );
}

function buildStoredUnlockPayload(unlock: unknown): StoredUnlockPayload {
  if (isBrowserUnlockPayload(unlock)) {
    return {
      unlocked: true,
      licenseId: unlock.licenseId,
      publicLicenseId: unlock.publicLicenseId,
      productKey: unlock.productKey,
      unlockedAt: unlock.unlockedAt,
      lastVerifiedAt: unlock.lastVerifiedAt
    };
  }

  return {
    unlocked: true,
    unlockedAt: new Date().toISOString()
  };
}

function storeLocalUnlock(unlock: unknown) {
  try {
    window.localStorage.setItem(
      COMPLETE_UNLOCK_KEY,
      JSON.stringify(buildStoredUnlockPayload(unlock))
    );

    return true;
  } catch {
    return false;
  }
}

function LockedModeCard({
  description,
  modeTone,
  title
}: {
  description: string;
  modeTone: "green" | "orange";
  title: string;
}) {
  return (
    <section className={`card form locked-mode mode-card mode-card--${modeTone}`} aria-label={`${title} locked`}>
      <div className="stack-tight">
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>

      <div className="locked-message">Included with Draft Room Complete</div>
      <button className="button button-secondary" type="button" disabled>
        Included with Draft Room Complete
      </button>
    </section>
  );
}

export function FeatureGatedModes({ quickRandom, captainDraft }: FeatureGatedModesProps) {
  const [isUnlocked, setIsUnlocked] = useState(FOUNDER_ACCESS_ENABLED);
  const [message, setMessage] = useState<UnlockMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (FOUNDER_ACCESS_ENABLED) {
      setIsUnlocked(true);
      setMessage({
        tone: "success",
        text: FOUNDER_ACCESS_MESSAGE
      });
      return;
    }

    if (hasLocalUnlock()) {
      setIsUnlocked(true);
      setMessage({
        tone: "success",
        text: "Draft Room Complete is unlocked in this browser."
      });
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await validateUnlockCode(formData);

      if (result.success) {
        const didStoreUnlock = storeLocalUnlock(result.unlock);

        setIsUnlocked(true);
        setMessage({
          tone: "success",
          text: didStoreUnlock
            ? result.message
            : "Draft Room Complete unlocked for this session. Browser storage is unavailable."
        });
        form.reset();
        return;
      }

      setMessage({
        tone: "error",
        text: result.message
      });
    });
  }

  return (
    <>
      {!isUnlocked ? (
        <LockedModeCard
          description="Assign players completely at random for the fastest possible team split."
          modeTone="green"
          title="⚡ Quick Random"
        />
      ) : null}

      <div hidden={!isUnlocked}>{quickRandom}</div>

      {!isUnlocked ? (
        <LockedModeCard
          description="Choose one captain per team. Captains start on their own teams."
          modeTone="orange"
          title="👥 Captain Draft"
        />
      ) : null}

      <div hidden={!isUnlocked}>{captainDraft}</div>

      <section className="founder-access-panel" data-testid="complete-unlock">
        {FOUNDER_ACCESS_ENABLED ? (
          <>
            <h3 className="founder-access-heading">Founder Access</h3>
            <p className="founder-access-note muted">{FOUNDER_ACCESS_MESSAGE}</p>
          </>
        ) : (
          <>
            <div className="stack-tight">
              <h2>Enter Unlock Code</h2>
              <p className="muted">
                Unlock Complete on this browser to access Captain Draft, templates, statistic keeping, and more.
              </p>
            </div>

            {message ? <div className={message.tone === "success" ? "success" : "error"}>{message.text}</div> : null}

            {!isUnlocked ? (
              <form className="unlock-form" onSubmit={handleSubmit}>
                <label className="label">
                  Unlock code
                  <input
                    autoCapitalize="characters"
                    className="input"
                    name="code"
                    placeholder="ENTER CODE"
                    required
                    type="text"
                  />
                </label>

                <button className="button button-orange unlock-submit" type="submit" disabled={isPending}>
                  {isPending ? "Checking..." : "Unlock Complete"}
                </button>
              </form>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
