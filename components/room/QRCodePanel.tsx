"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { VenuePresentation } from "@/components/presentation/VenuePresentation";

type QRCodePanelProps = {
  joinUrl: string;
  roomCode: string;
};

export function QRCodePanel({ joinUrl, roomCode }: QRCodePanelProps) {
  const [src, setSrc] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    setSrc("");
    QRCode.toDataURL(joinUrl, {
      width: 480,
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
        <p className="muted">Players can scan the QR or use the room code.</p>
      </div>

      <div className="join-link-row">
        <div className="join-link-panel">
          <span>Room Code</span>
          <strong>{roomCode}</strong>
        </div>
        <button aria-label="Copy full join link" className="button copy-link-button" onClick={copyJoinLink} type="button">
          Copy Link
        </button>
        <a className="button button-secondary share-qr-button" href="#room-qr-code">
          Share QR
        </a>
      </div>

      {copyStatus ? (
        <p className="muted copy-status" role="status">
          {copyStatus}
        </p>
      ) : null}

      <div className="qr-box" id="room-qr-code" aria-live="polite">
        {src ? (
          <Image alt="Room join QR code" height={280} priority src={src} unoptimized width={280} />
        ) : (
          <div className="qr-loading" role="status">
            Generating QR code...
          </div>
        )}
      </div>

      <VenuePresentation placement="below_qr" />
    </section>
  );
}
