"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { validateUnlockCode } from "@/lib/room/actions";

const COMPLETE_UNLOCK_KEY = "draft-room-complete-unlocked";

type FeatureGatedModesProps = {
  quickRandom: ReactNode;
  balancedRandom: ReactNode;
  captainDraft: ReactNode;
};

type UnlockMessage = {
  tone: "success" | "error";
  text: string;
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

function storeLocalUnlock() {
  window.localStorage.setItem(
    COMPLETE_UNLOCK_KEY,
    JSON.stringify({
      unlocked: true,
      unlockedAt: new Date().toISOString()
    })
  );
}

function LockedModeCard({ title, description }: { title: string; description: string }) {
  return (
    <section className="card form locked-mode" aria-label={`${title} locked`}>
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

export function FeatureGatedModes({ quickRandom, balancedRandom, captainDraft }: FeatureGatedModesProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState<UnlockMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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
        storeLocalUnlock();
        setIsUnlocked(true);
        setMessage({
          tone: "success",
          text: result.message
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
      <section className="card form" data-testid="complete-unlock">
        <div className="stack-tight">
          <h2>Enter Unlock Code</h2>
          <p className="muted">Unlock Draft Room Complete on this browser.</p>
        </div>

        {message ? <div className={message.tone === "success" ? "success" : "error"}>{message.text}</div> : null}

        {!isUnlocked ? (
          <form className="form" onSubmit={handleSubmit}>
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

            <button className="button" type="submit" disabled={isPending}>
              {isPending ? "Checking..." : "Unlock Complete"}
            </button>
          </form>
        ) : null}
      </section>

      {isUnlocked ? (
        quickRandom
      ) : (
        <LockedModeCard
          title="⚡ Quick Random"
          description="Choose a team count and randomly assign all current players."
        />
      )}

      {balancedRandom}

      {isUnlocked ? (
        captainDraft
      ) : (
        <LockedModeCard
          title="👥 Captain Draft"
          description="Choose one captain per team. Captains start on their own teams."
        />
      )}
    </>
  );
}
