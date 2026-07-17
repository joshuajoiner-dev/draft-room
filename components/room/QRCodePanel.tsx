"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DemoPresentation } from "@/components/presentation/DemoPresentation";

type QRCodePanelProps = {
  joinUrl: string;
  upgradeHref?: string;
};

function shortenUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.host}${parsedUrl.pathname}`;
  } catch {
    return url;
  }
}

export function QRCodePanel({ joinUrl, upgradeHref }: QRCodePanelProps) {
  const [src, setSrc] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const displayUrl = shortenUrl(joinUrl);

  useEffect(() => {
    let mounted = true;

    setSrc("");
    QRCode.toDataURL(joinUrl, {
      width: 420,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    }).then((url) => {
      if (mounted) {
        setSrc(url);
      }
    });

    return () => {
      mounted = false;
    };
  }, [joinUrl]);

  async function copyJoinLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopyStatus("Copied");
  }

  return (
    <section className="card stack qr-card">
      <div className="stack-tight">
        <h2>Join link</h2>
        <p className="muted">Players can scan or open this link.</p>
      </div>

      <div className="join-link-row">
        <div className="join-link-panel">
          <span>Current room link</span>
          <div className="link-box" title={joinUrl}>{displayUrl}</div>
        </div>
        <button aria-label="Copy full join link" className="button copy-link-button" onClick={copyJoinLink} type="button">
          Copy Link
        </button>
        {upgradeHref ? (
          <a className="button button-orange" href={upgradeHref}>
            Upgrade Now
          </a>
        ) : null}
      </div>

      {copyStatus ? (
        <p className="muted copy-status" role="status">
          {copyStatus}
        </p>
      ) : null}

      <div className="qr-box" aria-live="polite">
        {src ? (
          <Image alt="Room join QR code" height={252} priority src={src} unoptimized width={252} />
        ) : (
          <div className="qr-loading" role="status">
            Generating QR code...
          </div>
        )}
      </div>

      <DemoPresentation placement="below_qr" />
    </section>
  );
}
