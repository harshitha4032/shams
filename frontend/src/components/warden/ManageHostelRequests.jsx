import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageHostelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [showProcessForm, setShowProcessForm] = useState(null);
  const [processData, setProcessData] = useState({
    status: 'approved',
    floor: '',
    roomId: '',
    remarks: ''
  });

  useEffect(() => {
    fetchHostelRequests();
    fetchRooms();
  }, []);

  const fetchHostelRequests = async () => {
    try {
      const { data } = await api.get('/warden/hostel-requests');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching hostel requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      // Use the warden rooms endpoint instead of admin endpoint
      const { data } = await api.get('/warden/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleProcessRequest = async (requestId) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await api.patch(`/warden/hostel-requests/${requestId}`, processData);
      await fetchHostelRequests();
      setShowProcessForm(null);
      setProcessData({ status: 'approved', floor: '', roomId: '', remarks: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span style={{ padding: '4px 8px', background: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>Approved</span>;
      case 'rejected':
        return <span style={{ padding: '4px 8px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', fontSize: '12px' }}>Rejected</span>;
      default:
        return <span style={{ padding: '4px 8px', background: '#fff3cd', color: '#856404', borderRadius: '4px', fontSize: '12px' }}>Pending</span>;
    }
  };

  const getAvailableRooms = (gender, roomType, acPreference) => {
    return rooms.filter(room => 
      room.gender === gender && 
      room.roomType === roomType &&
      room.occupants.length < room.capacity &&
      ((acPreference === 'ac' && room.hasAC) || (acPreference === 'non-ac' && !room.hasAC))
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2>Manage Hostel Requests</h2>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Review and process student hostel accommodation requests</p>
      </div>

      <div className="card">
        <h3>Hostel Requests ({requests.length})</h3>
        {loading ? (
          <p>Loading hostel requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>📝 No hostel requests found</p>
            <p style={{ color: '#999', fontSize: '14px' }}>Students will submit requests here for your approval</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Submitted On</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Preferences</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{request.student.name}</strong><br />
                      <span style={{ fontSize: '12px', color: '#666' }}>{request.student.email}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(request.createdAt).toLocaleDateString()}<br />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <strong>Hostel:</strong> {request.hostelPreference}<br />
                        <strong>Room:</strong> {request.roomType} ({request.acPreference})<br />
                        <strong>Year:</strong> {request.year}<br />
                        <strong>Gender:</strong> {request.gender}
                        {request.floorPreference && (
                          <><br /><strong>Floor:</strong> {request.floorPreference}</>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {getStatusBadge(request.status)}
                      {request.assignedRoom && (
                        <div style={{ marginTop: '5px', fontSize: '12px' }}>
                          <strong>Assigned:</strong> {request.assignedRoom.hostel} Room {request.assignedRoom.number} (Floor {request.assignedRoom.floor})
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {request.status === 'pending' ? (
                        <button 
                          onClick={() => setShowProcessForm(showProcessForm === request._id ? null : request._id)}
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Process
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          Processed by {request.approvedBy?.name || 'Unknown'}
                        </span>
                      )}
                      
                      {showProcessForm === request._id && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                          <h4 style={{ margin: '0 0 10px 0' }}>Process Request</h4>
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              value={processData.status}
                              onChange={(e) => setProcessData({...processData, status: e.target.value})}
                              style={{ width: '100%' }}
                            >
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                            </select>
                          </div>
                          
                          {processData.status === 'approved' && (
                            <>
                              <div className="form-group">
                                <label>Select Floor</label>
                                <select
                                  value={processData.floor}
                                  onChange={(e) => setProcessData({...processData, floor: e.target.value, roomId: ''})}
                                  style={{ width: '100%' }}
                                  required
                                >
                                  <option value="">Select Floor</option>
                                  {[...new Set(getAvailableRooms(request.gender, request.roomType, request.acPreference).map(room => room.floor))]
                                    .sort((a, b) => a - b)
                                    .map(floor => (
                                      <option key={floor} value={floor}>
                                        Floor {floor}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              
                              {processData.floor && (
                                <div className="form-group">
                                  <label>Assign Room</label>
                                  <select
                                    value={processData.roomId}
                                    onChange={(e) => setProcessData({...processData, roomId: e.target.value})}
                                    style={{ width: '100%' }}
                                    required
                                  >
                                    <option value="">Select Room</option>
                                    {getAvailableRooms(request.gender, request.roomType, request.acPreference)
                                      .filter(room => room.floor === parseInt(processData.floor))
                                      .map(room => (
                                        <option key={room._id} value={room._id}>
                                          {room.hostel} - Room {room.number} - {room.roomType} ({room.hasAC ? 'AC' : 'Non-AC'}) - {room.capacity - room.occupants.length} beds available
                                        </option>
                                      ))}
                                  </select>
                                  {getAvailableRooms(request.gender, request.roomType, request.acPreference)
                                    .filter(room => room.floor === parseInt(processData.floor))
                                    .length === 0 && (
                                      <small style={{ color: '#dc3545' }}>
                                        No available rooms on this floor
                                      </small>
                                    )}
                                </div>
                              )}
                            </>
                          )}
                          
                          <div className="form-group">
                            <label>Remarks (Optional)</label>
                            <textarea
                              value={processData.remarks}
                              onChange={(e) => setProcessData({...processData, remarks: e.target.value})}
                              style={{ width: '100%', minHeight: '60px' }}
                              placeholder="Add any remarks for the student"
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button 
                              onClick={() => handleProcessRequest(request._id)}
                              className="btn btn-primary"
                              disabled={processing[request._id] || (processData.status === 'approved' && (!processData.floor || !processData.roomId))}
                            >
                              {processing[request._id] ? 'Processing...' : 'Submit'}
                            </button>
                            <button 
                              onClick={() => setShowProcessForm(null)}
                              className="btn"
                              style={{ background: '#6c757d', color: 'white' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHostelRequests;