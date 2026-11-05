# KBN Restaurant — Activate Order Submission

The mobile accordion checkout and the PRIVATE restaurant Orders Dashboard have been created.

- Website: https://arkibria-tradeflow.github.io/kbn-restaurant/
- Order Dashboard (Google Sheets, private): https://docs.google.com/spreadsheets/d/18oODmgnzwak5XsszFbB67rG3qat1lDroua8V0BTq2V8/edit
- Server source: [Code.gs](./Code.gs)
- Menu data source: https://docs.google.com/spreadsheets/d/1Lb1q6TPS1ccpvId6BT93ew5cyWcMDEQtEpOK-6vi97g/edit

## Activate the backend (one-time owner authorization)

1. Sign into **smile.kibria@gmail.com**. Open the **Order Dashboard** Google Sheet.
2. Open **Extensions → Apps Script**. This creates a script bound to that *private Orders spreadsheet* (not the public menu Sheet).
3. Replace the starter `Code.gs` contents with the complete code from [this repository's Code.gs](./Code.gs), then **Save**.
4. At the top, choose the `doGet` function and click **Run**, then authorize the script to access your two spreadsheets. Inspect permissions before approving. This is your own script; no third-party service or shared credentials are required for initial order storage.
5. Choose **Deploy → New deployment → Web app**; set **Execute as: Me** and **Who has access: Anyone** (required if customers order without Google login). Click Deploy. The `/exec` URL should look like `https://script.google.com/macros/s/.../exec`.
6. Copy the URL. Set `orderApiUrl` in the website's `config.json` to that URL. The URL is a public *order submission endpoint*, NOT a dashboard link. Never paste your Google or Meta API secrets into the GitHub repository.
7. Test from a phone: open the website, add two dishes, enter a phone number, tap GPS and grant permission, submit; check the receipt and a new row in the private Orders tab. Test permission denial, manual address, invalid phone, duplicate submission and status changes. Do not promote this to a live ordering workflow until this end-to-end test succeeds.

### What works after step 6

- Accordion order summary, delivery form, optional GPS or manual address, order review
- Browser POST to the Web App (no WhatsApp send from customer)
- Server-side menu lookup and price recalculation, duplicate request ID check
- Private Orders spreadsheet row saved before notification
- Order confirmation receipt with order ID
- Status dropdowns, summary formulas and status change events

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
- The temporary WhatsApp ordering fallback is shown **only while** `orderApiUrl` is blank, so customers can still order before the backend is activated. It disappears once the backend URL is configured.
- If customers change items in the cart, a new request ID is generated. Retry of the same request ID returns the existing order rather than appending a duplicate.

**Do not** place a WA token, access key, or spreadsheet ownership credential in `config.json` or any public GitHub file.
