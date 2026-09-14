# aok-cards backend contract

Kept here so front-end and backend can never quietly drift apart again.
If you change either side, update this file in the same commit.

## POST /.netlify/functions/save-card

Request body: `{ recordId?, editToken?, fields }` — `fields` is a flat object
keyed by **Airtable field name** (e.g. `"Org name"`, `"Kindness received"`).
Unknown keys are silently dropped against a server-side allowlist; a stray
field name never fails the whole save.

Record lookup, in this order, first match wins:
1. `recordId` — but only if that record's own `Private edit token` matches
   the `editToken` sent alongside it. A wrong/guessed recordId is ignored,
   not trusted.
2. `editToken` alone — the org arrived on its private edit link.
3. First save only (no recordId, no editToken): an **exact** `Org name`
   match with **no `Public slug` yet** — the researched-organization
   adoption rule. A row that already has a slug is never adopted.
4. None of the above: create a brand-new record.

Server always computes `Rung` — never trusts a client-sent value.
`Card status` only ever advances forward on autosave (blank/Draft →
Submitted); it never regresses a record a human has already moved to
In review / Approved-Live / Needs changes.

Response: `{ id, slug, editToken, rung }`.

## GET /.netlify/functions/get-card

**`?slug=<public-slug>`** — public, unchanged since the original deploy.
Powers `card.html`. Returns a flat, already-renamed object (`name`, `cat`,
`owner`, …). Never includes a token or recordId.

**`?edit=<private-token>`** — private, powers `index.html`'s own rehydrate.
Returns `{ id, slug, editToken, fields }` where `fields` uses Airtable's own
column names (matching what `save-card` accepts), restricted to an explicit
safe-field allowlist — never the raw record. CRM/verification fields
(Background note, Correction notes, Reputation check notes, etc.) are never
returned here even though it's the org's own record.

## The off-list ID translation

`index.html`'s internal field ids (`k_helped`, `who_taught`, `teach_new`, …)
differ from the ids `card.html` checks to decide what's hidden (`b_recv`,
`b_who`, `b_train`, …). `save-card.js` translates one to the other before
writing `Card fields off`, so a block an org switches off actually stays
hidden on the public card. See `OFF_ID_MAP` in `save-card.js`.

## Fields not yet in Airtable

`Symbol choices` does not exist as a column yet. It is deliberately absent
from both allowlists. Once added (Long text), add the exact column name to
both `ALLOW` (save-card.js) and `EDIT_SAFE_FIELDS` (get-card.js), and point
`PENDING.symbolChoices` in `index.html` at the same name.
