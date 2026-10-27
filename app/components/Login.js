"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export default function Login({ onError }) {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signInWithGoogle() {
    onError("");
    if (!isAccepted) {
      onError("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    setIsSigningIn(true);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      onError(error.message || "Unable to start Google sign-in.");
      setIsSigningIn(false);
    }
  }

  return (
    <div className="login-panel-content">
      <div className="login-heading">
        <p className="success-kicker">ZIPHIX ACCOUNT</p>
        <h2>Sign in to book a service</h2>
      </div>
      <label className="consent-field">
        <input checked={isAccepted} onChange={(event) => setIsAccepted(event.target.checked)} type="checkbox" />
        <span>I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
      </label>
      <button className="button button-primary google-login-button" disabled={isSigningIn} onClick={signInWithGoogle} type="button">
        {isSigningIn ? <><span className="spinner" aria-hidden="true" /> Connecting to Google</> : "Continue with Google"}
      </button>
    </div>
  );
}