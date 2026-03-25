import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="chat-typing-dots">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="chat-typing-dot"
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
