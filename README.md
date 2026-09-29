<div align="center">
  <img src="./images/logo.svg" alt="ACECS Logo" width="96" height="96" />
  <h1>ACECS</h1>
  <p><strong>Automated Cold Email & Campaign System (GBMM-ACECS)</strong></p>
  <p>An enterprise-grade, Gmail-based cold outreach automation platform built for high deliverability, dynamic personalization, and multi-step sequence execution.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=flat&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-Express-green?style=flat&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/Prisma-6-indigo?style=flat&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-ioredis-red?style=flat&logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

---

## 📌 Overview

**ACECS (GBMM-ACECS)** is a modern cold email outreach and mail merge platform inspired by GMass, Woodpecker, and Lemlist. Built to scale outbound communications safely, ACECS connects directly to Gmail via Google OAuth with intelligent fallback to custom SMTP servers, ensuring your emails reach the primary inbox rather than the spam folder.

Whether managing personalized outreach to 50 prospective clients or running automated drip campaigns across multiple sender mailboxes, ACECS guarantees send idempotency, tracking accuracy, and deliverability protection.

---

## 🚀 Key Features

### 📨 1. Recipient Ingestion & Dynamic Personalization

- **Spreadsheet & CSV Import**: Ingest recipient lists directly from Google Sheets or uploaded CSVs with automatic field mapping.
- **Dynamic Merge Tags**: Personalize subject lines and email bodies with arbitrary recipient variables (e.g., `{{firstName}}`, `{{company}}`, `{{customField}}`).
- **Contact Deduplication & Validation**: Filter duplicate addresses and invalid email syntaxes before campaign launch.

### ⚡ 2. High-Deliverability Sending Pipeline

- **Gmail API (OAuth 2.0)**: Native integration with Google Workspace and Gmail accounts for authorized, authentic message transmission.
- **Custom SMTP Fallback**: Support for self-hosted or dedicated transactional SMTP relays (via Nodemailer) with automated SSRF protection.
- **Per-Mailbox Quotas**: Enforce strict daily sending caps per connected mailbox to preserve sender reputation and domain health.
- **Humanized Jitter & Delays**: Randomized time intervals between dispatches to mimic genuine human typing and sending patterns.

### 📊 3. Engagement & Conversion Tracking

- **Zero-Latency Open Pixel**: Lightweight tracking pixel embedded into HTML payloads for accurate real-time open detection.
- **Privacy-Safe Link Redirects**: Custom redirect tracking for links clicked inside your outreach campaigns.
- **Automatic Unsubscribe Handling**: RFC-compliant `List-Unsubscribe` headers and customizable one-click footer links that automatically update suppression lists.

### 🔄 4. Multi-Step Follow-Up Sequences & Reply Detection

- **Automated Drip Follow-ups**: Schedule automated follow-up sequences in the same email thread.
- **Intelligent Reply Detection**: Automatically halts upcoming follow-up steps when a recipient replies, preventing awkward duplicate outreach.
- **Bounce & Error Processing**: Detect hard/soft bounces and isolate troubled accounts automatically.

### 🛡️ 5. Industrial-Grade Security & Architecture

- **Opaque Database-Backed Sessions**: State-of-the-art token hashing with SHA-256; no client-side JWT secrets.
- **Double-Submit CSRF Challenge**: High-security browser challenge mechanism backed by atomic Redis Lua verification scripts.
- **Rate-Limiting Middleware**: Sliding-window rate limiters guarding all sensitive authentication and campaign dispatch endpoints.
- **AES-256-GCM Encryption**: Secure at-rest encryption for sensitive OAuth tokens, mailbox credentials, and refresh keys.

---
