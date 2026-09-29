# Jonezie Order Capture Worker

This staging service makes the order database the source of truth. It stores an
order request before the browser displays success, then sends merchant and
customer notifications asynchronously. Notification failures remain in D1 and
are retried by the scheduled Worker.

## Security model

- Full order and customer data is stored in D1, not Google Analytics.
- Browser requests are accepted only from configured origins.
- Production refuses order submissions unless Turnstile is configured.
- Admin reads require a bearer token stored as a Worker secret.
- Order IDs are idempotency keys, so browser retries do not create duplicates.
- Email API keys and admin tokens must be Worker secrets, never site JavaScript.

## Required Cloudflare setup

1. Copy `wrangler.example.jsonc` to `wrangler.jsonc`.
2. Create a staging D1 database and replace the placeholder database ID.
3. Apply `schema.sql` to the staging database.
4. Add these secrets to the Worker:
   - `RESEND_API_KEY`
   - `ADMIN_API_TOKEN`
   - `TURNSTILE_SECRET`
5. Set `TURNSTILE_SITE_KEY` in the staging site configuration when the checkout
   widget integration is enabled.
6. Verify the notification sender domain in the email provider.
7. Deploy the Worker to staging and set `durableEndpoint` in the staging copy of
   `order-request-config.js`.

Production must keep `durableEndpoint` empty until staging capture, duplicate,
notification, retry, admin-read, mobile checkout, and fallback tests pass.

## API

### Capture an order

`POST /api/order-requests`

The body is the existing checkout order payload plus `turnstileToken` when
Turnstile is configured. A successful response means the order is stored, not
merely that an email attempt started.

### Read captured orders

`GET /api/admin/order-requests?limit=50`

Send `Authorization: Bearer <ADMIN_API_TOKEN>`. This endpoint returns the saved
payload and notification status. It is intended for a protected internal tool,
not a public browser link.

### Health check

`GET /health`

## Local tests

Run from the repository root:

```powershell
node --test order-capture-worker/test/worker.test.mjs
```
