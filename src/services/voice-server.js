#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const voice = require("./voice.js");

const server = new Server(
  { name: "voice-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "voice_speak",
        description: "Speak text out loud to the user using ElevenLabs. It plays directly out of their computer speakers instantly. Use this to actively talk and leave a voice message that they will hear in real life. Keep it short, futuristic, and professional.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to synthesize into spoken audio",
            },
            voiceId: {
              type: "string",
              description: "Optional ElevenLabs Voice ID (defaults to Adam/Standard)"
            }
          },
          required: ["text"],
        },
      },
      {
        name: "voice_transcribe",
        description: "Transcribe an audio file using Deepgram. Useful for reading voice notes dropped by the user in the Listening folder.",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Absolute path to the audio file on disk",
            },
          },
          required: ["filePath"],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    switch (name) {
      case "voice_speak": {
        const audioPath = await voice.speak(args.text, args.voiceId);
        return {
          content: [{ type: "text", text: `Successfully spoke your message out loud using ElevenLabs. Audio saved locally at: ${audioPath}` }],
        };
      }
      case "voice_transcribe": {
        const transcript = await voice.transcribe(args.filePath);
        return {
          content: [{ type: "text", text: `Deepgram Transcription: "${transcript}"` }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Voice MCP Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("Server error:", err);
  process.exit(1);
});
