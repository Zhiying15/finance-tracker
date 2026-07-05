import axios from "axios";
import { attachInterceptors } from "@api/interceptors";

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Set VITE_API_URL in .env for production.
// Falls back to Spring Boot default for local dev.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/finance-tracker/api/v1";

// ─── JSON client ──────────────────────────────────────────────────────────────
// Used by all api/*.ts modules.
// withCredentials: true — required for HttpOnly cookie session (Spring Session).

export const client = axios.create({
  baseURL:         BASE_URL,
  timeout:         15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Upload client ────────────────────────────────────────────────────────────
// Separate instance for multipart/form-data file uploads.
// No Content-Type header — browser sets it automatically with the correct
// multipart boundary string when FormData is the request body.

export const uploadClient = axios.create({
  baseURL:         BASE_URL,
  timeout:         60_000,
  withCredentials: true,
});

// ─── Attach interceptors ──────────────────────────────────────────────────────
// Request logging + response error normalisation for both instances.

attachInterceptors(client);
attachInterceptors(uploadClient);