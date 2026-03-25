import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`chat-message-wrapper ${isUser ? "user" : ""}`}
    >
      <div className={`chat-message-avatar ${isUser ? "user" : "assistant"}`}>
        {isUser ? (
          <User size={16} style={{ color: "var(--text-h, #08060d)" }} />
        ) : (
          <Bot size={16} style={{ color: "#22c55e" }} />
        )}
      </div>
      <div className={`chat-message-bubble ${isUser ? "user" : "assistant"}`}>
        <div className="chat-message-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
