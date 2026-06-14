# KickLink Agent Notes

- Implement Phase 1 only unless explicitly approved to move beyond it.
- Keep `design-reference/` unchanged. It is product and visual reference material, not production code.
- Do not package the HTML prototype in a WebView.
- Keep statuses in shared `as const` arrays plus Zod enums; do not introduce native TypeScript enums.
- Keep event, registration, payment, refund, transfer, and waitlist/offer statuses independent.
- Guests belong to `registration_guests`; do not model them as authenticated users.
- Treat Supabase as the future source of truth. Do not calculate final capacity only on clients.
- No live payments, production push notifications, Supabase auth integration, or App Store configuration in Phase 1.
