import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ReportReturn = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    leaveRequestId: '',
    expectedReturnDate: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchApprovedLeaves();
    fetchMyReports();
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coordinates: [
            position.coords.longitude,
            position.coords.latitude
          ],
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          verified: undefined, // Not yet verified
          verifying: false
        });
        setLocationError('');
      },
      (error) => {
        setLocationError(`Unable to retrieve your location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Check if location is in Vadlamudi using Google Maps Geocoding
  const isLocationInVadlamudi = async (coords) => {
    try {
      const [longitude, latitude] = coords;
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyC5j0VtXrK2GlXt7pLj8wD5d34f2x8n9k0&language=en`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Check if any of the address components contain Vadlamudi
        for (const result of data.results) {
          const address = result.formatted_address.toLowerCase();
          if (address.includes('vadlamudi') && address.includes('guntur')) {
            console.log('Location verified:', address);
            return true;
          }
          
          // Check address components
          for (const component of result.address_components) {
            const name = component.long_name.toLowerCase();
            if (name.includes('vadlamudi') || name.includes('గుంటూరు')) { // Guntur in Telugu
              console.log('Location verified by component:', name);
              return true;
            }
          }
        }
      }
      
      console.log('Location not in Vadlamudi:', data.results?.[0]?.formatted_address || 'Unknown');
      return false;
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // If it's a timeout or network error, try fallback
      if (error.name === 'AbortError' || error instanceof TypeError) {
        console.log('Using fallback bounding box check due to timeout/network error');
        return fallbackBoundingBoxCheck(coords);
      }
      
      // Fallback to bounding box if API fails
      return fallbackBoundingBoxCheck(coords);
    }
  };

  // Fallback bounding box check with extended range
  const fallbackBoundingBoxCheck = (coords) => {
    const [longitude, latitude] = coords;
    const isInBounds = (
      longitude >= 80.35 && longitude <= 80.75 &&
      latitude >= 16.25 && latitude <= 16.65
    );
    
    console.log('Fallback check result:', {
      longitude,
      latitude,
      isInBounds
    });
    
    return isInBounds;
  };

  const fetchApprovedLeaves = async () => {
    try {
      const { data } = await api.get('/student/my-leaves');
      const approvedLeaves = data.filter(leave => leave.status === 'approved' && !leave.hasReturned);
      setLeaves(approvedLeaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const fetchMyReports = async () => {
    try {
      const { data } = await api.get('/student-return/my-reports');
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Confirm location capture
    if (!location) {
      const confirmNoLocation = window.confirm(
        'Location not captured. Do you want to submit without location data?\n\nNote: Location helps verify your return authenticity.'
      );
      
      if (!confirmNoLocation) {
        setLoading(false);
        return;
      }
    }

    // Check if location is within Vadlamudi
    if (location && location.coordinates) {
      try {
        // Update UI to show verification in progress
        setLocation(prev => ({ ...prev, verifying: true }));
        
        const locationVerified = await isLocationInVadlamudi(location.coordinates);
        
        // Update location state with verification result
        setLocation(prev => ({ ...prev, verified: locationVerified, verifying: false }));
        
        if (!locationVerified) {
          // Show detailed location info for debugging
          const [longitude, latitude] = location.coordinates;
          setError(`❌ Location verification failed.

Your location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}

Required area: Vadlamudi, Guntur District, Andhra Pradesh, India

If you believe this is incorrect, please contact support.`);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Location verification error:', error);
        // Update UI to show verification completed
        setLocation(prev => ({ ...prev, verifying: false }));
        // Continue with submission if verification fails
      }
    }

    try {
      const requestData = {
        ...formData,
        location: location || null
      };
      
      await api.post('/student-return/report-return', requestData);
      alert('✅ Return reported successfully! Waiting for warden approval.');
      setFormData({
        leaveRequestId: '',
        expectedReturnDate: '',
        remarks: ''
      });
      fetchMyReports();
      
      // Refresh location for next use
      getLocation();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to report return');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { backgroundColor: '#fff3cd', color: '#856404' },
      approved: { backgroundColor: '#d4edda', color: '#155724' },
      denied: { backgroundColor: '#f8d7da', color: '#721c24' }
    };

    return (
      <span 
        className="badge" 
        style={{ 
          ...statusStyles[status] || statusStyles.pending,
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px'
        }}
      >
        {status?.toUpperCase() || 'PENDING'}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>HomeAsylum Return Report</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>
          Report your return from leave and request hostel access permission
        </p>
      </div>

      {/* Location Status */}
      <div className="card" style={{ marginBottom: '20px', background: location ? 
        (location.verified !== undefined ? 
          (location.verified ? '#d4edda' : '#f8d7da') : 
          '#fff3cd') : 
        '#fff3cd' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>
            {location ? 
              (location.verified !== undefined ? 
                (location.verified ? '✅' : '❌') : 
                '📍') : 
              (locationError ? '⚠️' : '⏳')}
          </span>
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>
              {location 
                ? (location.verified !== undefined
                  ? (location.verified 
                    ? 'Location Verified - Vadlamudi' 
                    : 'Location Outside Vadlamudi')
                  : 'Location Captured')
                : (locationError 
                  ? 'Location Error' 
                  : 'Capturing Location...')}
            </h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              {location 
                ? (location.verified !== undefined
                  ? (location.verified
                    ? `Accuracy: ${location.accuracy?.toFixed(0) || 'N/A'} meters - You're in the correct location!`
                    : `You are currently outside Vadlamudi, Guntur District. Please move to the hostel premises to submit this report.`)
                  : `Accuracy: ${location.accuracy?.toFixed(0) || 'N/A'} meters`)
                : (locationError 
                  ? locationError
                  : 'Getting your current location for verification')}
            </p>
          </div>
        </div>
      </div>

      {/* Report Return Form */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Report Return</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Notify warden about your return and request permission to access hostel
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Request *</label>
            <select
              name="leaveRequestId"
              value={formData.leaveRequestId}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select Leave Request</option>
              {leaves.map(leave => (
                <option key={leave._id} value={leave._id}>
                  {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()} ({leave.reason})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Expected Return Date</label>
            <input
              type="date"
              name="expectedReturnDate"
              value={formData.expectedReturnDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Remarks (Optional)</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Any additional information..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Reporting...' : 'Report Return & Request Access'}
          </button>
        </form>
      </div>

      {/* My Return Reports */}
      <div className="card">
        <h3>My Return Reports</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Track status of your return reports and access permissions
        </p>

        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
            <p>📝 No return reports submitted yet</p>
            <p style={{ fontSize: '14px' }}>Submit a return report using the form above</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Leave Period</th>
                  <th>Reported Date</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td>
                      {report.leaveRequest ? (
                        <>
                          {new Date(report.leaveRequest.fromDate).toLocaleDateString()} - {new Date(report.leaveRequest.toDate).toLocaleDateString()}
                        </>
                      ) : 'N/A'}
                    </td>
                    <td>{new Date(report.reportedDate).toLocaleDateString()}</td>
                    <td>
                      {report.expectedReturnDate 
                        ? new Date(report.expectedReturnDate).toLocaleDateString()
                        : 'Not specified'}
                    </td>
                    <td>
                      {report.actualReturnDate 
                        ? new Date(report.actualReturnDate).toLocaleDateString()
                        : 'Not returned'}
                    </td>
                    <td>{getStatusBadge(report.hostelAccessPermission)}</td>
                    <td>{report.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-3" style={{ gap: '15px', marginTop: '20px' }}>
        <div className="card" style={{ background: '#e3f2fd' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>📝 How It Works</h4>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
            <li>Select your approved leave</li>
            <li>Report your return date</li>
            <li>Warden reviews your report</li>
            <li>Get permission to access hostel</li>
          </ol>
        </div>

        <div className="card" style={{ background: '#e8f5e9' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>✅ Benefits</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
            <li>Digital return reporting</li>
            <li>Fast permission processing</li>
            <li>Clear status tracking</li>
            <li>No paperwork needed</li>
          </ul>
        </div>

        <div className="card" style={{ background: '#fff3cd' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Important</h4>
          <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
            You must report return before accessing hostel facilities. 
            Access will be granted only after warden approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportReturn;
