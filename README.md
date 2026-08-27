# A²OK Kindness Card — Rung 1 V1

A complete, free, live card system on your JavaScript / Netlify stack. No WordPress, no Elementor.

**What it does:** an organization fills a short form (`index.html`) → its data saves into your Airtable
Organizations table → it gets a public card at its own URL (`card.html?slug=…`). Add a record, a page renders.

## The pieces
- `index.html` — the client entry page (live preview as they type).
- `card.html` — the public card, rendered from Airtable by slug.
- `netlify/functions/save-card.js` — writes the form to Airtable (token stays server-side).
- `netlify/functions/get-card.js` — reads a card back by slug (token stays server-side).
- `netlify.toml` — tells Netlify where the functions live.

## Deploy — about 15 minutes, all free

**1. Have the Airtable base.** Import the three schema CSVs (per `A2OK_Airtable_Setup_Steps`), or at minimum an
**Organizations** table with these fields: `Org name`, `City`, `State`, `Website`, `Kicker`,
`Kindness statement`, `Story or memory`, `Public slug`, `Rung`, `Card status`.

**2. Get two values from Airtable:**
   - **Base ID** — open the base, go to Help → API documentation (or airtable.com/api); it looks like `appXXXXXXXXXXXXXX`.
   - **Personal Access Token** — airtable.com/create/tokens → give it scopes `data.records:read` and
     `data.records:write`, and access to this base. It looks like `patXXXXXXXXXXXXXX`.

**3. Deploy to Netlify (free):**
   - Drag this whole folder onto app.netlify.com (Sites → Add new site → Deploy manually), **or** push it to a
     GitHub repo and connect it.
   - In the site's **Settings → Environment variables**, add:
     - `AIRTABLE_TOKEN` = your `pat…` token
     - `AIRTABLE_BASE_ID` = your `app…` base id
     - (optional) `AIRTABLE_TABLE` = `Organizations` (already the default)
   - Redeploy so the variables take effect.

**4. Use it:**
   - The entry form is your site's home page.
   - Submitting writes a row to Airtable and returns a link like `…/card.html?slug=rosemont-community-theatre-a1b2`.
   - That link is the org's public card. Editing the record in Airtable updates the card.

## Notes
- The Airtable token is only ever used inside the two functions on the server — never exposed in the browser.
- This is **Rung 1** (identity + motto + what-kindness-means + one act). Rungs 2–4 add more fields and photos on
  the same pattern: add the fields to the form and to `card.html`, and they flow through the same functions.
- Free tier all the way: Airtable free plan, Netlify free plan (functions included).

Signed, as always — Harvey · A²OK World.
