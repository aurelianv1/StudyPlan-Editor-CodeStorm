"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";

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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    subject: "",
    message: "",
  });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setFormState("sending");

    // Construct mailto link and open it
    const mailto = `mailto:support@yourapp.com?subject=${encodeURIComponent(
      `[${formData.subject}] from ${formData.name}`
    )}&body=${encodeURIComponent(formData.message)}`;

    try {
      window.location.href = mailto;
      // Simulate a brief delay then show success
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
    <main className="min-h-screen bg-neutral-50 px-4 py-16 font-sans">
      {/* Page header */}
      <div className="mx-auto max-w-2xl mb-10 text-center">
        <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase bg-black text-white rounded-full">
          Help &amp; Support
        </span>
        <h1 className="text-4xl font-bold text-black tracking-tight leading-tight mb-3">
          Get in Touch
        </h1>
        <p className="text-neutral-500 text-base leading-relaxed">
          Have a question, spotted a bug, or need help with the platform?
          <br />
          Fill in the form below and we'll get back to you as soon as possible.
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 shadow-md border-neutral-200">
          {formState === "sent" ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center py-10 gap-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black mb-2">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Message sent!</h2>
              <p className="text-neutral-500 text-sm max-w-sm">
                Your email client should have opened. If it didn't, please
                email us directly at{" "}
                <a
                  href="mailto:support@yourapp.com"
                  className="underline underline-offset-2 text-black font-medium"
                >
                  support@yourapp.com
                </a>
                .
              </p>
              <Button variant="secondary" size="md" onClick={handleReset}>
                Send another message
              </Button>
            </div>
          ) : formState === "error" ? (
            /* ── Error state ── */
            <div className="flex flex-col items-center py-10 gap-4 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-2">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">
                Something went wrong
              </h2>
              <p className="text-neutral-500 text-sm max-w-sm">
                We couldn't open your email client. Please email us directly at{" "}
                <a
                  href="mailto:support@yourapp.com"
                  className="underline underline-offset-2 text-black font-medium"
                >
                  support@yourapp.com
                </a>
                .
              </p>
              <Button variant="secondary" size="md" onClick={handleReset}>
                Try again
              </Button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-black"
                >
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
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black bg-white placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>
                )}
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="subject"
                  className="text-sm font-semibold text-black"
                >
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
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black bg-white placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50 ${
                    errors.subject
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300"
                  }`}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-sm font-semibold text-black"
                >
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
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black bg-white placeholder:text-neutral-400 outline-none transition-all focus:ring-2 focus:ring-black focus:border-black resize-none disabled:opacity-50 ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-neutral-300"
                  }`}
                />
                <div className="flex justify-between items-center mt-0.5">
                  {errors.message ? (
                    <p className="text-xs text-red-500">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-neutral-400 ml-auto">
                    {formData.message.length} chars
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-400">
                  Opens your default email client.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={formState === "sending"}
                  className="min-w-[110px]"
                >
                  {formState === "sending" ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    "Send →"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Direct email fallback */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Or email us directly at{" "}
          <a
            href="mailto:support@yourapp.com"
            className="text-black underline underline-offset-2 font-medium hover:text-neutral-700 transition-colors"
          >
            support@yourapp.com
          </a>
        </p>
      </div>
    </main>
  );
}