import React from 'react';
import './CritiqueDisplay.css';

function CritiqueDisplay({ critique, onNewExercise, onBack, loading }) {
  return (
    <div className="critique-display">
      <div className="critique-header">
        <h2>AI Critique</h2>
        <div className="score-badge">Score: {critique.score}/10</div>
      </div>

      <div className="critique-content">
        {/* Critique */}
        <section className="critique-section">
          <h3>📝 Critique</h3>
          <p className="critique-text">{critique.critique}</p>
        </section>

        {/* Improved Prompt */}
        <section className="improved-section">
          <h3>⭐ Improved Prompt</h3>
          <div className="improved-prompt-box">
            <p>{critique.improvedPrompt}</p>
          </div>
        </section>

        {/* Explanation */}
        <section className="explanation-section">
          <h3>💡 Why It's Better</h3>
          <div className="explanation-text">
            {critique.explanation}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn-secondary"
            onClick={onBack}
            disabled={loading}
          >
            ← Try Again
          </button>
          <button
            className="btn-primary"
            onClick={onNewExercise}
            disabled={loading}
          >
            {loading ? 'Loading...' : '🎲 Next Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CritiqueDisplay;
