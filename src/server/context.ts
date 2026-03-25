import fs from "node:fs/promises";
import path from "node:path";

export type UserContext = {
  conversas: Array<{
    pergunta: string;
    resposta: string;
    status: "approved" | "rejected";
    timestamp: string;
  }>;
};

const DEFAULT_CONTEXT: UserContext = { conversas: [] };

function safeId(id: string) {
  return (id || "anon").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
}

function contextDir(rootDir: string) {
  return path.join(rootDir, ".chat-context");
}

function contextPath(rootDir: string, jid: string) {
  return path.join(contextDir(rootDir), `${safeId(jid)}.json`);
}

export async function loadUserContext(rootDir: string, jid: string): Promise<UserContext> {
  const file = contextPath(rootDir, jid);
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw) as UserContext;
    if (!parsed?.conversas || !Array.isArray(parsed.conversas)) return { ...DEFAULT_CONTEXT };
    return parsed;
  } catch {
    return { ...DEFAULT_CONTEXT };
  }
}

export async function saveUserContext(rootDir: string, jid: string, context: UserContext) {
  const dir = contextDir(rootDir);

  // Mantém apenas conversas dos últimos 30 dias
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const conversasFiltradas = (context.conversas ?? []).filter((c) => {
    const d = new Date(c.timestamp);
    return !Number.isNaN(d.getTime()) && d >= cutoff;
  });

  const toSave: UserContext = { conversas: conversasFiltradas };

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(contextPath(rootDir, jid), JSON.stringify(toSave, null, 2), "utf-8");
}

