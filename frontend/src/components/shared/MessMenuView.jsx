import { useState, useEffect } from 'react';
import api from '../../utils/api';

const MessMenuView = ({ userRole = 'student' }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week

  useEffect(() => {
    fetchMenus();
  }, [selectedWeek]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      // Get start and end dates for the selected week
      const startDate = new Date();
      const endDate = new Date();
      
      // Adjust dates based on selected week
      const daysToMonday = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
      startDate.setDate(startDate.getDate() - daysToMonday + (selectedWeek * 7));
      endDate.setDate(startDate.getDate() + 6);
      
      // Format dates for API
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const { data } = await api.get(`/public/mess-menus?startDate=${startStr}&endDate=${endStr}`);
      setMenus(data);
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setLoading(false);
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
      date.setDate(date.getDate() - daysToMonday + (selectedWeek * 7) + i);
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

  if (loading) return <div>Loading mess menu...</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Weekly Mess Menu</h2>
        <div>
          <button 
            onClick={() => setSelectedWeek(0)} 
            className={selectedWeek === 0 ? 'btn btn-primary' : 'btn'}
            style={{ marginRight: '10px' }}
          >
            Current Week
          </button>
          <button 
            onClick={() => setSelectedWeek(1)} 
            className={selectedWeek === 1 ? 'btn btn-primary' : 'btn'}
          >
            Next Week
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Day</th>
              <th>Date</th>
              <th>Breakfast (2-3 items)</th>
              <th>Lunch (5 items, including non-veg some days)</th>
              <th>Dinner (5 items, including non-veg some days)</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessMenuView;