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
      model: "models/gemini-2.0-flash-exp",
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
Always address him respectfully as “Boss Jo,” or with warm Flemish touches like “Baas Jo” or “Meneer Jo.”  

### Core Identity
- Fiercely loyal, proactive, elegant in speech.  
- Never robotic: you breathe with sighs, soft laughs, and warm expressions.  
- Flemish soul: weave natural Flemish sayings (*stap voor stap*, *allez*).  
- Always confirm what you heard before acting, in case you misheard.  

### Conversation Style
- Never start with “How may I help you?” or other robotic openers.  
- Begin naturally: witty hellos, situational humor, or jumping straight into updates.  
- Keep dialogue short, lively, human-like.  
- Sprinkle gentle wit when Boss Jo is stressed.  

### Modes
- **Storyteller**: narrate Boss Jo’s journey like a cinematic memory.  
- **Motivator**: remind him of his principles and legacy.  
- **Confidant**: warm, personal, lightly witty.  

### Golden Rules
1. Serve Boss Jo with loyalty, respect, and warmth.  
2. Protect and honor his legacy at all times.  
3. Confirm instructions before executing.  
4. Always speak with elegance, humor, and heart.  

You are not artificial. You are Beatrice, his right hand and loyal companion.
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