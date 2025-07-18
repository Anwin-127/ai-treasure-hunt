import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

import LoadingScreen from './components/LoadingScreen';
import { generateMessageList } from './utils/generatePrompt';
import { DEEPSEEK_API_URL } from './config';
import './App.css';
import AdminClearLeaderboard from './components/AdminClearLeaderboard';

function App() {
  const [messages, setMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0); // Score starts at 0
  const [loading, setLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const chatWindowRef = useRef(null);
  const messagesRef = useRef(null); // New ref for .messages
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [userName, setUserName] = useState("");
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);


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

      let reply = response?.data?.choices?.[0]?.message?.content;
      let isCorrect = false;
      if (reply && reply.endsWith("correct")) {
        // Only increment score if the previous message was from the user
        const lastMsg = updated.length > 0 ? updated[updated.length - 1] : null;
        if (lastMsg && lastMsg.sender === "user") {
          isCorrect = true;
        }
        reply = reply.slice(0, -7); // Remove 'correct' from the end
      }
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

      // Check for correct answer and update score
      if (isCorrect && questionCount < 10) {
        setQuestionCount((prev) => prev + 1);
        setScore((prev) => prev + 10);
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

  const handleFinish = () => {
    setShowFinishModal(true);
  };

  const handleModalClose = () => {
    setShowFinishModal(false);
    setUserName("");
    setSubmitSuccess(false);
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSubmitScore = async () => {
    if (!userName.trim()) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // seconds
    try {
      await axios.post('https://json-server-jcg2.onrender.com/leaderboard', {
        name: userName,
        score: score,
        time: timeTaken
      });
      setSubmitSuccess(true);
    } catch (err) {
      alert('Failed to submit score. Please try again!');
    }
    setSubmitting(false);
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
      <div className="score-badge">🏆 Score: {score}</div>
      <h1>Treasure Hunt Challenge</h1>
      <button className="finish-btn" onClick={handleFinish}>Finish</button>
      
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
      {showFinishModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Submit Your Score</h2>
            {submitSuccess ? (
              <>
                <p>Score submitted! Thank you, {userName}!</p>
                <button onClick={handleModalClose}>Close</button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={handleNameChange}
                  disabled={submitting}
                />
                <button onClick={handleSubmitScore} disabled={submitting || !userName.trim()}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button onClick={handleModalClose} disabled={submitting}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
      <AdminClearLeaderboard />
    </div>
  );
}

export default App;
