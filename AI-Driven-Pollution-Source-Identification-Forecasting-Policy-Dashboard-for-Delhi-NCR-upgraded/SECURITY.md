# Security Policy — NVY AI Delhi-NCR Air Quality Platform

## Built-in Security Controls
- **HTTP Security Headers (`vercel.json` & `server/middleware/security.ts`):** Strict Content-Security-Policy (`object-src 'none'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP, and CORP.
- **API Hardening (`server/routes/api.ts`):** Explicit origin allowlist CORS, sliding-window rate limiting (`429 Too Many Requests`), `100kb` JSON body limit, strict field allowlisting against mass-assignment, HTML entity escaping against XSS, and sanitized HTTP 500 error messages.
- **Secrets & Database Rules:** Zero hardcoded credentials in tracked files (`VITE_FIREBASE_*` injected via environment variables) and least-privilege `firestore.rules` with explicit default deny.

## Reporting a Vulnerability
Please open a private security advisory on GitHub or contact the repository maintainer before public disclosure.
