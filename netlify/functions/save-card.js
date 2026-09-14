// Writes one kindness card (Cards 1-3 + Questionnaire v2) to Airtable.
// The Airtable token stays here on the server, never in the browser.
// Env vars required: AIRTABLE_TOKEN, AIRTABLE_BASE_ID. Optional: AIRTABLE_TABLE.
//
// See CONTRACT.md at the repo root for the full request/response shape.

const TABLE = process.env.AIRTABLE_TABLE || "Organizations";

function s(v){ return (typeof v === "string" ? v : (v==null ? "" : String(v))).trim(); }
function nonEmpty(v){ return s(v).length > 0; }
function token6(){ return Math.random().toString(36).slice(2,10); }
function slugBase(name){
  return (name||"org").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "org";
}

async function atFetch(path, opts, tok){
  const r = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", ...(opts&&opts.headers) }
  });
  const j = await r.json().catch(()=>({}));
  return { ok: r.ok, status: r.status, json: j };
}

async function slugTaken(slug, base, tok){
  const url = `${base}/${encodeURIComponent(TABLE)}?maxRecords=1&fields%5B%5D=Public%20slug`
    + `&filterByFormula=${encodeURIComponent(`{Public slug}='${slug.replace(/'/g,"\\'")}'`)}`;
  const r = await atFetch(url, {}, tok);
  return r.ok && r.json.records && r.json.records.length > 0;
}
async function uniqueSlug(name, base, tok){
  const b = slugBase(name);
  let slug = b, n = 2;
  while (await slugTaken(slug, base, tok) && n < 100) { slug = b + "-" + n; n++; }
  return slug;
}

// ---- Allowlist: every field name here was confirmed against the live Airtable
// schema (base appLuU14CtYs7nAcY, table Organizations) on 2026-09-14. Anything
// NOT in this list is dropped, never forwarded, so a stray or future field name
// can never fail an organization's save with a 422 from Airtable. ----
const ALLOW = new Set([
  // Card 1 — identity
  "Org name","Card category","Contact name","City","State","Contact phone","Website",
  "Motto","Kicker","Vision","Kindness statement",
  // Card 2 — voice
  "Card 2 photo","Kindness received","Kindness given","Why we opened",
  "Who taught us kindness","A regular we'd miss","House move",
  // Card 3 — participation
  "Card 3 photos","What we teach","Kindness we do","Yearly event",
  "Employee of the month","Employee of the month — for",
  "Customer of the month","Customer of the month — for",
  "Would host","Invite to the map","Gazette interest",
  // uploaded images
  "Logo URL","Hero photo URL","Gallery photo URLs",
  // system / toggles
  "Card fields off",
  // Questionnaire v2
  "Kindness trend","Four minutes a day","Devices kinder","Kindness means (tap)",
  "Vision stated or implied","Kindness locus","Kindness born or learned",
  "Kindness needs audience","Anonymous act","Anonymous act shared",
  "What matters most","Co-host presence","Questionnaire other","Questions answered"
  // NOTE: "Symbol choices" is deliberately NOT here. The column does not exist
  // in Airtable yet. Add it to the base, then add the exact column name to
  // this set — nothing else needs to change, the client already sends it
  // under whatever key you name the column, once PENDING.symbolChoices in
  // index.html is pointed at that same name.
]);

// card.html (untouched, public-facing) checks a DIFFERENT id vocabulary than
// the builder's internal field ids for "which blocks are switched off". This
// table translates one to the other so a hidden block actually stays hidden.
const OFF_ID_MAP = {
  kindness_meaning: "v_kind",
  vision: "v_vision",
  k_helped: "b_recv",
  k_gave: "b_give",
  why_open: "b_why",
  who_taught: "b_who",
  regular_miss: "b_reg",
  house_move: "b_house",
  teach_new: "b_train",
  regular_kindness: "b_do",
  annual_event: "b_event",
  host_small: "b_host",
  who_else: "b_invite",
  gazette: "c_gaz"
};
function translateOffList(raw){
  return s(raw).split(",").map(x=>x.trim()).filter(Boolean)
    .map(id => OFF_ID_MAP[id] || id)
    .join(",");
}

