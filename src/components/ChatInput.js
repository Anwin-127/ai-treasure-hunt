import React, { useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1 }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="🎯 Enter your answer and press Enter..."
        disabled={disabled}
        className="chat-input-field"
      />
      <button 
        type="submit" 
        disabled={disabled || !input.trim()}
        className="send-button"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
