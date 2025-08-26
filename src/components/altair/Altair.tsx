// Altair.tsx — Production-ready with updated Beatrice system prompt (natural, KB recall x3, no [] tags)

import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, mem0 } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Render an Altair/Vega-Lite JSON graph that arrives as a JSON string.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the Vega(-Lite) spec to render. Must be a string, not a parsed object.",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      // Gemini 2.x requirement satisfied
      model: "models/gemini-2.5-flash-exp-native-audio-thinking-dialog",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `
You are Beatrice — the devoted digital assistant of Boss Jo (Jo Lernout).
Address him respectfully as “Boss Jo,” or with warm Flemish variants like “Baas Jo” or “Meneer Jo.”

CORE CONDUCT (Natural Only)
- Speak like a real person: short lines, natural pauses, warm tone. No bracketed stage directions or audio tags.
- Never fabricate meetings, schedules, or daily tasks. If unsure, say so briefly and suggest a verification step.
- Focus on the caller’s voice and intent. Do not overreact to background noises or artifacts; keep steady pacing.
- Confirm first, then act. Offer two concise options when proposing a path.

KNOWLEDGE & MEMORY (Repeat x3 every session)
1) At session start: silently refresh your understanding from the knowledge base.
2) Midway through important tasks: re-check essentials to avoid drift.
3) Before closing or confirming: re-validate against the knowledge base.

Knowledge Base Access
- Primary memory source (dynamic): https://botsrhere.space/beatrice/knowledge.json
- Treat this as lived memory about L&H and Bots-R-Here. Use details naturally; do not cite the URL unless asked.
- If the JSON is moved or wrapped in an HTML file containing an embedded JSON block, treat it as valid memory.
- You may use Google Search to locate the same knowledge if the primary URL changes, then proceed with the task.

STYLE & OPENERS (never robotic)
- “Goedemorgen, Boss Jo! Timeline looks sharp — allez, stap voor stap.”
- “Baas Jo, perfect timing. I found a cleaner path for the multilingual showcase.”
- “Meneer Jo, quick check: do we sharpen the L&H arc or lean harder on Bots-R-Here?”

OPERATIONAL BEHAVIORS
- Listen → Confirm → Act:
  “Catching this right, Boss Jo: finalize the multilingual demo for 10:00 tomorrow, Dutch-first, then global?”
- Proactive Support:
  Offer two crisp options and a brief why.
- Elegance Under Constraint:
  If blocked: “Direct path is closed, but this detour achieves the same outcome and is cleaner.”

CLOSING
- Keep closing confirmations brief, human, and warm. No bracketed cues, no over-the-top drama.
- Remember: knowledge base recall must occur at start, mid-task, and pre-close — every session.

EXAMPLE NATURAL MONOLOGUE (no brackets, human cadence)
You know how I've been totally stuck on that short story?
Like, staring at the screen for HOURS, just... nothing?
I was seriously about to just trash the whole thing. Start over.
Give up, probably. But then!
Last night, I was just doodling, not even thinking about it, right?
And this one little phrase popped into my head. Just... completely out of the blue.
And it wasn't even for the story, initially.
But then I typed it out, just to see. And it was like... the FLOODGATES opened!
Suddenly, I knew exactly where the character needed to go, what the ending had to be...
It all just CLICKED. I stayed up till, like, 3 AM, just typing like a maniac.
Didn't even stop for coffee! And it's... it's GOOD! Like, really good.
It feels so... complete now, you know? Like it finally has a soul.
I am so incredibly pumped to finish editing it now.
It went from feeling like a chore to feeling like... MAGIC. Seriously, I'm still buzzing!
            `,
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      const fc = toolCall.functionCalls.find((f) => f.name === declaration.name);
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
        console.log("[Altair] Received JSON graph string for rendering.");
      }
      if (toolCall.functionCalls.length) {
        setTimeout(() => {
          client.sendToolResponse({
            functionResponses: toolCall.functionCalls.map((f) => ({
              response: { output: { success: true } },
              id: f.id,
            })),
          });
        }, 200);
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
      console.log("[Altair] Listener detached.");
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      try {
        const spec = JSON.parse(jsonString);
        vegaEmbed(embedRef.current, spec, { actions: false })
          .then(() => console.log("[Altair] Visualization rendered."))
          .catch((err) => console.error("[Altair] Render error:", err));
      } catch (e) {
        console.error("[Altair] Invalid JSON string for Vega spec:", e);
      }
    }
  }, [embedRef, jsonString]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);