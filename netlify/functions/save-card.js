// Writes one kindness card to Airtable. The Airtable token stays here on the server,
// never in the browser. Env vars required: AIRTABLE_TOKEN, AIRTABLE_BASE_ID.
const TABLE = process.env.AIRTABLE_TABLE || "Organizations";

function slugify(name){
  const base = (name||"org").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const suffix = Math.random().toString(36).slice(2,6); // keeps slugs unique
  return (base || "org") + "-" + suffix;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({error:"Method not allowed"}) };
  const token = process.env.AIRTABLE_TOKEN, base = process.env.AIRTABLE_BASE_ID;
  if (!token || !base) return { statusCode: 500, body: JSON.stringify({error:"Server not configured (missing AIRTABLE_TOKEN / AIRTABLE_BASE_ID)"}) };

  try {
    const d = JSON.parse(event.body || "{}");
    if (!d.org) return { statusCode: 400, body: JSON.stringify({error:"Organization name is required"}) };
    const parts = (d.loc || "").split(",");
    const slug = slugify(d.org);

    const fields = {
      "Org name": d.org,
      "City": (parts[0] || "").trim(),
      "State": (parts[1] || "").trim(),
      "Website": d.website || "",
      "Kicker": d.motto || "",
      "Kindness statement": d.means || "",
      "Story or memory": d.act || "",
      "Public slug": slug,
      "Rung": d.rung || "1 Free Flag",
      "Card status": "Submitted"
    };

    const r = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fields, typecast: true })
    });
    const j = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error: (j.error && j.error.message) || "Airtable error"}) };
    return { statusCode: 200, body: JSON.stringify({ slug, id: j.id }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
};
