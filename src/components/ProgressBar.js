import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-container">
      <div className="progress-label">Question {progress}/10</div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(progress / 10) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
