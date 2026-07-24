"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { VenuePresentation } from "@/components/presentation/VenuePresentation";
import { trackEvent, trackEventOnce } from "@/lib/analytics";

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

  const trackQrCodeView = useCallback(() => {
    trackEventOnce(`view_qr_code:${window.location.pathname}`, "view_qr_code", {
      room_code_present: Boolean(roomCode.trim()),
      source_component: "qr_code_panel"
    });
  }, [roomCode]);

  useEffect(() => {
    if (window.location.hash !== "#room-qr-code") {
      return;
    }

    trackQrCodeView();
  }, [roomCode, trackQrCodeView]);

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyStatus("Copied");
      trackEvent("copy_invite_link", {
        room_code_present: Boolean(roomCode.trim()),
        source_component: "qr_code_panel"
      });
    } catch {
      setCopyStatus("");
    }
  }

  function handleShareQrClick() {
    trackQrCodeView();
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
        <a
          className="button button-secondary share-qr-button"
          href="#room-qr-code"
          onClick={handleShareQrClick}
        >
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
          <Image alt="Room join QR code" height={188} priority src={src} unoptimized width={188} />
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
