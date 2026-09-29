# GBMM-ACECS

This project (GMASS) is designed to be a Gmail-based mail merge and automated cold email campaign system (inspired by tools like GMass and Woodpecker).

Its core features encompass:

- Recipient Ingestion: Importing recipients from Google Sheets and CSV files.
- Personalization: Dynamic template merge fields.
- Email Pipeline: Sending via the Gmail API (OAuth) and SMTP fallback via Nodemailer.

- Engagement & Deliverability:
- Open pixel tracking, click redirects, and unsubscribe processing.
- Multi-step follow-up sequences with automatic reply and bounce detection.
- Anti-spam safeguards: Per-mailbox daily caps, randomized delays, and idempotent sends.

- Interfaces: Web application dashboard first (Next.js/React), with a Chrome extension planned for later phases.

This is a **Gmail-based cold email outreach automation platform** (similar to GMass, Lemlist, or Woodpecker).
