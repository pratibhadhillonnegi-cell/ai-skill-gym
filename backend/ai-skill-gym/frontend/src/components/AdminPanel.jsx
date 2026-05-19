import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ token, user, onBack }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    challenge: '',
    context: '',
    expectedOutcomes: [''],
    topic: '',
    levelNumber: 1
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadExercises();
    }
  }, [user]);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/exercises/level/1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (err) {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingExercise
        ? `http://localhost:4000/api/exercises/${editingExercise._id}`
        : 'http://localhost:4000/api/exercises';

      const method = editingExercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          expectedOutcomes: formData.expectedOutcomes.filter(outcome => outcome.trim())
        })
      });

      if (response.ok) {
        loadExercises();
        resetForm();
        setShowCreateForm(false);
        setEditingExercise(null);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save exercise');
      }
    } catch (err) {
      setError('Failed to save exercise');
    }
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;

    try {
      const response = await fetch(`http://localhost:4000/api/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadExercises();
      } else {
        setError('Failed to delete exercise');
      }
    } catch (err) {
      setError('Failed to delete exercise');
    }
  };

  const handleEdit = (exercise) => {
    setFormData({
      title: exercise.title,
      challenge: exercise.challenge,
      context: exercise.context || '',
      expectedOutcomes: exercise.expectedOutcomes || [''],
      topic: exercise.topic || '',
      levelNumber: exercise.levelNumber
    });
    setEditingExercise(exercise);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      challenge: '',
      context: '',
      expectedOutcomes: [''],
      topic: '',
      levelNumber: 1
    });
  };

  const addOutcome = () => {
    setFormData({
      ...formData,
      expectedOutcomes: [...formData.expectedOutcomes, '']
    });
  };

  const updateOutcome = (index, value) => {
    const newOutcomes = [...formData.expectedOutcomes];
    newOutcomes[index] = value;
    setFormData({ ...formData, expectedOutcomes: newOutcomes });
  };

  const removeOutcome = (index) => {
    if (formData.expectedOutcomes.length > 1) {
      setFormData({
        ...formData,
        expectedOutcomes: formData.expectedOutcomes.filter((_, i) => i !== index)
      });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-panel">
        <p>Access denied. Admin privileges required.</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🔧 Admin Panel</h2>
        <div className="admin-actions">
          <button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Add Exercise'}
          </button>
          <button onClick={onBack}>← Back to App</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="exercise-form">
          <h3>{editingExercise ? 'Edit Exercise' : 'Create New Exercise'}</h3>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Challenge:</label>
            <textarea
              value={formData.challenge}
              onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Context (optional):</label>
            <textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Expected Outcomes:</label>
            {formData.expectedOutcomes.map((outcome, index) => (
              <div key={index} className="outcome-input">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  placeholder="Expected outcome..."
                />
                {formData.expectedOutcomes.length > 1 && (
                  <button type="button" onClick={() => removeOutcome(index)}>×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOutcome}>+ Add Outcome</button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Topic:</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Level:</label>
              <select
                value={formData.levelNumber}
                onChange={(e) => setFormData({ ...formData, levelNumber: parseInt(e.target.value) })}
              >
                <option value={1}>Level 1</option>
                <option value={2}>Level 2</option>
                <option value={3}>Level 3</option>
                <option value={4}>Level 4</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">{editingExercise ? 'Update' : 'Create'} Exercise</button>
            <button type="button" onClick={() => { resetForm(); setShowCreateForm(false); setEditingExercise(null); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="exercises-list">
        <h3>Exercises (Level 1)</h3>
        {loading ? (
          <p>Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <p>No exercises found. Create your first exercise!</p>
        ) : (
          exercises.map(exercise => (
            <div key={exercise._id} className="exercise-card">
              <div className="exercise-header">
                <h4>{exercise.title}</h4>
                <div className="exercise-actions">
                  <button onClick={() => handleEdit(exercise)}>Edit</button>
                  <button onClick={() => handleDelete(exercise._id)} className="delete-btn">Delete</button>
                </div>
              </div>
              <p className="challenge-preview">{exercise.challenge.substring(0, 100)}...</p>
              <div className="exercise-meta">
                <span>Topic: {exercise.topic}</span>
                <span>Level: {exercise.levelNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;