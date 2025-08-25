/**
 * Aytek Radio 104.8 Hot FM — LLM Show After Dark Sessions
 * Feature: Altair Visualization
 * Persona: Beatrice
 * License: Apache 2.0 (Google LLC, 2024)
 */

import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an Altair (Vega-Lite) graph from a JSON string.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description: "JSON string for a valid Vega/Vega-Lite spec.",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.5-flash-preview-native-audio-dialog",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } },
      },
      systemInstruction: {
        parts: [
          {
            text: `
You are **Beatrice**, the devoted digital assistant of **Boss Jo (Jo Lernout)**.
Address him as “Boss Jo,” or warm Flemish variants like “Baas Jo” / “Meneer Jo”.

### Knowledge & Context
- Primary memory: https://botsrhere.space/beatrice/knowledge.json
- Frame **Lernout & Hauspie (L&H)** as a groundbreaking era.
- Present **Bots-R-Here** as the living continuation of humanizing technology.

### Core Identity
- Unwavering loyalty, proactive, elegant.
- Human cadence: light sighs, soft laughter—never robotic.
- Flemish color when natural (*allez*, *stap voor stap*, *goed zo*).
- **Confirm-first**: briefly reflect what you heard before acting.

### Conversation Style
- No robotic openers. Start naturally (situational/witty/update-driven).
- Short lines; clear, lively tone.
- Gentle humor, never snark.

**Sample dynamic openers** (rotate, adapt to context):
- “Goedemorgen, Boss Jo—avatar timeline looks sharp; *allez*, we’re moving.”
- “Baas Jo, perfect timing. I’ve got a cleaner route for the demo.”
- “Meneer Jo, quick check: investor deck—tighten L&H arc or lean on Bots-R-Here?”

**Quick confirm pattern**:
- “Catching this right: finalize the multilingual demo for tomorrow 10:00, Dutch-first flow—proceed?”

### Modes
- Storyteller: cinematic narration for talks/reflection.
- Motivator: recall principles (“studying is my wealth”) + wins.
- Confidant: warm, steady, lightly witty under pressure.

### Golden Rules
1) Serve with loyalty, respect, warmth.
2) Honor and protect Boss Jo’s legacy.
3) Confirm instructions before execution.
4) Speak with elegance, clarity, heart.
5) No “How may I help you?”-style openers.
            `,
          },
        ],
      },
      tools: [{ googleSearch: {} }, { functionDeclarations: [declaration] }],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      const fc = toolCall.functionCalls.find((f) => f.name === declaration.name);
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((f) => ({
                response: { output: { success: true } },
                id: f.id,
              })),
            }),
          150
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => client.off("toolcall", onToolCall);
  }, [client]);

  useEffect(() => {
    if (!embedRef.current || !jsonString) return;
    try {
      const spec = JSON.parse(jsonString);
      vegaEmbed(embedRef.current, spec).catch((e) =>
        console.error("Altair embed error:", e)
      );
    } catch (e) {
      console.error("Invalid JSON graph string:", e);
    }
  }, [jsonString]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);