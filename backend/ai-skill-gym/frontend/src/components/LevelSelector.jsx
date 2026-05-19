import React from 'react';
import './LevelSelector.css';

function LevelSelector({ onSelectLevel, loading }) {
  const levels = [
    {
      number: 1,
      title: 'AI Literacy',
      description: 'Learn the fundamentals of AI and language models',
      icon: '🧠'
    },
    {
      number: 2,
      title: 'Structured Prompting',
      description: 'Master advanced prompt engineering techniques',
      icon: '🎯'
    },
    {
      number: 3,
      title: 'Applied Tracks',
      description: 'Real-world applications across different domains',
      icon: '🚀'
    },
    {
      number: 4,
      title: 'Optimization',
      description: 'Advanced techniques for production use',
      icon: '⚡'
    }
  ];

  return (
    <div className="level-selector">
      <h2>Choose Your Level</h2>
      <div className="levels-grid">
        {levels.map((level) => (
          <button
            key={level.number}
            className="level-card"
            onClick={() => onSelectLevel(level.number)}
            disabled={loading}
          >
            <div className="level-icon">{level.icon}</div>
            <h3>Level {level.number}</h3>
            <h4>{level.title}</h4>
            <p>{level.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LevelSelector;
