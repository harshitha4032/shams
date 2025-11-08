import { useState, useEffect } from 'react';
import api from '../../utils/api';

const MessAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/mess/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Mess Feedback Analytics</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Monitor food quality and student satisfaction metrics</p>
      </div>

      {analytics ? (
        <div className="grid grid-2" style={{ marginTop: '20px' }}>
          <div className="stat-card">
            <h3>{analytics.totalFeedback || 0}</h3>
            <p>Total Feedbacks</p>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <h3>{analytics.averageRating?.toFixed(1) || 'N/A'}</h3>
            <p>Average Rating</p>
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3>Rating Distribution</h3>
            {analytics.ratingDistribution && analytics.ratingDistribution.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                {analytics.ratingDistribution.map((item) => (
                  <div key={item._id} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>{item._id} Star{item._id > 1 ? 's' : ''}</span>
                      <span>{item.count} feedback{item.count > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ 
                      background: '#e0e0e0', 
                      height: '20px', 
                      borderRadius: '10px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{ 
                        background: '#667eea', 
                        height: '100%', 
                        width: `${(item.count / analytics.totalFeedback) * 100}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                No feedback data available
              </p>
            )}
          </div>

          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3>Menu Item Ratings</h3>
            {analytics.menuItemAnalytics && analytics.menuItemAnalytics.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                {analytics.menuItemAnalytics.map((item) => (
                  <div key={item._id || 'unspecified'} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span>{item._id || 'Unspecified'}</span>
                      <span>{item.avgRating?.toFixed(1)} ({item.count} feedback{item.count > 1 ? 's' : ''})</span>
                    </div>
                    <div style={{ 
                      background: '#e0e0e0', 
                      height: '15px', 
                      borderRadius: '7px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{ 
                        background: '#4facfe', 
                        height: '100%', 
                        width: `${(item.avgRating / 5) * 100}%`,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                No menu item data available
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ textAlign: 'center', color: '#666' }}>No analytics data available</p>
        </div>
      )}
    </div>
  );
};

export default MessAnalytics;