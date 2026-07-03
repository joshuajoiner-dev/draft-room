"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  initialSeconds?: number;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function CountdownTimer({ initialSeconds = 60 }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isRunning, secondsLeft]);

  return (
    <section className="countdown-timer" aria-label="Pick countdown timer">
      <div>
        <p className="countdown-label">Pick Timer</p>
        <strong aria-live="polite">{formatTime(secondsLeft)}</strong>
      </div>

      <div className="countdown-actions">
        <button className="button button-small button-secondary" type="button" onClick={() => setIsRunning((value) => !value)}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          className="button button-small button-secondary"
          type="button"
          onClick={() => {
            setSecondsLeft(initialSeconds);
            setIsRunning(false);
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
