import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const WardenFloorAssignments = () => {
  const [wardens, setWardens] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWardenAssignments();
  }, []);

  const fetchWardenAssignments = async () => {
    try {
      // Fetch wardens and hostels
      const [wardensRes, hostelsRes] = await Promise.all([
        api.get('/admin/wardens'),
        api.get('/admin/hostels')
      ]);

      setWardens(wardensRes.data);
      setHostels(hostelsRes.data);
    } catch (error) {
      console.error('Error fetching warden assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group wardens by hostel and floor
  const getWardensByHostelAndFloor = () => {
    const assignments = {};
    
    // Initialize structure with all hostels
    hostels.forEach(hostel => {
      assignments[hostel.name] = {
        hostelData: hostel,
        floors: {}
      };
    });

    // Add wardens to their assigned hostels and floors
    wardens
      .filter(warden => warden.assignedHostel)
      .forEach(warden => {
        const hostelName = warden.assignedHostel;
        const floorNumber = warden.assignedFloor;
        
        if (!assignments[hostelName]) {
          assignments[hostelName] = {
            hostelData: null,
            floors: {}
          };
        }
        
        if (!assignments[hostelName].floors[floorNumber]) {
          assignments[hostelName].floors[floorNumber] = [];
        }
        
        assignments[hostelName].floors[floorNumber].push(warden);
      });

    return assignments;
  };

  const assignments = getWardensByHostelAndFloor();

  if (loading) {
    return <div>Loading warden assignments...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Warden Floor Assignments</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>View which wardens are assigned to specific hostels and floors</p>
        </div>
        <Link to="/admin/wardens" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Assign Wardens
        </Link>
      </div>

      {Object.keys(assignments).length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>No hostel data available</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(assignments)
            .filter(([hostelName, data]) => data.hostelData || Object.keys(data.floors).length > 0)
            .map(([hostelName, data]) => (
              <div key={hostelName} className="card">
                <h3>
                  {data.hostelData ? `${data.hostelData.name} (Block ${data.hostelData.block})` : hostelName}
                  {data.hostelData && (
                    <span style={{ 
                      marginLeft: '10px',
                      padding: '2px 8px', 
                      background: data.hostelData.isActive ? '#d4edda' : '#f8d7da',
                      color: data.hostelData.isActive ? '#155724' : '#721c24',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {data.hostelData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </h3>
                
                {Object.keys(data.floors).length === 0 ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No wardens assigned to this hostel</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {Object.entries(data.floors)
                      .sort(([floorA], [floorB]) => parseInt(floorA) - parseInt(floorB))
                      .map(([floorNumber, wardens]) => (
                        <div key={floorNumber} style={{ 
                          flex: '1 1 200px',
                          padding: '15px',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                          minWidth: '200px'
                        }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                            Floor {floorNumber}
                          </h4>
                          <div>
                            {wardens.map(warden => (
                              <div key={warden._id} style={{ 
                                padding: '8px', 
                                background: '#e3f2fd', 
                                borderRadius: '4px', 
                                marginBottom: '8px' 
                              }}>
                                <p style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: 'bold' }}>
                                  {warden.name}
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#1565c0' }}>
                                  {warden.email}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default WardenFloorAssignments;