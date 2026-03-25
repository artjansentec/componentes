import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import "./Chat.css";

type Msg = { role: "user" | "assistant"; content: string };

const formatDayPtBr = (day: string) => {
  // day no formato YYYY-MM-DD
  const m = day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return day;
  const [, y, mo, d] = m;
  const date = new Date(`${y}-${mo}-${d}T00:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

const streamText = async (
  fullText: string,
  onDelta: (text: string) => void,
  onDone: () => void
) => {
  const words = fullText.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
    onDelta((i > 0 ? " " : "") + words[i]);
  }
  onDone();
};

const ChatIA = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("today");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Carrega dias disponíveis do histórico (web.json) – últimos 30 dias
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const r = await fetch(`/chat-context/web.json?t=${Date.now()}`);
        if (!r.ok) return;
        const data = (await r.json()) as {
          conversas?: Array<{ timestamp?: string }>;
        };

        const diasSet = new Set<string>();
        for (const c of data.conversas ?? []) {
          if (!c?.timestamp) continue;
          const d = new Date(c.timestamp);
          if (!Number.isNaN(d.getTime())) {
            diasSet.add(d.toISOString().slice(0, 10));
          }
        }

        setAvailableDays(Array.from(diasSet).sort().reverse());
      } catch {
        // silencioso
      }
    };
    fetchDays();
  }, []);

  const handleSend = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: input,
          jid: "web",
          instrucao_desafio: null,
          historicoDia: selectedDay === "today" ? null : selectedDay,
        }),
      });

      const data = (await r.json()) as { success?: boolean; answer?: string; error?: string };
      if (!r.ok) throw new Error(data?.error || "Falha ao gerar resposta");

      await streamText(
        data?.answer ?? "",
        (chunk) => {
          setIsLoading(false);
          upsertAssistant(chunk);
        },
        () => {}
      );
    } catch (e) {
      console.error(e);
      upsertAssistant("\n\nDesculpe, ocorreu um erro ao gerar a resposta.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content" style={{ alignItems: "center" }}>
          <div className="chat-header-icon">
            <Sparkles size={16} style={{ color: "#22c55e" }} />
          </div>

          {/* Centro: seletor de chat por data */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="chat-day-select-label">Chat / Dia</InputLabel>
              <Select
                labelId="chat-day-select-label"
                id="chat-day-select"
                label="Chat / Dia"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <MenuItem value="today">Somente hoje</MenuItem>
                {availableDays.map((d) => (
                  <MenuItem key={d} value={d}>
                    {formatDayPtBr(d)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ textAlign: "right" }}>
            <h1 className="chat-header-title">Assistente IA</h1>
            <div className="chat-status">
              <span className="chat-status-dot" />
              <span className="chat-header-subtitle">Ativo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="chat-messages">
        {isEmpty ? (
          <div className="chat-empty-state">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="chat-empty-content"
            >
              <div className="chat-empty-icon-container">
                <Sparkles size={28} style={{ color: "#22c55e" }} />
              </div>
              <h2 className="chat-empty-title">
                Como posso te ajudar?
              </h2>
              <p className="chat-empty-text">
                Digite sua mensagem abaixo para iniciar uma conversa. Estou aqui para ajudar com qualquer coisa.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="chat-messages-container">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="chat-typing-wrapper"
              >
                <div className="chat-typing-avatar">
                  <Sparkles size={16} style={{ color: "#fff" }} />
                </div>
                <div className="chat-typing-bubble">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

export default ChatIA;
