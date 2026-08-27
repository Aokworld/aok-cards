// Writes one kindness card (Cards 1–3) to Airtable. The Airtable token stays here on
// the server, never in the browser. Env vars required: AIRTABLE_TOKEN, AIRTABLE_BASE_ID.
const TABLE = process.env.AIRTABLE_TABLE || "Organizations";

function slugBase(name){
  return (name||"org").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "org";
}
function token6(){ return Math.random().toString(36).slice(2,10); }
function s(v){ return (typeof v === "string" ? v : (v==null ? "" : String(v))).trim(); }
function nonEmpty(v){ return s(v).length > 0; }

// True if a card with this exact Public slug already exists. On any lookup failure we
// return false (don't block a save over a flaky check).
async function slugTaken(slug, tok, base){
  try {
    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}`
      + `?maxRecords=1&fields%5B%5D=Public%20slug`
      + `&filterByFormula=${encodeURIComponent(`{Public slug}='${slug}'`)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${tok}` } });
    if (!r.ok) return false;
    const j = await r.json();
    return !!(j.records && j.records.length);
  } catch (e) { return false; }
}
async function uniqueSlug(name, tok, base){
  const b = slugBase(name);
  let slug = b, n = 2;
  while (await slugTaken(slug, tok, base) && n < 100) { slug = b + "-" + n; n++; }
  return slug;
}

// Which rung the answers unlock. Card 1 = identity. Card 2 = 2+ of its stories.
// Card 3 = Card 2 met AND 2+ Card-3 answers. Card 4 (All In) is promoted by a human only.
function computeRung(d){
  const identity = nonEmpty(d.name);
  const r2 = ["recv","give","why","who","reg","house"].filter(k => nonEmpty(d[k])).length;
  const r3 = ["train","do","event","host","invite","emp_who","cust_who"].filter(k => nonEmpty(d[k])).length;
  if (identity && r2 >= 2 && r3 >= 2) return "3 Dressed Up";
  if (identity && r2 >= 2) return "2 Starter";
  return "1 Free Flag";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({error:"Method not allowed"}) };
  const tok = process.env.AIRTABLE_TOKEN, base = process.env.AIRTABLE_BASE_ID;
  if (!tok || !base) return { statusCode: 500, body: JSON.stringify({error:"Server not configured (missing AIRTABLE_TOKEN / AIRTABLE_BASE_ID)"}) };

  try {
    const d = JSON.parse(event.body || "{}");
    if (!nonEmpty(d.name)) return { statusCode: 400, body: JSON.stringify({error:"Organization name is required"}) };

    const slug = await uniqueSlug(d.name, tok, base);
    const off = Array.isArray(d.off) ? d.off.join(",") : "";

    const fields = {
      // Card 1 — identity (evergreen)
      "Org name": s(d.name),
      "Card category": s(d.cat),
      "Contact name": s(d.owner),
      "City": s(d.city),
      "Contact phone": s(d.phone),
      "Website": s(d.web),
      "Kicker": s(d.state),
      "Motto": s(d.motto),
      "Vision": s(d.vision),
      "Kindness statement": s(d.kind),
      // Card 2 — voice
      "Card 2 photo": s(d.photo2),
      "Kindness received": s(d.recv),
      "Kindness given": s(d.give),
      "Why we opened": s(d.why),
      "Who taught us kindness": s(d.who),
      "A regular we'd miss": s(d.reg),
      "House move": s(d.house),
      // Card 3 — participation
      "Card 3 photos": s(d.photos3),
      "What we teach": s(d.train),
      "Kindness we do": s(d.do),
      "Yearly event": s(d.event),
      "Employee of the month": s(d.emp_who),
      "Employee of the month — for": s(d.emp_for),
      "Customer of the month": s(d.cust_who),
      "Customer of the month — for": s(d.cust_for),
      "Would host": s(d.host),
      "Invite to the map": s(d.invite),
      "Gazette interest": s(d.gaz),
      // Uploaded images (Cloudinary URLs)
      "Logo URL": s(d.logoUrl),
      "Hero photo URL": s(d.heroUrl),
      "Gallery photo URLs": s(d.galleryUrls),
      // System
      "Card fields off": off,
      "Rung": computeRung(d),
      "Card status": "Submitted",
      "Public slug": slug,
      "Private edit token": token6()
    };

    // ---- Questionnaire v2 (only write when answered, so we never mint blank options) ----
    function put(name, v){ if (nonEmpty(v)) fields[name] = s(v); }
    put("Kindness trend", d.qTrend);
    put("Four minutes a day", d.qFourMin);
    put("Devices kinder", d.qDevices);
    put("Kindness means (tap)", d.qMeans);
    put("Vision stated or implied", d.qVisImp);
    put("Kindness locus", d.qLocus);
    put("Kindness born or learned", d.qBorn);
    put("Kindness needs audience", d.qAudience);
    put("Anonymous act", d.qAnon);
    put("Anonymous act shared", d.anonShared);
    put("What matters most", d.qMatters);
    put("Co-host presence", d.qCohost);
    put("Questionnaire other", d.qOther);
    const qKeys = ["qTrend","qFourMin","qDevices","qMeans","qVisImp","qLocus","qBorn","qAudience","qAnon","qMatters","qCohost"];
    const qAnswered = qKeys.filter(k => nonEmpty(d[k])).length;
    if (qAnswered > 0) fields["Questions answered"] = qAnswered;

    const r = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields, typecast: true })
    });
    const j = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error: (j.error && j.error.message) || "Airtable error"}) };
    return { statusCode: 200, body: JSON.stringify({ slug, id: j.id, rung: fields["Rung"] }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
};
