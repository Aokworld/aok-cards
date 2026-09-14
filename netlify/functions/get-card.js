// Reads one kindness card from Airtable, two ways:
//   ?slug=<public-slug>   public read, unchanged shape — powers card.html.
//   ?edit=<private-token> private read for the builder's own rehydrate —
//                         powers index.html's ?edit= link. Never reachable
//                         from a slug lookup; a slug can never yield a token.
// Env: AIRTABLE_TOKEN, AIRTABLE_BASE_ID. Optional: AIRTABLE_TABLE.
// See CONTRACT.md at the repo root for the full request/response shape.

const TABLE = process.env.AIRTABLE_TABLE || "Organizations";

async function atFetch(url, tok){
  const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
  const j = await r.json().catch(()=>({}));
  return { ok: r.ok, status: r.status, json: j };
}

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN, base = process.env.AIRTABLE_BASE_ID;
  if (!token || !base) return { statusCode: 500, body: JSON.stringify({error:"Server not configured"}) };
  const qp = event.queryStringParameters || {};
  const slug = (qp.slug || "").replace(/['"\\]/g, "");
  const editTok = (qp.edit || "").replace(/['"\\]/g, "");

  if (slug) return await bySlug(slug, base, token);
  if (editTok) return await byEditToken(editTok, base, token);
  return { statusCode: 400, body: JSON.stringify({error:"missing slug or edit token"}) };
};

// ---- PUBLIC — unchanged from the version live today. Never returns a token,
// a recordId, or anything not meant for a public card page. ----
async function bySlug(slug, base, token){
  try {
    const formula = `{Public slug}='${slug}'`;
    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
    const r = await atFetch(url, token);
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error: (r.json.error && r.json.error.message) || "Airtable error"}) };
    const rec = (r.json.records || [])[0];
    if (!rec) return { statusCode: 404, body: JSON.stringify({error:"not found"}) };
    const f = rec.fields;
    const g = (n) => f[n] || "";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        name: g("Org name"), cat: g("Card category"), owner: g("Contact name"),
        city: g("City"), phone: g("Contact phone"), web: g("Website"),
        state: g("Kicker"), motto: g("Motto"), vision: g("Vision"), kind: g("Kindness statement"),
        photo2: g("Card 2 photo"), recv: g("Kindness received"), give: g("Kindness given"),
        why: g("Why we opened"), who: g("Who taught us kindness"), reg: g("A regular we'd miss"), house: g("House move"),
        photos3: g("Card 3 photos"), train: g("What we teach"), do: g("Kindness we do"), event: g("Yearly event"),
        emp_who: g("Employee of the month"), emp_for: g("Employee of the month — for"),
        cust_who: g("Customer of the month"), cust_for: g("Customer of the month — for"),
        host: g("Would host"), invite: g("Invite to the map"), gaz: g("Gazette interest"),
        logoUrl: g("Logo URL"), heroUrl: g("Hero photo URL"), gallery: g("Gallery photo URLs"),
        qTrend: g("Kindness trend"), qFourMin: g("Four minutes a day"), qDevices: g("Devices kinder"),
        qMeans: g("Kindness means (tap)"), qVisImp: g("Vision stated or implied"), qLocus: g("Kindness locus"),
        qBorn: g("Kindness born or learned"), qAudience: g("Kindness needs audience"), qAnon: g("Anonymous act"),
        anonShared: g("Anonymous act shared"), qMatters: g("What matters most"), qCohost: g("Co-host presence"),
        off: g("Card fields off"), rung: g("Rung"), status: g("Card status")
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
}

// ---- PRIVATE — new. Returns id/slug/editToken plus an explicit allowlisted
// subset of Airtable-named fields, matching what index.html's hydrate()
// expects (F["Org name"], F["Card category"], ...). Deliberately does NOT
// return the whole record: fields like Background note, Correction notes,
// or Reputation check notes are internal CRM/verification content about the
// organization, not something to hand back even on the org's own edit link. ----
const EDIT_SAFE_FIELDS = [
  "Org name","Card category","Category","Contact name","City","State","Contact phone","Website",
  "Motto","Kicker","Vision","Kindness statement",
  "Card 2 photo","Kindness received","Kindness given","Why we opened",
  "Who taught us kindness","A regular we'd miss","House move",
  "Card 3 photos","What we teach","Kindness we do","Yearly event",
  "Employee of the month","Employee of the month — for",
  "Customer of the month","Customer of the month — for",
  "Would host","Invite to the map","Gazette interest",
  "Logo URL","Logo URL (found)","Hero photo URL","Gallery photo URLs",
  "Card fields off",
  "Kindness trend","Four minutes a day","Devices kinder","Kindness means (tap)",
  "Vision stated or implied","Kindness locus","Kindness born or learned",
  "Kindness needs audience","Anonymous act","Anonymous act shared",
  "What matters most","Co-host presence","Questionnaire other","Questions answered",
  "Rung"
  // NOTE: intentionally excludes Public slug / Private edit token (returned
  // separately, top-level) and every CRM/outreach/verification field.
];

async function byEditToken(editTok, base, token){
  try {
    const formula = `{Private edit token}='${editTok}'`;
    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
    const r = await atFetch(url, token);
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error: (r.json.error && r.json.error.message) || "Airtable error"}) };
    const rec = (r.json.records || [])[0];
    if (!rec) return { statusCode: 404, body: JSON.stringify({error:"not found"}) };
    const f = rec.fields;
    const safeFields = {};
    EDIT_SAFE_FIELDS.forEach(n => { if (f[n] !== undefined) safeFields[n] = f[n]; });
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rec.id,
        slug: f["Public slug"] || "",
        editToken: f["Private edit token"] || "",
        fields: safeFields
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
}