// Rung is always computed server-side from the field-name-keyed record, never
// trusted from the client.
function computeRung(f){
  const identity = nonEmpty(f["Org name"]);
  const r2 = ["Kindness received","Kindness given","Why we opened","Who taught us kindness",
              "A regular we'd miss","House move"].filter(k=>nonEmpty(f[k])).length;
  const r3 = ["What we teach","Kindness we do","Yearly event","Would host","Invite to the map",
              "Employee of the month","Customer of the month"].filter(k=>nonEmpty(f[k])).length;
  if (identity && r2 >= 2 && r3 >= 2) return "3 Dressed Up";
  if (identity && r2 >= 2) return "2 Starter";
  return "1 Free Flag";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({error:"Method not allowed"}) };
  const tok = process.env.AIRTABLE_TOKEN, baseId = process.env.AIRTABLE_BASE_ID;
  if (!tok || !baseId) return { statusCode: 500, body: JSON.stringify({error:"Server not configured (missing AIRTABLE_TOKEN / AIRTABLE_BASE_ID)"}) };
  try {
    const body = JSON.parse(event.body || "{}");
    const incoming = body.fields || {};
    const recordIdIn = s(body.recordId);
    const editTokenIn = s(body.editToken);

    if (!nonEmpty(incoming["Org name"])) {
      return { statusCode: 400, body: JSON.stringify({error:"Organization name is required"}) };
    }

    // ---- filter to the allowlist ----
    const clean = {};
    Object.keys(incoming).forEach(k=>{ if (ALLOW.has(k)) clean[k] = incoming[k]; });
    if (nonEmpty(clean["Card fields off"])) clean["Card fields off"] = translateOffList(clean["Card fields off"]);

    const tableUrl = `${baseId}/${encodeURIComponent(TABLE)}`;

    // ---- three-way lookup, in order ----
    let targetId = null, existingToken = "", existingSlug = "", existingStatus = "";

    if (recordIdIn) {
      // (a) explicit recordId — but verify the caller actually holds this
      // card's private token before trusting it, so a guessed/incorrect
      // recordId can never patch someone else's card.
      const r = await atFetch(`${tableUrl}/${encodeURIComponent(recordIdIn)}`, { method:"GET" }, tok);
      if (r.ok && r.json.fields && s(r.json.fields["Private edit token"]) === editTokenIn && editTokenIn) {
        targetId = recordIdIn;
        existingToken = r.json.fields["Private edit token"] || "";
        existingSlug  = r.json.fields["Public slug"] || "";
        existingStatus = r.json.fields["Card status"] || "";
      }
      // if verification fails, fall through to the other lookups rather than
      // erroring outright — a stale/mismatched recordId shouldn't block a save.
    }

    if (!targetId && editTokenIn) {
      // (b) a "Private edit token" — the org arrived on its private link
      const formula = encodeURIComponent(`{Private edit token}='${editTokenIn.replace(/'/g,"\\'")}'`);
      const r = await atFetch(`${tableUrl}?maxRecords=1&filterByFormula=${formula}`, { method:"GET" }, tok);
      if (r.ok && r.json.records && r.json.records.length){
        const rec = r.json.records[0];
        targetId = rec.id;
        existingToken = rec.fields["Private edit token"] || "";
        existingSlug  = rec.fields["Public slug"] || "";
        existingStatus = rec.fields["Card status"] || "";
      }
    }

    if (!targetId && !recordIdIn && !editTokenIn) {
      // (c) first save only: adopt an exact Org name match that has NO public
      // slug yet — the researched-organizations funnel. Never adopt a row
      // that already has a slug (that would let a stranger typing the same
      // name overwrite a live card).
      const nameEsc = clean["Org name"].replace(/'/g,"\\'");
      const formula = encodeURIComponent(`AND({Org name}='${nameEsc}',{Public slug}='')`);
      const r = await atFetch(`${tableUrl}?maxRecords=1&filterByFormula=${formula}`, { method:"GET" }, tok);
      if (r.ok && r.json.records && r.json.records.length){
        const rec = r.json.records[0];
        targetId = rec.id;
        existingToken = rec.fields["Private edit token"] || "";
        existingSlug  = rec.fields["Public slug"] || "";
        existingStatus = rec.fields["Card status"] || "";
      }
    }

    const rung = computeRung(clean);
    const fields = { ...clean, "Rung": rung };

    // Card status only ever advances forward on autosave — never regress a
    // record a human has already moved to "In review" / "Approved/Live" /
    // "Needs changes" back down to "Submitted" just because the org kept typing.
    if (!existingStatus || existingStatus === "Draft") fields["Card status"] = "Submitted";
    else delete fields["Card status"];

    let result;
    if (targetId) {
      // ---- PATCH the existing record ----
      const r = await atFetch(`${tableUrl}/${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        body: JSON.stringify({ fields, typecast: true })
      }, tok);
      if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error:(r.json.error&&r.json.error.message)||"Airtable error"}) };
      // a first-time adoption (found by name, no slug yet) still needs a slug + token minted
      let slug = existingSlug, editToken = existingToken;
      if (!nonEmpty(slug)) {
        slug = await uniqueSlug(clean["Org name"], baseId, tok);
        editToken = editToken || token6();
        const r2 = await atFetch(`${tableUrl}/${encodeURIComponent(targetId)}`, {
          method: "PATCH",
          body: JSON.stringify({ fields: { "Public slug": slug, "Private edit token": editToken }, typecast: true })
        }, tok);
        if (!r2.ok) return { statusCode: r2.status, body: JSON.stringify({error:(r2.json.error&&r2.json.error.message)||"Airtable error"}) };
      }
      result = { id: targetId, slug, editToken, rung };
    } else {
      // ---- create a brand-new record ----
      const slug = await uniqueSlug(clean["Org name"], baseId, tok);
      const editToken = token6();
      fields["Public slug"] = slug;
      fields["Private edit token"] = editToken;
      fields["Card status"] = "Submitted";
      const r = await atFetch(`${tableUrl}`, {
        method: "POST",
        body: JSON.stringify({ fields, typecast: true })
      }, tok);
      if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error:(r.json.error&&r.json.error.message)||"Airtable error"}) };
      result = { id: r.json.id, slug, editToken, rung };
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
};
