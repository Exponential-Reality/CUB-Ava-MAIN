import fs from "fs";
import path from "path";
import initSqlJs, { Database } from "sql.js";

const DB_FILE_PATH = path.join(process.cwd(), "cub_ai.sqlite");

let dbInstance: Database | null = null;

/**
 * Initializes and returns the local SQLite database using sql.js (WebAssembly SQLite)
 */
export async function getSQLiteDB(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const wasmPath = path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm");
  const SQL = await initSqlJs({
    locateFile: (file) => {
      if (fs.existsSync(wasmPath)) {
        return wasmPath;
      }
      return file;
    },
  });

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      // Valid SQLite database files are at least 100 bytes and start with "SQLite format 3\0"
      const isValidHeader =
        fileBuffer.length >= 100 &&
        fileBuffer.subarray(0, 15).toString("utf8") === "SQLite format 3";

      if (isValidHeader) {
        dbInstance = new SQL.Database(fileBuffer);
        console.log(`[SQLite Engine] Loaded existing database from ${DB_FILE_PATH}`);
      } else {
        console.warn(`[SQLite Engine] Database file at ${DB_FILE_PATH} is incomplete or invalid header. Recreating fresh database.`);
        try {
          fs.unlinkSync(DB_FILE_PATH);
        } catch (e) {}
        dbInstance = new SQL.Database();
      }
    } catch (err) {
      console.warn("[SQLite Engine] Error reading existing database file, creating fresh database:", err);
      try {
        if (fs.existsSync(DB_FILE_PATH)) {
          fs.unlinkSync(DB_FILE_PATH);
        }
      } catch (unlinkErr) {}
      try {
        dbInstance = new SQL.Database();
      } catch (innerErr) {
        console.error("[SQLite Engine] Failed to instantiate SQLite Database instance:", innerErr);
        throw innerErr;
      }
    }
  } else {
    dbInstance = new SQL.Database();
    console.log("[SQLite Engine] Created new SQLite database in memory.");
  }

  // Initialize SQLite Tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      routed_model TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bank_inquiries (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      query TEXT NOT NULL,
      session_id TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_feedback (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      rating TEXT NOT NULL,
      comment TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vector_memories (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_query TEXT NOT NULL,
      bot_response TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  saveSQLiteDB();
  return dbInstance;
}

/**
 * Flushes SQLite database state to disk atomically to prevent file corruption
 */
export function saveSQLiteDB() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    const tmpPath = `${DB_FILE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, DB_FILE_PATH);
  } catch (err) {
    console.error("[SQLite Engine] Failed to save database to disk:", err);
  }
}

/**
 * Returns database metadata and table statistics
 */
export async function getSQLiteStats() {
  const db = await getSQLiteDB();

  const getCount = (table: string): number => {
    try {
      const res = db.exec(`SELECT COUNT(*) as cnt FROM ${table}`);
      if (res.length > 0 && res[0].values.length > 0) {
        return Number(res[0].values[0][0]);
      }
    } catch (e) {
      // ignore
    }
    return 0;
  };

  let fileSize = 0;
  if (fs.existsSync(DB_FILE_PATH)) {
    fileSize = fs.statSync(DB_FILE_PATH).size;
  }

  return {
    engine: "SQLite 3 (sql.js / WebAssembly)",
    filePath: DB_FILE_PATH,
    fileSizeBytes: fileSize,
    fileSizeFormatted: `${(fileSize / 1024).toFixed(2)} KB`,
    tables: {
      chat_sessions: getCount("chat_sessions"),
      chat_messages: getCount("chat_messages"),
      bank_inquiries: getCount("bank_inquiries"),
      user_feedback: getCount("user_feedback"),
      vector_memories: getCount("vector_memories"),
    },
    status: "online_active",
  };
}

/**
 * Saves or updates a chat session in SQLite
 */
export async function saveSessionToSQLite(id: string, title: string) {
  const db = await getSQLiteDB();
  const now = Date.now();

  const stmt = db.prepare(`SELECT id FROM chat_sessions WHERE id = :id`);
  stmt.bind({ ":id": id });
  const exists = stmt.step();
  stmt.free();

  if (exists) {
    db.run(
      `UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?`,
      [title, now, id]
    );
  } else {
    db.run(
      `INSERT INTO chat_sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [id, title, now, now]
    );
  }
  saveSQLiteDB();
}

/**
 * Saves a message into SQLite
 */
export async function saveMessageToSQLite(
  id: string,
  sessionId: string,
  role: string,
  content: string,
  routedModel?: string
) {
  const db = await getSQLiteDB();
  const now = Date.now();

  db.run(
    `INSERT OR REPLACE INTO chat_messages (id, session_id, role, content, routed_model, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, sessionId, role, content, routedModel || "CUB_DEFAULT", now]
  );

  db.run(`UPDATE chat_sessions SET updated_at = ? WHERE id = ?`, [now, sessionId]);
  saveSQLiteDB();
}

/**
 * Logs a bank inquiry into SQLite
 */
export async function logInquiryToSQLite(category: string, query: string, sessionId?: string) {
  const db = await getSQLiteDB();
  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = Date.now();

  db.run(
    `INSERT INTO bank_inquiries (id, category, query, session_id, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, category, query, sessionId || "default", now]
  );
  saveSQLiteDB();
}

/**
 * Saves feedback to SQLite
 */
export async function saveFeedbackToSQLite(messageId: string, rating: string, comment?: string) {
  const db = await getSQLiteDB();
  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = Date.now();

  db.run(
    `INSERT INTO user_feedback (id, message_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, messageId, rating, comment || "", now]
  );
  saveSQLiteDB();
}

/**
 * Retrieves all chat sessions from SQLite
 */
export async function getSessionsFromSQLite() {
  const db = await getSQLiteDB();
  const res = db.exec(`SELECT id, title, created_at, updated_at FROM chat_sessions ORDER BY updated_at DESC`);
  if (res.length === 0) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

/**
 * Retrieves messages for a session from SQLite
 */
export async function getMessagesFromSQLite(sessionId: string) {
  const db = await getSQLiteDB();
  const stmt = db.prepare(
    `SELECT id, session_id, role, content, routed_model, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`
  );
  stmt.bind([sessionId]);

  const messages: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    messages.push(row);
  }
  stmt.free();
  return messages;
}

/**
 * Deletes a session and its messages from SQLite
 */
export async function deleteSessionFromSQLite(sessionId: string) {
  const db = await getSQLiteDB();
  db.run(`DELETE FROM chat_messages WHERE session_id = ?`, [sessionId]);
  db.run(`DELETE FROM chat_sessions WHERE id = ?`, [sessionId]);
  saveSQLiteDB();
}
