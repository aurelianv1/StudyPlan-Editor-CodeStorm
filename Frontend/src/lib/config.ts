/** Base URL of the FastAPI backend. Override with NEXT_PUBLIC_API_URL. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

/** Address used by the contact form. Override with NEXT_PUBLIC_SUPPORT_EMAIL. */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@yourapp.com";
