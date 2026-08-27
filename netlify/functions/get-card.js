// Reads one kindness card from Airtable by its public slug and returns only the
// public-safe fields. The token stays server-side. Env: AIRTABLE_TOKEN, AIRTABLE_BASE_ID.
const TABLE = process.env.AIRTABLE_TABLE || "Organizations";

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN, base = process.env.AIRTABLE_BASE_ID;
  if (!token || !base) return { statusCode: 500, body: JSON.stringify({error:"Server not configured"}) };
  const slug = ((event.queryStringParameters || {}).slug || "").replace(/['"\\]/g, "");
  if (!slug) return { statusCode: 400, body: JSON.stringify({error:"missing slug"}) };

  try {
    const formula = `{Public slug}='${slug}'`;
    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({error: (j.error && j.error.message) || "Airtable error"}) };
    const rec = (j.records || [])[0];
    if (!rec) return { statusCode: 404, body: JSON.stringify({error:"not found"}) };
    const f = rec.fields;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        org: f["Org name"] || "",
        city: f["City"] || "",
        state: f["State"] || "",
        motto: f["Kicker"] || "",
        means: f["Kindness statement"] || "",
        act: f["Story or memory"] || "",
        rung: f["Rung"] || ""
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
};
