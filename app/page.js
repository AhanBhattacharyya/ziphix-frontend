"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Login from "./components/Login";
import { getSupabase } from "../lib/supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SUPABASE_CONFIG_MISSING = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_CONFIG_ERROR = "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend/.env.local.";
const IS_FOUNDER_ONLINE = (process.env.NEXT_PUBLIC_FOUNDER_ONLINE ?? "true") === "true";
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

const initialForm = {
  customer_name: "",
  phone: "",
  address: "",
  service_type: "",
  problem_desc: "",
};

const initialProfileForm = { name: "", phone: "", whatsapp_number: "" };

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [authState, setAuthState] = useState(SUPABASE_CONFIG_MISSING ? "login" : "loading");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [authError, setAuthError] = useState(SUPABASE_CONFIG_MISSING ? SUPABASE_CONFIG_ERROR : "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [hasAcceptedBookingTerms, setHasAcceptedBookingTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    let supabase;

    async function loadSession(nextSession) {
      if (!isActive) return;
      setSession(nextSession);
      setAuthError("");

      if (!nextSession) {
        setProfile(null);
        setForm(initialForm);
        setAuthState("login");
        return;
      }

      setAuthState("loading");
      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, phone, whatsapp_number")
          .eq("id", nextSession.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!isActive) return;

        if (!data) {
          setProfile(null);
          setProfileForm({
            ...initialProfileForm,
            name: nextSession.user.user_metadata?.full_name || nextSession.user.user_metadata?.name || "",
          });
          setAuthState("profile");
          return;
        }

        setProfile(data);
        setForm({ ...initialForm, customer_name: data.name || "", phone: data.phone || "" });
        setAuthState("dashboard");
      } catch (profileError) {
        if (!isActive) return;
        setAuthError(profileError.message || "Unable to load your profile.");
        setAuthState("login");
      }
    }

    try {
      supabase = getSupabase();
    } catch (configError) {
      console.error(configError.message);
      return () => { isActive = false; };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "INITIAL_SESSION") {
        window.setTimeout(() => { void loadSession(nextSession); }, 0);
      }
    });

    async function initializeSession() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        try {
          const { error: tokenError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (tokenError) throw tokenError;
        } finally {
          window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}${window.location.search}`
          );
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      await loadSession(data.session);
    }

    initializeSession().catch((sessionError) => {
        if (!isActive) return;
        setAuthError(sessionError.message || "Unable to check your login status.");
        setAuthState("login");
      });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    if (error) setError("");
  }

  async function submitBooking(event) {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Please complete every field before continuing.");
      return;
    }

    if (!hasAcceptedBookingTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy to continue.");
      return;
    }

    const phoneDigits = (profile?.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a phone number with at least 10 digits.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mock-payment`, {
        ...form,
        customer_name: profile.name,
        phone: profile.phone,
        email: session?.user.email || "",
      });
      if (!response.data?.success) {
        throw new Error(response.data?.error || "We couldn't confirm this booking.");
      }
      setIsConfirmed(true);
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.error;
      setError(
        serverMessage ||
          requestError.message ||
          "We couldn't reach the booking service. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startAnotherBooking() {
    setForm({ ...initialForm, customer_name: profile?.name || "", phone: profile?.phone || "" });
    setError("");
    setIsConfirmed(false);
    setHasAcceptedBookingTerms(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setAuthError("");
    if (!profileForm.name.trim()) {
      setAuthError("Please enter your name.");
      return;
    }
    if (profileForm.phone.replace(/\D/g, "").length < 10 || profileForm.whatsapp_number.replace(/\D/g, "").length < 10) {
      setAuthError("Enter phone and WhatsApp numbers with at least 10 digits.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const { data, error: insertError } = await getSupabase()
        .from("profiles")
        .insert({
          id: session.user.id,
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          whatsapp_number: profileForm.whatsapp_number.trim(),
        })
        .select("id, name, phone, whatsapp_number")
        .single();
      if (insertError) throw insertError;

      setProfile(data);
      setForm({ ...initialForm, customer_name: data.name, phone: data.phone });
      setAuthState("dashboard");
    } catch (saveError) {
      setAuthError(saveError.message || "Unable to save your profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ZIPHIX home">
          <img className="brand-logo" src="/gpt-image-2.5-flare_b_A_modern,_profession%20(1).png" alt="ZIPHIX Logo" width={150} height={82} />
        </a>
        <a className="header-link" href="#booking">Book a service <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Home services, made simple</p>
          <h1>Book vetted local pros at a <span>fixed upfront price.</span></h1>
          <p className="hero-description">
            Tell us what needs fixing. We&apos;ll find the right local professional and keep you in the loop.
          </p>
          <a className="button button-primary hero-button" href="#booking">
            Book Now <span aria-hidden="true">↓</span>
          </a>
          <div className="hero-points" aria-label="Service benefits">
            <span><span className="check-mark">✓</span> Vetted local pros</span>
            <span><span className="check-mark">✓</span> Clear visit fee</span>
          </div>
        </div>

        <div className="hero-visual" role="img" aria-label="A home service professional carrying a tool case">
          <div className="visual-caption">
            <span className="caption-kicker">Good help, right around the corner</span>
            <span className="caption-title">Your home, in good hands.</span>
          </div>
          <div className="fee-stamp"><span>Visit fee</span><strong>₹199</strong><span>fixed upfront</span></div>
        </div>
      </section>

      <section className="booking-section" id="booking">
        <div className="booking-intro">
          <p className="section-index">01 <span /> YOUR SERVICE REQUEST</p>
          <h2>What can we help with?</h2>
          <p>Share a few details and our team will take it from here.</p>
          <div className="fee-note">
            <span className="fee-note-icon" aria-hidden="true">₹</span>
            <span><strong>₹199 visit fee</strong><br />Fixed upfront. No surprises.</span>
          </div>
        </div>

        <div className="booking-content">
          {authState === "loading" ? (
            <div className="auth-panel" role="status">Checking your account...</div>
          ) : authState === "login" ? (
            <div className="auth-panel">
              {authError && <p className="error-alert" role="alert">{authError}</p>}
              <Login onError={setAuthError} />
            </div>
          ) : authState === "profile" ? (
            <form className="booking-form profile-form" onSubmit={saveProfile} noValidate>
              <div className="profile-heading">
                <p className="success-kicker">One last step</p>
                <h2>Complete your profile</h2>
              </div>
              {authError && <p className="error-alert" role="alert">{authError}</p>}
              <label className="field">
                <span>Name</span>
                <input autoComplete="name" onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required value={profileForm.name} />
              </label>
              <label className="field">
                <span>Phone Number</span>
                <input autoComplete="tel" inputMode="tel" onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} required type="tel" value={profileForm.phone} />
              </label>
              <label className="field">
                <span>WhatsApp Number</span>
                <input autoComplete="tel" inputMode="tel" onChange={(event) => setProfileForm({ ...profileForm, whatsapp_number: event.target.value })} required type="tel" value={profileForm.whatsapp_number} />
              </label>
              <button className="button button-primary submit-button" disabled={isSavingProfile} type="submit">
                {isSavingProfile ? <><span className="spinner" aria-hidden="true" /> Saving profile</> : <>Save profile <span aria-hidden="true">→</span></>}
              </button>
            </form>
          ) : (
            <>
              <div className="dashboard-heading">
                <div>
                  <p className="success-kicker">Your ZIPHIX account</p>
                  <h2>Welcome, {profile.name}</h2>
                  <p>{session?.user.email}</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => { void getSupabase().auth.signOut(); }}
                  type="button"
                >
                  Sign out
                </button>
              </div>
          {!IS_FOUNDER_ONLINE ? (
            <div className="availability-panel" role="status">
              <span className="availability-mark" aria-hidden="true">i</span>
              <p className="success-kicker">Currently at capacity</p>
              <h2>All technicians are currently on board. We will connect with you shortly.</h2>
              {WHATSAPP_NUMBER ? (
                <a
                  className="button whatsapp-button"
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="whatsapp-icon">
                    <path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4Z" />
                    <path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.2l1.5.7c.3.1.4.3.4.5 0 .5-.2 1.1-.7 1.5-.5.4-1.1.6-1.8.5-1-.1-2.2-.7-3.5-1.8-1.1-.9-1.9-2.1-2.2-3.1-.3-.9-.1-1.6.3-2.1Z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              ) : (
                <p className="whatsapp-unconfigured">WhatsApp contact is not configured yet.</p>
              )}
            </div>
          ) : isConfirmed ? (
            <div className="success-panel" role="status" aria-live="polite">
              <div className="success-icon" aria-hidden="true">✓</div>
              <p className="success-kicker">Request received</p>
              <h2>Booking Confirmed!</h2>
              <p>Our team will WhatsApp you shortly.</p>
              <button className="text-button" type="button" onClick={startAnotherBooking}>
                Book another service <span aria-hidden="true">↗</span>
              </button>
            </div>
          ) : (
            <form className="booking-form" onSubmit={submitBooking} noValidate>
              {error && <p className="error-alert" role="alert">{error}</p>}

              <div className="form-grid">
                <label className="field">
                  <span>Customer Name</span>
                  <input
                    autoComplete="name"
                    name="customer_name"
                    readOnly
                    required
                    value={form.customer_name}
                  />
                </label>
                <label className="field">
                  <span>Phone Number</span>
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    name="phone"
                    readOnly
                    required
                    type="tel"
                    value={form.phone}
                  />
                </label>
              </div>

              <label className="field">
                <span>Address</span>
                <input
                  autoComplete="street-address"
                  name="address"
                  onChange={updateField}
                  placeholder="House, street, area"
                  required
                  value={form.address}
                />
              </label>

              <label className="field">
                <span>Service Type</span>
                <select name="service_type" onChange={updateField} required value={form.service_type}>
                  <option disabled value="">Choose a service</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                </select>
              </label>

              <label className="field">
                <span>Problem Description</span>
                <textarea
                  name="problem_desc"
                  onChange={updateField}
                  placeholder="Tell us a little about what needs attention"
                  required
                  rows={4}
                  value={form.problem_desc}
                />
              </label>

              <label className="consent-field">
                <input checked={hasAcceptedBookingTerms} onChange={(event) => setHasAcceptedBookingTerms(event.target.checked)} required type="checkbox" />
                <span>I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
              </label>
              <button className="button button-primary submit-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? <><span className="spinner" aria-hidden="true" /> Sending request</> : <>Confirm booking <span aria-hidden="true">→</span></>}
              </button>
              <p className="form-footnote">By continuing, you agree to be contacted on WhatsApp about this request.</p>
            </form>
          )}
            </>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top" aria-label="ZIPHIX home">
          <img className="brand-logo" src="/gpt-image-2.5-flare_b_A_modern,_profession%20(1).png" alt="ZIPHIX Logo" width={150} height={82} />
        </a>
        <p>Local help. Sorted.</p>
        <nav className="legal-links" aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refunds</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </nav>
      </footer>
    </main>
  );
}
