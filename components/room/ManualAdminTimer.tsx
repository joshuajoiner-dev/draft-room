"use client";

import { useEffect, useMemo, useState } from "react";

const TIME_PATTERN = /^\d{1,2}:\d{2}:\d{2}$/;

function parseTimeValue(value: string) {
  if (!TIME_PATTERN.test(value)) {
    return null;
  }

  const [hours, minutes, seconds] = value.split(":").map(Number);

  if (minutes > 59 || seconds > 59) {
    return null;
  }

  return hours * 3600 + minutes * 60 + seconds;
}

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function ManualAdminTimer() {
  const [inputValue, setInputValue] = useState("00:05:00");
  const [savedSeconds, setSavedSeconds] = useState(300);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  const parsedSeconds = useMemo(() => parseTimeValue(inputValue), [inputValue]);
  const isValidTime = parsedSeconds !== null;

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

  useEffect(() => {
    if (secondsLeft === 0) {
      setIsRunning(false);
    }
  }, [secondsLeft]);

  function applyInputTime() {
    if (parsedSeconds === null) {
      return;
    }

    setSavedSeconds(parsedSeconds);
    setSecondsLeft(parsedSeconds);
    setIsRunning(false);
  }

  function startTimer() {
    const nextSeconds = parsedSeconds ?? secondsLeft;

    if (parsedSeconds !== null) {
      setSavedSeconds(parsedSeconds);
      setSecondsLeft(parsedSeconds);
    }

    if (nextSeconds > 0) {
      setIsRunning(true);
    }
  }

  return (
    <section className="manual-admin-timer" aria-label="Manual admin timer">
      <div className="manual-timer-header">
        <p className="admin-panel-label">Manual Timer</p>
        <strong aria-live="polite" className="digital-time">
          {formatSeconds(secondsLeft)}
        </strong>
      </div>

      <label className="sr-only" htmlFor="manual-admin-timer-input">
        Timer duration
      </label>
      <input
        aria-invalid={!isValidTime}
        className="input input-compact manual-timer-input"
        id="manual-admin-timer-input"
        inputMode="numeric"
        onBlur={applyInputTime}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            applyInputTime();
          }
        }}
        placeholder="00:05:00"
        value={inputValue}
      />

      <div className="manual-timer-actions">
        <button className="button button-small button-orange" disabled={!isValidTime && !secondsLeft} onClick={startTimer} type="button">
          Start
        </button>
        <button className="button button-small button-secondary" onClick={() => setIsRunning(false)} type="button">
          Pause
        </button>
        <button
          className="button button-small button-secondary"
          onClick={() => {
            setSecondsLeft(savedSeconds);
            setInputValue(formatSeconds(savedSeconds));
            setIsRunning(false);
          }}
          type="button"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
