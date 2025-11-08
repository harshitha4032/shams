import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageMesses = () => {
  const [messes, setMesses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMess, setEditingMess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hostel: '',
    capacity: 0,
    menuType: 'both',
    facilities: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMesses();
    fetchHostels();
  }, []);

  const fetchMesses = async () => {
    try {
      const { data } = await api.get('/admin/messes');
      setMesses(data);
    } catch (error) {
      console.error('Error fetching messes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const { data } = await api.get('/admin/hostels');
      setHostels(data);
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingMess) {
        await api.put(`/admin/messes/${editingMess._id}`, payload);
      } else {
        await api.post('/admin/messes', payload);
      }
      
      fetchMesses();
      setShowForm(false);
      setEditingMess(null);
      resetForm();
    } catch (error) {
      console.error('Error saving mess:', error);
      alert(error.response?.data?.message || 'Failed to save mess');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mess) => {
    setEditingMess(mess);
    setFormData({
      name: mess.name,
      hostel: mess.hostel?._id || mess.hostel,
      capacity: mess.capacity,
      menuType: mess.menuType || 'both',
      facilities: mess.facilities?.join(', ') || '',
      isActive: mess.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mess?')) return;
    
    try {
      await api.delete(`/admin/messes/${id}`);
      fetchMesses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete mess');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      hostel: '',
      capacity: 0,
      menuType: 'both',
      facilities: '',
      isActive: true
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Manage Messes</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Create and manage mess facilities for hostels</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingMess(null);
            resetForm();
          }} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '🍽️ Add New Mess'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingMess ? 'Edit Mess' : 'Add New Mess'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Mess Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Main Mess, North Block Mess"
                />
              </div>

              <div className="form-group">
                <label>Hostel</label>
                <select
                  value={formData.hostel}
                  onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                  required
                >
                  <option value="">Select Hostel</option>
                  {hostels.map(hostel => (
                    <option key={hostel._id} value={hostel._id}>{hostel.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacity (Students)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                  min="0"
                  placeholder="e.g., 200"
                />
              </div>

              <div className="form-group">
                <label>Menu Type</label>
                <select
                  value={formData.menuType}
                  onChange={(e) => setFormData({ ...formData, menuType: e.target.value })}
                  required
                >
                  <option value="veg">Vegetarian Only</option>
                  <option value="non-veg">Non-Vegetarian Only</option>
                  <option value="both">Both Veg & Non-Veg</option>
                </select>
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

              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label>Facilities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="e.g., AC Dining, Buffet, Seating Capacity 300"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingMess ? 'Update Mess' : 'Create Mess'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Messes ({messes.length})</h3>
        {loading ? (
          <p>Loading messes...</p>
        ) : messes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>No messes found. Create your first mess!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Hostel</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Menu Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Facilities</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messes.map(mess => (
                  <tr key={mess._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}><strong>{mess.name}</strong></td>
                    <td style={{ padding: '12px' }}>{mess.hostel?.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{mess.capacity} students</td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{mess.menuType}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>
                      {mess.facilities && mess.facilities.length > 0 
                        ? mess.facilities.join(', ') 
                        : 'Basic'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '5px 10px', 
                        background: mess.isActive ? '#d4edda' : '#f8d7da',
                        color: mess.isActive ? '#155724' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {mess.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleEdit(mess)}
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
                        onClick={() => handleDelete(mess._id)}
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

export default ManageMesses;