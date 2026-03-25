import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { generateWithValidation } from "./src/server/tutor";

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-chat-api",
      configureServer(server) {
        // Serve o arquivo .chat-context/<jid>.json diretamente (ex: /chat-context/web.json)
        // Obs: isso é só para DEV. Em produção, esse arquivo deve ficar no backend.
        server.middlewares.use("/chat-context", async (req, res) => {
          if (req.method !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Método não permitido" }));
            return;
          }

          try {
            const url = new URL(req.url ?? "", "http://localhost");
            const pathname = url.pathname || "/";
            // Esperado: /web.json, /anon.json, etc.
            const m = pathname.match(/^\/([a-zA-Z0-9_-]+)\.json$/);
            if (!m) {
              res.statusCode = 400;
              res.setHeader("content-type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Arquivo inválido" }));
              return;
            }

            const jid = m[1];
            const filePath = path.join(process.cwd(), ".chat-context", `${jid}.json`);
            const raw = await fs.readFile(filePath, "utf-8");

            res.statusCode = 200;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(raw);
          } catch {
            res.statusCode = 404;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ conversas: [] }));
          }
        });

        server.middlewares.use("/api/chat", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Método não permitido" }));
            return;
          }

          const chunks: Buffer[] = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", async () => {
            try {
              const raw = Buffer.concat(chunks).toString("utf-8");
              const body = raw ? (JSON.parse(raw) as any) : {};

              const message = typeof body?.message === "string" ? body.message : "";
              const jid = typeof body?.jid === "string" ? body.jid : "anon";
              const instrucao_desafio =
                typeof body?.instrucao_desafio === "string" ? body.instrucao_desafio : null;
              const historicoDia =
                typeof body?.historicoDia === "string" && body.historicoDia.length > 0
                  ? body.historicoDia
                  : null;

              if (!process.env.OPENAI_API_KEY) {
                res.statusCode = 500;
                res.setHeader("content-type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ error: "OPENAI_API_KEY não configurada" }));
                return;
              }

              if (!message.trim()) {
                res.statusCode = 400;
                res.setHeader("content-type", "application/json; charset=utf-8");
                res.end(JSON.stringify({ error: "Campo 'message' é obrigatório" }));
                return;
              }

              const result = await generateWithValidation({
                rootDir: process.cwd(),
                userMessage: message,
                jid,
                instrucao_desafio,
                historicoDia,
              });

              res.statusCode = result.success ? 200 : 422;
              res.setHeader("content-type", "application/json; charset=utf-8");
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("content-type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: err?.message ?? "Erro inesperado" }));
            }
          });
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
