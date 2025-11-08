import { useState } from 'react';
import api from '../../utils/api';

const MessFeedback = () => {
  const [formData, setFormData] = useState({
    menuItem: '',
    rating: 3,
    comments: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/mess/feedback', formData);
      console.log('Feedback submitted:', response.data);
      setSuccess('Feedback submitted successfully!');
      setFormData({ menuItem: '', rating: 3, comments: '' });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Mess Feedback</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Help improve food quality - Your feedback matters!</p>
      </div>

      <div className="card" style={{ marginTop: '20px', maxWidth: '600px' }}>
        <h3>Submit Feedback</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Menu Item (Optional)</label>
            <input
              type="text"
              value={formData.menuItem}
              onChange={(e) => setFormData({ ...formData, menuItem: e.target.value })}
              placeholder="e.g., Breakfast, Lunch, Dinner, Snacks"
            />
          </div>

          <div className="form-group">
            <label>Rating (1-5)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '30px' }}>
                {formData.rating}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Share your thoughts about the mess food..."
              rows="4"
            />
          </div>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessFeedback;