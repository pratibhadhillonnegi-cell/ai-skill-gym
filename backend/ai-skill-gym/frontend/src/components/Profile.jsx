import React, { useState, useEffect } from 'react';
import './Profile.css';

function Profile({ user, token, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ totalSubmissions: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, [token]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user submissions
      const submissionsResponse = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await submissionsResponse.json();

      if (submissionsResponse.ok) {
        setSubmissions(userData.submissions || []);
        setStats({
          totalSubmissions: userData.submissions?.length || 0,
          averageScore: userData.submissions?.length > 0
            ? (userData.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / userData.submissions.length).toFixed(1)
            : 0
        });
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2>👤 Profile</h2>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="profile-info">
        <div className="user-details">
          <h3>{user.username}</h3>
          <p>{user.email}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalSubmissions}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.averageScore}</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div className="submissions-section">
        <h3>📚 Recent Submissions</h3>
        {error && <p className="error">{error}</p>}

        {submissions.length === 0 ? (
          <p className="no-submissions">No submissions yet. Start practicing to see your progress!</p>
        ) : (
          <div className="submissions-list">
            {submissions.slice(0, 10).map((submission, index) => (
              <div key={submission._id || index} className="submission-card">
                <div className="submission-header">
                  <span className="score-badge">Score: {submission.score}/10</span>
                  <span className="date">{formatDate(submission.createdAt)}</span>
                </div>
                <div className="submission-content">
                  <div className="user-prompt">
                    <strong>Your Prompt:</strong>
                    <p>{submission.userPrompt}</p>
                  </div>
                  {submission.improvedPrompt && (
                    <div className="improved-prompt">
                      <strong>AI Suggestion:</strong>
                      <p>{submission.improvedPrompt}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;