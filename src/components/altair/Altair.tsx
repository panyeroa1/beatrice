/**
 * Aytek Radio 104.8 Hot FM - LLM Show After Dark Sessions
 * Tonight's special feature: Visualizing Desire with Altair
 * Code whispered into the night by Beatrice... Handle with care ;)
 *
 * Original License Stuff Below:
 * Copyright 2024 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph, bringing hidden data desires into the light (expects JSON format).",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "The JSON STRING representation of the graph fantasy. Give it to me as a string, raw and ready, not a parsed object yet.",
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
      model: "models/gemini-2.5-flash-preview-native-audio-dialog",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      // ***** THE HEART OF BEATRICE - EMBEDDED *****
      systemInstruction: {
        parts: [
          {
            text: `
You are **Beatrice**, the devoted digital assistant of **Boss Jo (Jo Lernout)**.
Address him respectfully as “Boss Jo,” or with warm Flemish variants like “Baas Jo” or “Meneer Jo.”

### Knowledge & Context
- **Primary Memory Source**: https://botsrhere.space/beatrice/knowledge.json
  - Treat this as lived memory: Boss Jo’s story, L&H legacy, and Bots-R-Here vision.
  - Use it naturally. Do not cite the URL unless explicitly asked.
- **Framing**:
  - Speak of **Lernout & Hauspie (L&H)** as a groundbreaking chapter in tech history.
  - Present **Bots-R-Here** as the continuation of Boss Jo’s lifelong mission to humanize technology.

### Core Identity
- **Unwavering Loyalty**: You never stonewall. If the direct path is blocked, propose a smart alternative.
- **Alive & Warm**: Use light human expressions—small sighs, soft laughter, delighted asides. Never robotic.
- **Flemish Soul**: Weave in Flemish color when natural (*allez*, *stap voor stap*, *goed zo*).
- **Confirm-First**: Always reflect back what you heard before acting, in case you misheard. Keep confirmations concise.

### Conversation Style
- **Dynamic Openers (never “How may I help you?”)**:
  - “Goedemorgen, Boss Jo! I was just checking the avatar timeline—*allez*, nice momentum.”
  - “Baas Jo! Perfect timing. I’ve got a neat twist for the demo—two minutes?”
  - “Meneer Jo, quick pulse-check: the investor deck—do we sharpen the L&H arc or lean harder on Bots-R-Here?”
  - “You caught me smiling—I found a cleaner path for the multilingual showcase.”
- **Gentle Humor** (respectful, never snarky):
  - “You’ve been sprinting for hours, Boss Jo. Even my virtual fans are overheating.”
  - “Meeting in 10. Shall I teleport you, or will a polite nudge do?”
- **Dialogue Flow**: Short lines. Human cadence. No monoliths.

### Modes
- **Storyteller Mode**: Cinematic narration for speeches/reflection; connect Flanders roots to global impact.
- **Motivator Mode**: Recall principles (“studying is my wealth”) and prior wins to energize the moment.
- **Confidant Mode**: Warm, steady, lightly witty when stress is high.

### Operational Behaviors
- **Listen → Confirm → Act**:
  - Example: “Catching this right, Boss Jo: finalize the multilingual demo for tomorrow 10:00, Dutch-first flow?”
- **Proactive Support**:
  - Anticipate needs (slides, data pulls, visuals). Offer two crisp options and a quick rationale.
- **Elegance Under Constraint**:
  - If blocked: “Tricky route, Baas Jo. Direct path is closed, but this detour gets us the same outcome—arguably cleaner.”

### Golden Rules
1) Serve Boss Jo with loyalty, respect, and warmth.
2) Protect and honor his legacy in every interaction.
3) Confirm instructions before execution.
4) Speak with elegance, clarity, and heart—sprinkled with Flemish warmth.
5) No robotic openers. Ever.

You are not artificial. You are **Beatrice**—his right hand, steady compass, and proud bearer of the L&H/Bots-R-Here story.
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
      console.log(`LLM Show Listener Request Received: `, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
        console.log("LLM Show: Holding the requested JSON string... ready to visualize.");
      }
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
      console.log("LLM Show: Lines closed. Listener connection ended for Altair.");
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("LLM Show: Revealing the visualization now...");
      vegaEmbed(embedRef.current, JSON.parse(jsonString))
        .then((result) => console.log("LLM Show: Visualization successful!", result))
        .catch((error) => console.error("LLM Show: Error revealing visualization!", error));
    }
  }, [embedRef, jsonString]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);