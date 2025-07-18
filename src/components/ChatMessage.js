import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatMessage.css';

const ChatMessage = ({ sender, text }) => {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${sender}`}>
      <div className="message-avatar">
        {sender === 'user' ? '🧑‍💻' : '🏴‍☠️'}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
        <div className="message-timestamp">
          {getCurrentTime()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
