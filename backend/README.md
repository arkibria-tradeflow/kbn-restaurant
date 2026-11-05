# KBN Restaurant — Direct Order Submission + Confirmation Slip

## New live workflow (November 2026)

Website checkout: **Order now → Apps Script saves the order to the private Orders Sheet → server-confirmed order slip → optional WhatsApp sharing**.

- The customer does **not** need access to the Google Sheet.
- The WhatsApp share button appears only on a **successful server-generated receipt**. It does not submit the order again.
- The website now has `config.orderApiUrl` set to the previously provided Apps Script `/exec` URL.
- A regular cross-origin HTML form POST is used (no client-side false-success state, no CORS-dependent fetch).
- The backend checks the submitted cart against current Menu Sheet prices and prevents duplicates using `requestId`.

## REQUIRED: publish the updated Apps Script receipt

Updating `backend/Code.gs` in GitHub does **not** update a deployed Google Apps Script.

1. Open the **private Orders Dashboard**: https://docs.google.com/spreadsheets/d/18oODmgnzwak5XsszFbB67rG3qat1lDroua8V0BTq2V8/edit
2. Open **Extensions → Apps Script**, replace the project’s `Code.gs` with the **entire updated** [backend/Code.gs](./Code.gs) and **Save**.
3. Choose **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Keep the existing Web App deployment, **Execute as: Me**, **Who has access: Anyone**. This preserves the `/exec` URL already configured on the website.
4. Confirm by placing **one genuine test order** on the mobile website (valid phone + GPS or address). On success, see the formatted receipt and optional WhatsApp button; confirm an entry in private `Orders` tab. Test **no GPS permission** with manual address as a second case. Do not assume the order is saved without the server’s success receipt and matching Sheet row.

The existing `/exec` URL configured in `config.json`:
`https://script.google.com/macros/s/AKfycbxIWAWnvzXq8DlbaBYf1jQ0ddUEL2G-kKwvud5LjNRxnThvaGpkWaG-5CesBxbnZCXm/exec`

If Apps Script returns an error receipt, the customer can go back to retry; the site retains cart details in the current browser session. On successful receipt, **নতুন অর্ডার করুন** returns to `?newOrder=1` and clears the previous cart/request token before another purchase.

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
- Google Apps Script quotas and availability apply. The receipt page is hosted on Google Apps Script after submission; customers are not required to have Google accounts.
- Keep the Orders Sheet private, and share only with authorized restaurant staff; it contains phone numbers and map links.
- Direct checkout now requires a reachable Apps Script web app. If it is unavailable, do **not** treat the order as submitted; contact the restaurant.
- If customers change items in the cart, a new request ID is generated. Retry of the same request ID returns the existing order rather than appending a duplicate.

**Do not** place a WA token, access key, or spreadsheet ownership credential in `config.json` or any public GitHub file.
