# KBN Restaurant

Mobile-first Bengali restaurant website in **yellow, white and black**, featuring categories, search, bilingual labels, cart and WhatsApp ordering.

## Preview locally
Serve this directory through a static HTTP server (opening the HTML as a file may block fetch requests):

```bash
python3 -m http.server 8080
```

Open http://localhost:8080.

## Setup
1. Edit `config.json`: set real phone number, **WhatsApp number in international format**, address, opening hours, and optional Google Maps URL.
2. Edit `menu.csv` in Excel or Google Sheets. Columns: `id,category,name_en,name_bn,description,price,available,image_url`. Keep unique IDs; `available` is `yes` or `no`.
3. To use a Google Sheet as the live menu, publish/export its **menu tab as CSV** and put the public CSV URL into `config.json` under `sheetCsvUrl`. Only publish menu data: never put personal or sensitive information in the public sheet. Google Sheets publishing and CORS must allow browser access. If not, deploy a simple proxy or export the sheet as menu.csv instead.
4. Add the provided KBN logo image as `assets/kbn-logo.png` to replace the temporary text-only header.
5. Deploy with Cloudflare Pages: connect the GitHub repository, framework **None**, build command empty, output directory `/` (repository root).

## What the MVP does
- English/Bangla UI labels and bilingual food names
- Category tabs and text search
- Quantity controls, availability handling and session-based cart
- WhatsApp checkout with an itemized, prefilled order message
- Contact, call and Google Maps directions
- Works on mobile and desktop; no server/database required

## Important
- **Prices, photos, contact details and menu items are illustrative placeholders**, not verified KBN Restaurant information.
- Orders are **not placed or recorded automatically**. Customer must tap **Send** inside WhatsApp. Never show an automatic order confirmation.
- Publishing to GitHub **does not deploy a live site**. Cloudflare Pages connection is a separate step.
- The repo does not yet contain the image logo; supply it at `assets/kbn-logo.png`.


## KBN Google Sheets database (created 2026-11-04)

- Editable database: https://docs.google.com/spreadsheets/d/1Lb1q6TPS1ccpvId6BT93ew5cyWcMDEQtEpOK-6vi97g/edit
- Menu tab name: `Menu Items`; numeric tab ID: `1326610010`
- Additional tabs: Categories, Restaurant Settings, Instructions.
- The database contains *sample* items/prices; do not represent them as confirmed dishes.

### Complete live connection safely

GitHub Pages cannot access a private Google Sheet anonymously. Publishing the entire database could expose other tabs, so publish **only** the `Menu Items` tab:

1. Open the database → **File → Share → Publish to web**.
2. Select **Menu Items** (not Entire Document) and output format **Comma-separated values (.csv)**; click **Publish**.
3. Copy the generated published CSV URL. Test it in a private/incognito browser: it should display CSV without requiring a Google sign-in.
4. Paste that exact URL into `config.json` as `sheetCsvUrl`. Existing site reads the published sheet on page load.
5. Update real restaurant phone, WhatsApp, address and opening hours. Review menu prices before launching customer orders.

**Security:** The menu tab is public once published. Never store phone numbers of customers, passwords, private notes, costs or personal details in the published menu tab.

**Limitations:** Google Sheet publishing is eventually consistent, and changes may take a few minutes to become public. Browser access to a specific Google publication URL may be affected by CORS; if it cannot be fetched, use a public CSV proxy or publish a static `menu.csv` export to this repository. Do not assume connection works until it is tested in the browser.
