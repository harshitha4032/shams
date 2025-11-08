import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const ManageHostels = () => {
  const [hostels, setHostels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    block: '',
    gender: '',
    totalRooms: 0,
    totalCapacity: 0,
    facilities: '',
    address: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/admin/hostels');
      setHostels(data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        totalRooms: Number(formData.totalRooms),
        totalCapacity: Number(formData.totalCapacity),
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingHostel) {
        await api.put(`/admin/hostels/${editingHostel._id}`, payload);
      } else {
        await api.post('/admin/hostels', payload);
      }
      
      fetchHostels();
      setShowForm(false);
      setEditingHostel(null);
      resetForm();
    } catch (error) {
      console.error('Error saving hostel:', error);
      alert(error.response?.data?.message || 'Failed to save hostel');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      block: hostel.block,
      gender: hostel.gender,
      totalRooms: hostel.totalRooms,
      totalCapacity: hostel.totalCapacity,
      facilities: hostel.facilities?.join(', ') || '',
      address: hostel.address || '',
      isActive: hostel.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;
    
    try {
      await api.delete(`/admin/hostels/${id}`);
      fetchHostels();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete hostel');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      block: '',
      gender: '',
      totalRooms: 0,
      totalCapacity: 0,
      facilities: '',
      address: '',
      isActive: true
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Manage Hostels</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Create and manage hostel blocks (A, B, C, etc.)</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingHostel(null);
            resetForm();
          }} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '🏢 Add New Hostel'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Hostel Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Hostel A"
                />
              </div>

              <div className="form-group">
                <label>Block</label>
                <input
                  type="text"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  required
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="coed">Co-ed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Rooms</label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                  min="0"
                  placeholder="Number of rooms"
                />
              </div>

              <div className="form-group">
                <label>Total Capacity</label>
                <input
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                  min="0"
                  placeholder="Total beds"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="WiFi, Gym, Library"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter hostel address"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingHostel ? 'Update Hostel' : 'Create Hostel'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Hostels ({hostels.length})</h3>
        {loading ? (
          <p>Loading hostels...</p>
        ) : hostels.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No hostels found. Create your first hostel!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Block</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Gender</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total Rooms</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Facilities</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map(hostel => (
                  <tr key={hostel._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}><strong>{hostel.name}</strong></td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        background: '#e3f2fd',
                        color: '#1565c0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        Block {hostel.block}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{hostel.gender}</td>
                    <td style={{ padding: '12px' }}>{hostel.totalRooms}</td>
                    <td style={{ padding: '12px' }}>{hostel.totalCapacity} beds</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {hostel.facilities && hostel.facilities.length > 0 
                        ? hostel.facilities.join(', ') 
                        : 'Basic'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '5px 10px', 
                        background: hostel.isActive ? '#d4edda' : '#f8d7da',
                        color: hostel.isActive ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {hostel.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link 
                        to={`/admin/hostels/${hostel._id}/details`}
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px', 
                          marginRight: '5px',
                          background: '#28a745',
                          color: 'white',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => handleEdit(hostel)}
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px', 
                          marginRight: '5px',
                          background: '#007bff',
                          color: 'white'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(hostel._id)}
                        className="btn"
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: '12px',
                          background: '#dc3545',
                          color: 'white'
                        }}
                      >
                        Delete
                      </button>
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

export default ManageHostels;
