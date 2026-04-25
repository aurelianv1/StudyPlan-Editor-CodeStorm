"use client";

import React, { useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

interface FormData {
  name: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  subject?: string;
  message?: string;
}

export default function HelpPage() {
  const [formData, setFormData] = useState<FormData>({ name: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>("idle");

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required.";
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    else if (formData.message.trim().length < 10)
      newErrors.message = "Message must be at least 10 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormState("sending");

    const mailto = `mailto:support@yourapp.com?subject=${encodeURIComponent(
      `[${formData.subject}] from ${formData.name}`
    )}&body=${encodeURIComponent(formData.message)}`;

    try {
      window.location.href = mailto;
      await new Promise((res) => setTimeout(res, 800));
      setFormState("sent");
      setFormData({ name: "", subject: "", message: "" });
    } catch {
      setFormState("error");
    }
  };

  const handleReset = () => {
    setFormState("idle");
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,.03) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-2xl px-8 py-20">
        {/* Page header */}
        <div className="mb-12 text-center">
          <span className="inline-block mb-4 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/25 border border-white/10 rounded-full">
            03 — Support
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05] mb-4"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            We're here if you
            <br />
            <span className="text-white/20 italic font-normal">need us.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            Have a question, spotted a bug, or need help with the platform?
            <br />
            Fill in the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[.025] backdrop-blur-sm p-8">
          {formState === "sent" ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center py-8 gap-5 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white mb-1"
                style={{ animation: "popIn .35s cubic-bezier(.34,1.56,.64,1) both" }}>
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Message sent!</h2>
              <p className="text-white/40 text-sm max-w-sm">
                Your email client should have opened. If it didn't, please email us directly at{" "}
                <a href="mailto:support@yourapp.com" className="underline underline-offset-2 text-white/70 font-medium hover:text-white transition-colors">
                  support@yourapp.com
                </a>.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-5 py-2.5 rounded-lg border border-white/10 text-white/60 text-xs font-medium tracking-wide hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
              >
                Send another message
              </button>
            </div>
          ) : formState === "error" ? (
            /* ── Error state ── */
            <div className="flex flex-col items-center py-8 gap-5 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-white/5 mb-1">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
              <p className="text-white/40 text-sm max-w-sm">
                We couldn't open your email client. Please email us directly at{" "}
                <a href="mailto:support@yourapp.com" className="underline underline-offset-2 text-white/70 font-medium hover:text-white transition-colors">
                  support@yourapp.com
                </a>.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-5 py-2.5 rounded-lg border border-white/10 text-white/60 text-xs font-medium tracking-wide hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
              >
                Try again
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-semibold text-white/60 tracking-wide">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ion Popescu"
                  disabled={formState === "sending"}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none transition-all focus:ring-2 focus:ring-white/20 focus:border-white/30 disabled:opacity-40 ${
                    errors.name ? "border-red-500/40 focus:ring-red-500/20" : "border-white/10"
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-400/80 mt-0.5">{errors.name}</p>}
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs font-semibold text-white/60 tracking-wide">
                  Subject / Problem
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Bug in Doc Editing page"
                  disabled={formState === "sending"}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none transition-all focus:ring-2 focus:ring-white/20 focus:border-white/30 disabled:opacity-40 ${
                    errors.subject ? "border-red-500/40 focus:ring-red-500/20" : "border-white/10"
                  }`}
                />
                {errors.subject && <p className="text-[10px] text-red-400/80 mt-0.5">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-semibold text-white/60 tracking-wide">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question in detail..."
                  disabled={formState === "sending"}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none transition-all focus:ring-2 focus:ring-white/20 focus:border-white/30 resize-none disabled:opacity-40 ${
                    errors.message ? "border-red-500/40 focus:ring-red-500/20" : "border-white/10"
                  }`}
                />
                <div className="flex justify-between items-center">
                  {errors.message ? (
                    <p className="text-[10px] text-red-400/80">{errors.message}</p>
                  ) : <span />}
                  <span className="text-[10px] text-white/20 ml-auto">{formData.message.length} chars</span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/20">Opens your default email client.</p>
                <button
                  onClick={handleSubmit}
                  disabled={formState === "sending"}
                  className={`group flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                    formState === "sending"
                      ? "bg-white/10 text-white/20 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {formState === "sending" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    <>
                      Send →
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct email fallback */}
        <p className="text-center text-[10px] text-white/20 mt-8 tracking-wide">
          Or email us directly at{" "}
          <a
            href="mailto:support@yourapp.com"
            className="text-white/50 underline underline-offset-2 font-medium hover:text-white/80 transition-colors"
          >
            support@yourapp.com
          </a>
        </p>
      </div>

      {/* Footer divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <footer className="py-6 text-center text-[10px] text-white/15 tracking-wider">
        StudyPlan Editor · Built for universities
      </footer>

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(.4); opacity: 0; }
          70%  { transform: scale(1.12); }
          100% { transform: scale(1);  opacity: 1; }
        }
      `}</style>
    </main>
  );
}