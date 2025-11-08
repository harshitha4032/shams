import { useState } from 'react';
import api from '../../utils/api';

const CreateNotice = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await api.post('/admin/notices', formData);
      setSuccess('Notice created successfully!');
      setFormData({ title: '', body: '', audience: 'all' });
    } catch (err) {
      setError('Failed to create notice');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Create Notice</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Broadcast announcements to students and wardens instantly</p>
      </div>

      <div className="card" style={{ marginTop: '20px', maxWidth: '700px' }}>
        <h3>Post New Notice</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter notice title"
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              required
              placeholder="Enter notice message..."
              style={{ minHeight: '150px' }}
            />
          </div>

          <div className="form-group">
            <label>Audience</label>
            <select 
              value={formData.audience} 
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            >
              <option value="all">All (Students & Wardens)</option>
              <option value="students">Students Only</option>
              <option value="wardens">Wardens Only</option>
            </select>
          </div>

          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary">Create Notice</button>
        </form>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '10px' }}>Tips:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Keep the title clear and concise</li>
            <li>Provide all necessary details in the message</li>
            <li>Select the appropriate audience</li>
            <li>Notices are displayed in chronological order</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateNotice;
