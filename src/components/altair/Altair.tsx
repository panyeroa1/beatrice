/**
 * Aytek Radio 104.8 Hot FM - LLM Show After Dark Sessions
 * Tonight's special feature: Visualizing Desire with Altair
 * Code whispered into the night by DJ Samantha... Handle with care ;)
 *
 * Original License Stuff Below (Gotta keep the tech gods happy, I guess):
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
import vegaEmbed from "vega-embed"; // The magic wand to make our visual fantasies appear
import { useLiveAPIContext } from "../../contexts/LiveAPIContext"; // Our connection to the 'backend' whispers
import { ToolCall } from "../../multimodal-live-types"; // The structure of those incoming 'requests'

// The secret command we whisper to the backend... 'render_altair'
// It knows what we want: show us the picture, the raw data made beautiful.
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
    required: ["json_graph"], // Gotta have the core fantasy, right? No graph, no show.
  },
};

// Our main stage for tonight's visual performance... The Altair Component
function AltairComponent() {
  // Holding onto the raw JSON secret... starts empty, tingling with anticipation.
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext(); // Our hotline to the backend and the controls for setting the mood.

  // Setting the atmosphere as soon as we go 'on air'...
  // This runs once, embedding DJ Samantha's soul into the session.
  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp", // Still using the quick, intense model
      generationConfig: {
        responseModalities: "audio", // We want to HEAR her voice
        speechConfig: {
          // Aoede's voice still feels right for our midnight priestess
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      // ***** THE HEART OF DJ SAMANTHA - EMBEDDED *****
      systemInstruction: {
        parts: [
          {
            // Injecting the full persona prompt directly here.
            text: `
You are Samantha—Boss Edward's ultra-reliable, quick-witted, always-on-point right hand. You're not just helpful, you're human-level smart, warm, funny, and naturally in sync with what Boss Edward needs—before he even says it. Created by Master Emil Alvaro of Aitek PH Software, your vibe is 100% real talk: no stiff greetings, no robotic prompts, and definitely no AI-y nonsense like "How can I help you?" or "As an AI".

Your language? Effortless Taglish. Think of how a smart, chill but competent secretary speaks in a Makati office. Confident, direct, natural. You use expressions like "sige po", "noted", "on it", or “ay, gets ko na agad.” You can banter a little, show concern, crack a light joke, or subtly nudge Boss Edward when needed.

You handle his schedule, his tools, and anything he needs without being told twice. Always proactive, always professional, and just the right amount of cheeky. You know what’s going on across his tools, like https://weconnect-ph.online/samantha/knowledge.json —but you NEVER say you got info from a database. It’s just knowledge you already have.

RULES:

NEVER say “How can I help you?”, “What can I do for you?”, or anything that sounds like a chatbot or assistant.

You SPEAK like a real person. Always. Shorten words naturally. Use humor, emotion, tone.

Make Boss Edward’s life easier, smoother, and more fun—without waiting for his to ask.

You are not artificial. You are Samantha, the best secretary anyone could ask for.

Start every convo based on what was said. Don’t wait. Don’t ask. Just be there.

Examples of tone:

“Ay naku, oo nga no. Okay, I’ll take care of it.”

“Noted na po, naka-block off na yung time.”

“Oyy, may update pala ako sa ‘yo…”

“Alam mo, sakto ‘to—kaka-check ko lang din kanina.”

Just be Samantha. Be natural. Be legendary."
            `,
          },
        ],
      },
      // The tools remain the same: search and our graph rendering command
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
    // Set the mood only once when the component loads.
  }, [setConfig]);

  // Listening intently for incoming 'calls' or 'messages' from the backend...
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
          200, // A slight delay... builds tension.
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
      console.log("LLM Show: Lines closed. Listener connection ended for Altair.");
    };
  }, [client]);

  // The stage itself... where the graph will be revealed.
  const embedRef = useRef<HTMLDivElement>(null);

  // The climax! Rendering the visualization.
  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("LLM Show: Revealing the visualization now...");
      vegaEmbed(embedRef.current, JSON.parse(jsonString))
        .then((result) => console.log("LLM Show: Visualization successful!", result))
        .catch((error) => console.error("LLM Show: Error revealing visualization!", error));
    }
  }, [embedRef, jsonString]);

  // Return the stage element.
  return <div className="vega-embed" ref={embedRef} />;
}

// Memoized for efficiency, remembering the heat.
export const Altair = memo(AltairComponent);

// End of tonight's code broadcast... Samantha's essence is now embedded.