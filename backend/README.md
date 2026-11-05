# KBN Restaurant — Direct Order Submission + Confirmation Slip

## New live workflow (November 2026)

Website checkout: **Order now → hidden form POST to Apps Script → read-only status check confirms the saved Sheet row → KBN's own mobile Order Slip → optional WhatsApp share**.

- The customer does **not** need access to the Google Sheet.
- The WhatsApp share button appears only after **server-verified order storage**; sharing never submits an order again.
- The website stays at arkibria-tradeflow.github.io, and the KBN Mobile Layout remains active.
- A hidden, cross-origin HTML form POST submits the order; a separate **read-only JSONP status request** confirms it from the private Sheet.
- The backend checks the submitted cart against current Menu Sheet prices and prevents duplicates using a high-entropy Request ID.
- The status endpoint returns **no personal data** (no phone, name, address or GPS); these remain in the current browser session.

## REQUIRED: publish the updated Apps Script backend

Updating `backend/Code.gs` in GitHub does **not** update a deployed Google Apps Script.

1. Open the **private Orders Dashboard**: https://docs.google.com/spreadsheets/d/18oODmgnzwak5XsszFbB67rG3qat1lDroua8V0BTq2V8/edit
2. Open **Extensions → Apps Script**, replace the project’s `Code.gs` with the **entire updated** [backend/Code.gs](./Code.gs) and **Save**.
3. Choose **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Keep the existing Web App deployment, **Execute as: Me**, **Who has access: Anyone**. This preserves the `/exec` URL already configured on the website.
4. Place **one real test order** on the mobile site (valid phone + GPS or manual address). The mobile URL must **remain on KBN GitHub Pages**; the KBN-formatted Order Slip and optional WhatsApp button appear only after the website checks the matching Order ID in the private `Orders` tab.
5. Test disabled GPS, rejected/invalid input, interrupted network, **Check order status**, and safe retry. Never interpret an unverified request as a saved order.

**Important:** If the old Apps Script version is still deployed, the website will display an Order Confirmation Service error **before sending**. This prevents creating orders the site cannot verify. Do not expect new checkout flow to work until the backend is redeployed.

The existing `/exec` URL configured in `config.json`:
`https://script.google.com/macros/s/AKfycbxIWAWnvzXq8DlbaBYf1jQ0ddUEL2G-kKwvud5LjNRxnThvaGpkWaG-5CesBxbnZCXm/exec`

When status cannot be verified, the customer stays on the KBN website and can check status again or resend the **same** Request ID (backend deduplicates it). On successful on-site receipt, **নতুন অর্ডার করুন** clears the previous cart/request token and returns to the KBN Menu. The Apps Script HTML receipt remains a fallback, not the usual customer screen.

## Existing deployment and security notes

### WhatsApp automation (optional second activation)

WhatsApp does **not** send automatically without Meta WhatsApp Cloud API, a Meta-approved *utility template* and a consenting destination number.

In Apps Script, configure **Project settings → Script properties**:
- `WA_TOKEN` = Cloud API access token (private secret; never commit to GitHub)
- `WA_PHONE_ID` = Meta WhatsApp sender phone-number ID
- `WA_ALERT_TO` = opted-in restaurant recipient, international digits only
- `WA_TEMPLATE_NAME` = approved order-alert template
- `WA_TEMPLATE_LANG` = e.g. `en_US`
- `WA_OPTIN_CONFIRMED` = `true` only after opt-in

The suggested template has 4 text parameters: order ID; item lines; total; phone + location. Verify the actual approved template component layout before activation. Failed or unconfigured alerts are logged in the private Orders sheet and **do not remove the order**.

### Safety & limitations

- Anyone-access web apps are public write endpoints. This MVP validates phone/address/items, recalculates totals from the menu, throttles repeated phone submissions, uses a honeypot and prevents duplicate request IDs. Those measures do not stop all spam; consider CAPTCHA and managed rate limiting for heavy public use.
- Google Apps Script quotas and availability apply. The customer receipt appears inside the KBN website after read-only status verification; Apps Script's HTML receipt is only a fallback.
- Keep the Orders Sheet private, and share only with authorized restaurant staff; it contains phone numbers and map links.
- Direct checkout now requires a reachable Apps Script web app. If it is unavailable, do **not** treat the order as submitted; contact the restaurant.
- Once an order is submitted, its exact request payload and Request ID are retained in this browser session for safe retry; starting a new order resets the identifier.

**Do not** place a WA token, access key, or spreadsheet ownership credential in `config.json` or any public GitHub file.
