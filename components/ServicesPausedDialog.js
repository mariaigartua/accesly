"use client";

import { useEffect, useRef } from "react";
import { PauseCircle } from "lucide-react";

/**
 * Shows a pop-up whenever an API call is blocked by the services pause switch
 * (proxy.js answers 503 with an `x-services-paused` header). Uses a native
 * <dialog>, which traps focus, closes with Escape and returns focus afterwards.
 */
export default function ServicesPausedDialog() {
  const ref = useRef(null);

  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (...args) => {
      const res = await original(...args);
      if (res.status === 503 && res.headers.get("x-services-paused")) {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();
      }
      return res;
    };
    return () => {
      window.fetch = original;
    };
  }, []);

  return (
    <dialog ref={ref} className="paused-dialog" aria-labelledby="paused-title" aria-describedby="paused-text">
      <PauseCircle className="paused-icon" aria-hidden="true" focusable="false" />
      <h2 id="paused-title">These services are paused for now</h2>
      <p id="paused-text">
        Accessly was built for HackUMass XIV. For the moment, chats, accommodation requests, issue reports, new
        events and AI answers are turned off. Nothing you typed was sent. You can still browse events and places.
      </p>
      <form method="dialog">
        <button type="submit" className="btn" autoFocus>
          OK
        </button>
      </form>
    </dialog>
  );
}
