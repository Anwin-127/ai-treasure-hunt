import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatMessage.css';

const ChatMessage = ({ sender, text }) => {
  return (
    <div className={`chat-message ${sender}`}>
      <div className="message-bubble">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;
