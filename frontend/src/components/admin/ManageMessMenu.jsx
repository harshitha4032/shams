import { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageMessMenu = () => {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    mealType: 'breakfast',
    items: [{ name: '', isNonVeg: false }]
  });
  const [loading, setLoading] = useState(true);
  const [weekView, setWeekView] = useState(0); // 0 = current week, 1 = next week

  useEffect(() => {
    fetchMenus();
  }, [weekView]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      // Get start and end dates for the selected week
      const startDate = new Date();
      const endDate = new Date();
      
      // Adjust dates based on selected week
      const daysToMonday = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
      startDate.setDate(startDate.getDate() - daysToMonday + (weekView * 7));
      endDate.setDate(startDate.getDate() + 6);
      
      // Format dates for API
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const { data } = await api.get(`/admin/mess-menus?startDate=${startStr}&endDate=${endStr}`);
      setMenus(data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/mess-menus', formData);
      setShowForm(false);
      setFormData({
        date: '',
        mealType: 'breakfast',
        items: [{ name: '', isNonVeg: false }]
      });
      fetchMenus();
    } catch (err) {
      console.error('Error saving menu:', err);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', isNonVeg: false }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        items: newItems
      });
    }
  };

  // Group menus by day
  const groupMenusByDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      const daysToMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
      date.setDate(date.getDate() - daysToMonday + (weekView * 7) + i);
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = { date: dateStr, day: days[date.getDay()], meals: {} };
    }
    
    // Populate with actual menu data
    menus.forEach(menu => {
      const dateStr = new Date(menu.date).toISOString().split('T')[0];
      if (grouped[dateStr]) {
        if (!grouped[dateStr].meals[menu.mealType]) {
          grouped[dateStr].meals[menu.mealType] = [];
        }
        grouped[dateStr].meals[menu.mealType].push(menu);
      }
    });
    
    return Object.values(grouped);
  };

  const groupedMenus = groupMenusByDay();

  if (loading) return <div>Loading mess menus...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Manage Mess Menu</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Create and manage weekly mess menus</p>
        </div>
        <div>
          <button 
            onClick={() => setWeekView(0)} 
            className={weekView === 0 ? 'btn btn-primary' : 'btn'}
            style={{ marginRight: '10px' }}
          >
            Current Week
          </button>
          <button 
            onClick={() => setWeekView(1)} 
            className={weekView === 1 ? 'btn btn-primary' : 'btn'}
            style={{ marginRight: '10px' }}
          >
            Next Week
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-success"
          >
            Add Menu
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Add New Menu</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Date:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="form-control"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Meal Type:</label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="form-control"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Items:</label>
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', marginBottom: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    required
                    className="form-control"
                    style={{ marginRight: '10px', flex: 1 }}
                  />
                  <label style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={item.isNonVeg}
                      onChange={(e) => handleItemChange(index, 'isNonVeg', e.target.checked)}
                      style={{ marginRight: '5px' }}
                    />
                    Non-Veg
                  </label>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
              >
                Add Item
              </button>
            </div>
            
            <div>
              <button type="submit" className="btn btn-success">Save Menu</button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="btn btn-secondary" 
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Breakfast (2-3 items)</th>
              <th>Lunch (5 items, including non-veg some days)</th>
              <th>Dinner (5 items, including non-veg some days)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupedMenus.map((dayMenu, index) => (
              <tr key={index}>
                <td><strong>{dayMenu.day}</strong></td>
                <td>{new Date(dayMenu.date).toLocaleDateString()}</td>
                <td>
                  {dayMenu.meals.breakfast ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {dayMenu.meals.breakfast.map((menu, idx) => (
                        <li key={idx}>
                          {menu.items.map((item, itemIdx) => (
                            <div key={itemIdx}>{item.name}</div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No breakfast menu</span>
                  )}
                </td>
                <td>
                  {dayMenu.meals.lunch ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {dayMenu.meals.lunch.map((menu, idx) => (
                        <li key={idx}>
                          {menu.items.map((item, itemIdx) => (
                            <div key={itemIdx}>
                              {item.name} {item.isNonVeg && <span style={{ color: 'red' }}>(Non-Veg)</span>}
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No lunch menu</span>
                  )}
                </td>
                <td>
                  {dayMenu.meals.dinner ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {dayMenu.meals.dinner.map((menu, idx) => (
                        <li key={idx}>
                          {menu.items.map((item, itemIdx) => (
                            <div key={itemIdx}>
                              {item.name} {item.isNonVeg && <span style={{ color: 'red' }}>(Non-Veg)</span>}
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No dinner menu</span>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => {
                      setFormData({
                        date: dayMenu.date,
                        mealType: 'breakfast',
                        items: [{ name: '', isNonVeg: false }]
                      });
                      setShowForm(true);
                    }}
                    className="btn btn-sm btn-primary"
                    style={{ marginRight: '5px' }}
                  >
                    Add Breakfast
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({
                        date: dayMenu.date,
                        mealType: 'lunch',
                        items: [{ name: '', isNonVeg: false }]
                      });
                      setShowForm(true);
                    }}
                    className="btn btn-sm btn-primary"
                    style={{ marginRight: '5px' }}
                  >
                    Add Lunch
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({
                        date: dayMenu.date,
                        mealType: 'dinner',
                        items: [{ name: '', isNonVeg: false }]
                      });
                      setShowForm(true);
                    }}
                    className="btn btn-sm btn-primary"
                  >
                    Add Dinner
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMessMenu;