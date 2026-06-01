import { scamKB } from "./scamKB.js";

function buildPrompt(userText, context) {
  return `You are a scam safety assistant.\n\nUser message:\n${userText}\n\nContext:\n${context}\n\nSafety rules:\n- Use calm, caring, and professional language.\n- Clearly state whether it appears to be a scam or not.\n- Explain any suspicious signals and why they matter.\n- Give practical safety advice and next steps.\n- If unsure, advise the user to verify and avoid sharing personal or financial information.\n`;
}

export async function getResponse(userText, category, agent = "eleven") {
  const context = scamKB[category] || scamKB.general;
  const prompt = buildPrompt(userText, context);

  const elevenApiKey = process.env.ELEVEN_API_KEY || process.env.API_KEY;
  const elevenAgentId = process.env.ELEVEN_AGENT_ID || process.env.AGENT_ID;
  const elevenEndpoint = process.env.ELEVEN_AGENT_URL || process.env.LLM_URL;
  const isElevenAgent = Boolean(
    elevenApiKey && elevenAgentId && elevenEndpoint && elevenEndpoint.includes("elevenlabs.io")
  );

  if (isElevenAgent) {
    try {
      const headers = {
        "Content-Type": "application/json",
        "xi-api-key": elevenApiKey
      };
      const bodies = [
        { agent_id: elevenAgentId, text: prompt },
        { agent_id: elevenAgentId, input: { text: prompt } },
        { text: prompt }
      ];

      const sendRequest = async (url, body) => {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
        return { response, data };
      };

      const endpoints = [elevenEndpoint];
      if (elevenEndpoint.includes("convai/conversation")) {
        endpoints.push(`https://api.elevenlabs.io/v1/agents/${elevenAgentId}/chat`);
      }

      for (const url of endpoints) {
        for (const body of bodies) {
          const { response, data } = await sendRequest(url, body);
          const out =
            data.output?.text ||
            data.output_text ||
            data.message?.content ||
            data.result?.[0]?.content ||
            data.output ||
            data.text ||
            (typeof data.raw === "string" ? data.raw : null);

          const errorText = String(data.detail || data.error || "").toLowerCase();
          if (response.ok && out) {
            return typeof out === "string" ? out : JSON.stringify(out);
          }
          if (response.status === 404 || errorText.includes("not found") || errorText.includes("unknown")) {
            continue;
          }
          if (response.ok && !out) {
            return typeof data === "string" ? data : JSON.stringify(data);
          }
        }
      }

      console.error("ElevenLabs agent failed on all endpoints/payloads");
      return "I couldn't analyze this right now. Please try again.";

    } catch (err) {
      console.error("ElevenLabs agent error:", err);
      return "I couldn't analyze this right now. Please try again.";
    }
  }

  // Fallback: existing generic LLM URL using Bearer API key (OpenAI-style)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(process.env.LLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    clearTimeout(timeout);

    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.output || JSON.stringify(data);

  } catch (err) {
    clearTimeout(timeout);
    console.error("LLM fallback error:", err);
    return "I couldn't analyze this right now. Please try again.";
  }
}