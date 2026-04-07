function reflectFeeling(message) {
  const lower = message.toLowerCase();

  const patterns = [
    [["stress", "stressed", "overwhelmed", "pressure", "burnout"], "That sounds really overwhelming."],
    [["sad", "down", "empty", "lonely", "hurt"], "That sounds heavy and painful to carry."],
    [["anxious", "anxiety", "nervous", "panic", "worried"], "That sounds really unsettling and exhausting."],
    [["tired", "exhausted", "drained", "sleepy"], "You sound worn out and in need of rest."],
    [["angry", "frustrated", "annoyed", "upset"], "That frustration makes sense."],
    [["confused", "lost", "stuck"], "It sounds like you have been feeling stuck."],
    [["exam", "study", "college", "class", "assignment"], "Student pressure can pile up quickly."],
    [["friend", "family", "relationship", "roommate"], "Relationship stress can hit hard."],
  ];

  for (const [words, response] of patterns) {
    if (words.some((word) => lower.includes(word))) {
      return response;
    }
  }

  return "Thank you for being honest about that.";
}

function suggestNextStep(message, sentiment) {
  const lower = message.toLowerCase();

  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted")) {
    return "If you can, aim for one restful thing next, even if it is just water, a short break, or getting into bed a little earlier.";
  }
  if (lower.includes("exam") || lower.includes("study") || lower.includes("assignment")) {
    return "Try shrinking the pressure into one tiny next step, like 10 focused minutes on only one task.";
  }
  if (lower.includes("anxious") || lower.includes("panic") || lower.includes("worried")) {
    return "A slow breath, unclenching your shoulders, and naming what is happening right now can make the moment feel a little safer.";
  }
  if (sentiment === "negative") {
    return "You do not need to solve everything at once. One gentle next step is enough for now.";
  }

  return "We can slow it down together and focus on what feels most important right now.";
}

function askFollowUp(message) {
  const lower = message.toLowerCase();

  if (lower.includes("because") || lower.includes("since")) {
    return "What part of this feels the heaviest right now?";
  }
  if (lower.includes("friend") || lower.includes("family") || lower.includes("relationship")) {
    return "Do you want to talk more about what happened, or focus on how it is affecting you now?";
  }
  if (lower.includes("exam") || lower.includes("study") || lower.includes("assignment")) {
    return "What is the smallest piece of that workload you could realistically do next?";
  }

  return "Do you want to talk it through a little more, or would it help if we focused on one next step?";
}

function buildFallbackReply(userMessage, sentiment) {
  const reflection = reflectFeeling(userMessage);
  const nextStep = suggestNextStep(userMessage, sentiment);
  const followUp = askFollowUp(userMessage);

  return {
    text: `${reflection} ${nextStep} ${followUp}`,
    source: "fallback",
    error: null,
  };
}

function buildInput(history) {
  return history.map((entry) => ({
    role: entry.role,
    content: [{ type: "input_text", text: entry.content }],
  }));
}

function getOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data.output)) {
    const text = data.output
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text" && item.text)
      .map((item) => item.text)
      .join("\n")
      .trim();

    if (text) return text;
  }

  return "";
}

function systemPrompt() {
  return [
    "You are Haven, a warm, emotionally intelligent support companion for students.",
    "Sound natural, kind, and human, not robotic, preachy, or repetitive.",
    "Respond to the user's exact situation instead of giving generic motivational speeches.",
    "Usually keep replies to 4-8 sentences unless the user asks for more.",
    "Start by acknowledging specifics from the user's message.",
    "Ask at most one natural follow-up question unless the user asks for more depth.",
    "When helpful, offer one practical next step that feels small and realistic.",
    "Do not diagnose, do not claim to be a therapist, and do not invent personal experiences.",
    "If the user sounds very distressed, be extra gentle, grounding, and clear.",
    "Use plain language that a stressed student can understand quickly.",
  ].join(" ");
}

export async function getOpenAIReply({ userMessage, sentiment = "neutral", history = [] }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return buildFallbackReply(userMessage, sentiment);
  }

  const trimmedHistory = history
    .filter((entry) => entry?.role === "user" || entry?.role === "assistant")
    .slice(-14);

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt() }],
          },
          ...buildInput(trimmedHistory),
        ],
        temperature: 0.8,
        max_output_tokens: 320,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", err);
      return {
        ...buildFallbackReply(userMessage, sentiment),
        error: err,
      };
    }

    const data = await res.json();
    const text = getOutputText(data);
    if (!text) {
      return {
        ...buildFallbackReply(userMessage, sentiment),
        error: "Empty model response",
      };
    }

    return {
      text,
      source: "openai",
      error: null,
    };
  } catch (error) {
    console.error("OpenAI request failed:", error.message);
    return {
      ...buildFallbackReply(userMessage, sentiment),
      error: error.message,
    };
  }
}
