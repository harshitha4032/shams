import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/student/notices');
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Notices & Announcements</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Stay updated with hostel news, maintenance schedules, and important alerts</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        {notices.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#666' }}>No notices available</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice._id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{notice.title}</h3>
                  <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>{notice.body}</p>
                  <small style={{ color: '#666' }}>
                    Posted on {new Date(notice.createdAt).toLocaleDateString()} • 
                    Audience: {notice.audience}
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notices;
