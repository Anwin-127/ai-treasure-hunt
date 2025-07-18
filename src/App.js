import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

import LoadingScreen from './components/LoadingScreen';
import { generateMessageList } from './utils/generatePrompt';
import { DEEPSEEK_API_URL } from './config';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const chatWindowRef = useRef(null);
  const messagesRef = useRef(null); // New ref for .messages

  useEffect(() => {
    if (messages.length === 0) {
      sendMessage(""); // Triggers the first question
    }
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, showTyping]);

  const sendMessage = async (userInput) => {
    if (gameOver) return;
    
    setLoading(true);
    setShowTyping(true);

    let updated = [...messages];
    if (userInput) {
      updated.push({ sender: "user", text: userInput });
      setMessages(updated);
    }

    // Show loading screen for a minimum of 1 second for better UX
    const startTime = Date.now();
    const prompt = generateMessageList(updated);

    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: "deepseek-chat",
          messages: prompt,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response?.data?.choices?.[0]?.message?.content;
      
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 1500; // 1.5 seconds
      
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }

      updated.push({ sender: "bot", text: reply });
      setMessages(updated);

      // Check for game completion
      if (reply.includes("cookies") || reply.toLowerCase().includes("final code")) {
        setGameOver(true);
      }

      // Check for correct answer
      if (reply.toLowerCase().includes("correct") && questionCount < 10) {
        setQuestionCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('API Error:', error);
      updated.push({ 
        sender: "bot", 
        text: "🚨 Arrr! The treasure map seems to be having technical difficulties. Please try again, brave explorer!" 
      });
      setMessages(updated);
    }

    setLoading(false);
    setShowTyping(false);
  };

  const requestHint = () => {
    sendMessage("I need a hint, please!");
  };

  if (loading && messages.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="App"
      style={{
        backgroundImage: "url('/download.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        minHeight: "100vh"
      }}
    >
      <h1>Treasure Hunt Challenge</h1>
      
      <div className="chat-window" ref={chatWindowRef}>
        <div className="messages" ref={messagesRef}>
          {messages.map((msg, index) => (
            <ChatMessage key={index} sender={msg.sender} text={msg.text} />
          ))}
          
          {showTyping && (
            <div className="chat-message bot">
              <div className="message-bubble">
                <div className="typing-indicator">
                  The Treasure Master is thinking...
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!gameOver ? (
        <div className="chat-input">
          <ChatInput onSend={sendMessage} disabled={loading} />
          <button 
            className="hint-button"
            onClick={requestHint}
            disabled={loading}
          >
            Hint
          </button>
        </div>
      ) : (
        <div className="code-unlocked">
          Congratulations! You've unlocked the treasure: <strong>cookies</strong>
        </div>
      )}
    </div>
  );
}

export default App;
