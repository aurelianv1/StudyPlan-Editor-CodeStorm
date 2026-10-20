"use client";

import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { PageFooter } from "@/components/layout";

const SUPPORT_EMAIL = "support@yourapp.com";
const MIN_MESSAGE_LENGTH = 10;
/** Scurtă pauză ca utilizatorul să vadă starea „Sending…” înainte de confirmare. */
const SEND_FEEDBACK_DELAY_MS = 800;

type FormState = "idle" | "sending" | "sent";

interface ContactForm {
  name: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const EMPTY_FORM: ContactForm = { name: "", subject: "", message: "" };

function validateForm(form: ContactForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.subject.trim()) errors.subject = "Subject is required.";
  if (!form.message.trim()) errors.message = "Message is required.";
  else if (form.message.trim().length < MIN_MESSAGE_LENGTH)
    errors.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
  return errors;
}

function buildMailtoLink({ name, subject, message }: ContactForm) {
  const mailSubject = encodeURIComponent(`[${subject}] from ${name}`);
  return `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${encodeURIComponent(message)}`;
}

export default function HelpPage() {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>("idle");
  const isSending = formState === "sending";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as keyof ContactForm;
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setFormState("sending");
    window.location.href = buildMailtoLink(form);
    await new Promise((resolve) => setTimeout(resolve, SEND_FEEDBACK_DELAY_MS));
    setFormState("sent");
    setForm(EMPTY_FORM);
  };

  const handleReset = () => {
    setFormState("idle");
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,.03) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-2xl px-8 py-20">
        <div className="mb-12 text-center">
          <span className="inline-block mb-4 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/25 border border-white/10 rounded-full">
            03 — Support
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[-0.02em] leading-[1.05] mb-4">
            We&apos;re here if you
            <br />
            <span className="text-white/20 italic font-normal">need us.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            Have a question, spotted a bug, or need help with the platform?
            <br />
            Fill in the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.025] backdrop-blur-sm p-8">
          {formState === "sent" ? (
            <SentConfirmation onReset={handleReset} />
          ) : (
            <div className="flex flex-col gap-5">
              <FormField label="Your Name" name="name" error={errors.name}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ion Popescu"
                  disabled={isSending}
                  className={inputClassName(errors.name)}
                />
              </FormField>

              <FormField label="Subject / Problem" name="subject" error={errors.subject}>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Bug in Doc Editing page"
                  disabled={isSending}
                  className={inputClassName(errors.subject)}
                />
              </FormField>

              <FormField
                label="Message"
                name="message"
                error={errors.message}
                hint={`${form.message.length} chars`}
              >
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question in detail..."
                  disabled={isSending}
                  className={`${inputClassName(errors.message)} resize-none`}
                />
              </FormField>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-[10px] text-white/20">Opens your default email client.</p>
                <SubmitButton onClick={handleSubmit} isSending={isSending} />
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-white/20 mt-8 tracking-wide">
          Or email us directly at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-white/50 underline underline-offset-2 font-medium hover:text-white/80 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </div>

      <PageFooter />
    </main>
  );
}

function inputClassName(error?: string) {
  return `w-full rounded-lg border px-4 py-2.5 text-sm text-white bg-white/5 placeholder:text-white/20 outline-none transition-all focus:ring-2 focus:ring-white/20 focus:border-white/30 disabled:opacity-40 ${
    error ? "border-red-500/40 focus:ring-red-500/20" : "border-white/10"
  }`;
}

function FormField({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: keyof ContactForm;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-xs font-semibold text-white/60 tracking-wide">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <div className="flex justify-between items-center">
          {error && <p className="text-[10px] text-red-400/80 mt-0.5">{error}</p>}
          {hint && <span className="text-[10px] text-white/20 ml-auto">{hint}</span>}
        </div>
      )}
    </div>
  );
}

function SubmitButton({ onClick, isSending }: { onClick: () => void; isSending: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isSending}
      className={`group flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
        isSending ? "bg-white/10 text-white/20 cursor-not-allowed" : "bg-white text-black hover:bg-white/90"
      }`}
    >
      {isSending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Sending…
        </span>
      ) : (
        <>
          Send →
          <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function SentConfirmation({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center py-8 gap-5 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white mb-1 animate-pop-in">
        <CheckIcon className="w-6 h-6 text-black" />
      </div>
      <h2 className="text-2xl font-bold text-white">Message sent!</h2>
      <p className="text-white/40 text-sm max-w-sm">
        Your email client should have opened. If it didn&apos;t, please email us directly at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="underline underline-offset-2 text-white/70 font-medium hover:text-white transition-colors"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <button
        onClick={onReset}
        className="mt-2 px-5 py-2.5 rounded-lg border border-white/10 text-white/60 text-xs font-medium tracking-wide hover:text-white hover:border-white/25 hover:bg-white/5 transition-all"
      >
        Send another message
      </button>
    </div>
  );
}
