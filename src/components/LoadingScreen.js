import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner">🧭</div>
        <div className="loading-text">Preparing Your Adventure...</div>
        <div className="loading-subtext">The Treasure Master is setting up your quest</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
