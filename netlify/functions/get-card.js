// Reads one kindness card from Airtable by its public slug and returns the public card
// fields. The token stays server-side. Env: AIRTABLE_TOKEN, AIRTABLE_BASE_ID.
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
    const g = (n) => f[n] || "";
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        // identity
        name: g("Org name"), cat: g("Card category"), owner: g("Contact name"),
        city: g("City"), phone: g("Contact phone"), web: g("Website"),
        state: g("Kicker"), motto: g("Motto"), vision: g("Vision"), kind: g("Kindness statement"),
        // card 2
        photo2: g("Card 2 photo"), recv: g("Kindness received"), give: g("Kindness given"),
        why: g("Why we opened"), who: g("Who taught us kindness"), reg: g("A regular we'd miss"), house: g("House move"),
        // card 3
        photos3: g("Card 3 photos"), train: g("What we teach"), do: g("Kindness we do"), event: g("Yearly event"),
        emp_who: g("Employee of the month"), emp_for: g("Employee of the month — for"),
        cust_who: g("Customer of the month"), cust_for: g("Customer of the month — for"),
        host: g("Would host"), invite: g("Invite to the map"), gaz: g("Gazette interest"),
        // uploaded images
        logoUrl: g("Logo URL"), heroUrl: g("Hero photo URL"), gallery: g("Gallery photo URLs"),
        // questionnaire v2
        qTrend: g("Kindness trend"), qFourMin: g("Four minutes a day"), qDevices: g("Devices kinder"),
        qMeans: g("Kindness means (tap)"), qVisImp: g("Vision stated or implied"), qLocus: g("Kindness locus"),
        qBorn: g("Kindness born or learned"), qAudience: g("Kindness needs audience"), qAnon: g("Anonymous act"),
        anonShared: g("Anonymous act shared"), qMatters: g("What matters most"), qCohost: g("Co-host presence"),
        // system
        off: g("Card fields off"), rung: g("Rung"), status: g("Card status")
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({error: String(e)}) };
  }
};
