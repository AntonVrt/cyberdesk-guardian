const ALLOWED_CLASSES = ["PHONE", "DOCUMENT", "WATER_BOTTLE"];
const schema = { type: "object", properties: { accepted: { type: "boolean" }, feedback: { type: "string" }, scoreDelta: { type: "integer" }, nextChallenge: { type: "string", enum: ALLOWED_CLASSES }, action: { type: "string", enum: ["ACCEPT_SCAN", "RESCAN"] }, tip: { type: "string" } }, required: ["accepted", "feedback", "scoreDelta", "nextChallenge", "action", "tip"] };
function validDecision(v) { return v && typeof v.accepted === "boolean" && typeof v.feedback === "string" && Number.isInteger(v.scoreDelta) && ALLOWED_CLASSES.includes(v.nextChallenge) && ["ACCEPT_SCAN", "RESCAN"].includes(v.action) && typeof v.tip === "string"; }
module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const input = req.body || {};
  if (!ALLOWED_CLASSES.includes(input.detectedClass) || typeof input.confidence !== "number") return res.status(400).json({ error: "Invalid detection" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "Agent is not configured" });
  const prompt = "You are CyberDesk Guardian, a concise AI security-habits coach. Help a student build safer, focused desk habits. Use the session state to decide a useful action. Reward a matching challenge more than a different valid scan. Rotate only PHONE, DOCUMENT, WATER_BOTTLE challenges. Keep feedback and tip under 18 words. Session state: " + JSON.stringify(input);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema } }) });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Gemini API error", response.status, detail.slice(0, 700));
      throw new Error("Gemini request failed");
    }
    const data = await response.json();
    const decision = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    if (!validDecision(decision)) throw new Error("Invalid Agent response");
    return res.status(200).json(decision);
  } catch (error) {
    console.error("Agent error", error instanceof Error ? error.message : String(error));
    return res.status(502).json({ error: "Agent temporarily unavailable" });
  }
};
