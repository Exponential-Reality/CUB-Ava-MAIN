export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Caribbean Union Bank (CUB) AI REST & SQLite API",
    version: "1.0.0",
    description:
      "Interactive FastAPI-style REST API & SQLite Database Interface for CUB AI Virtual Assistant. Provides real-time AI chat, SQLite persistence, session management, and analytics.",
    contact: {
      name: "Caribbean Union Bank Digital Services",
      url: "https://caribbeanunionbank.com",
      email: "customer.service@cub.ag",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Production & Dev CUB API Server",
    },
  ],
  paths: {
    "/chat": {
      post: {
        summary: "Send Message to CUB AI Assistant",
        description:
          "Processes user query through Multi-Model AI Router (Gemini, Groq, CUB Knowledge Engine), stores chat messages & vector memories in SQLite, and returns AI response.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "What are your loan interest rates and branch locations?",
                  },
                  sessionId: {
                    type: "string",
                    example: "session_1700000000",
                  },
                  pastChatsSummary: {
                    type: "string",
                    example: "User previously asked about opening a junior savings account.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "AI Assistant response with model routing details.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reply: { type: "string" },
                    routedModel: { type: "string", example: "gemini-2.5-flash" },
                    routingReason: { type: "string", example: "Comprehensive banking inquiry" },
                    vectorMemoryActive: { type: "boolean", example: true },
                    sqliteSaved: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/sqlite/stats": {
      get: {
        summary: "SQLite Database Status & Table Metrics",
        description:
          "Returns the current status of the SQLite WebAssembly database, file size, and table row counts.",
        responses: {
          "200": {
            description: "SQLite stats object.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    engine: { type: "string", example: "SQLite 3 (sql.js / WebAssembly)" },
                    fileSizeBytes: { type: "number", example: 122880 },
                    fileSizeFormatted: { type: "string", example: "120.00 KB" },
                    tables: {
                      type: "object",
                      properties: {
                        chat_sessions: { type: "number" },
                        chat_messages: { type: "number" },
                        bank_inquiries: { type: "number" },
                        user_feedback: { type: "number" },
                        vector_memories: { type: "number" },
                      },
                    },
                    status: { type: "string", example: "online_active" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/sqlite/sessions": {
      get: {
        summary: "List Stored Chat Sessions from SQLite",
        description: "Fetches all chat sessions persisted in the SQLite database ordered by last updated.",
        responses: {
          "200": {
            description: "List of chat session records.",
          },
        },
      },
      post: {
        summary: "Create or Update Chat Session in SQLite",
        description: "Saves a new session or updates session title in SQLite.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id", "title"],
                properties: {
                  id: { type: "string", example: "sess_12345" },
                  title: { type: "string", example: "Mortgage Loan Inquiry" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Session saved successfully." },
        },
      },
    },
    "/sqlite/sessions/{id}": {
      get: {
        summary: "Get Session Messages from SQLite",
        description: "Retrieves all message history for a given session ID directly from SQLite.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "sess_12345",
          },
        ],
        responses: {
          "200": { description: "Array of stored messages." },
        },
      },
      delete: {
        summary: "Delete Session from SQLite",
        description: "Deletes a chat session and its associated messages from SQLite.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Session deleted." },
        },
      },
    },
    "/sqlite/feedback": {
      post: {
        summary: "Submit User Feedback to SQLite",
        description: "Logs user ratings (thumbs up/down or comments) on AI messages into SQLite.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messageId", "rating"],
                properties: {
                  messageId: { type: "string" },
                  rating: { type: "string", example: "positive" },
                  comment: { type: "string", example: "Very helpful loan information!" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Feedback saved to SQLite." },
        },
      },
    },
    "/health": {
      get: {
        summary: "System Health & API Key Status",
        description: "Diagnostic check for server status, model API keys, and environment configuration.",
        responses: {
          "200": { description: "System status object." },
        },
      },
    },
  },
};
