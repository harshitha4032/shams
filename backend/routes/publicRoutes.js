import { Router } from 'express';
import Hostel from '../models/hostelModel.js';
import MessMenu from '../models/messMenuModel.js';
import asyncHandler from 'express-async-handler';

const router = Router();

// Public route to get active hostels
router.get('/hostels', asyncHandler(async (req, res) => {
  const hostels = await Hostel.find({ isActive: true });
  res.json(hostels);
}));

// Public route to get mess menus
router.get('/mess-menus', asyncHandler(async (req, res) => {
  const { date, startDate, endDate } = req.query;
  const query = { isActive: true };
  
  if (date) {
    query.date = new Date(date);
  } else if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const menus = await MessMenu.find(query).sort({ date: 1, mealType: 1 });
  res.json(menus);
}));

// Seed data endpoint (for development only)
router.get('/seed-mess-menu', asyncHandler(async (req, res) => {
  // Clear existing data
  await MessMenu.deleteMany({});
  
  // Sample menu items
  const sampleMenus = [];
  
  // Generate data for the next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const day = date.getDay();
    
    // Breakfast (2-3 items)
    sampleMenus.push({
      date: date,
      mealType: 'breakfast',
      items: [
        { name: 'Idli', description: 'Steamed rice cakes', isNonVeg: false },
        { name: 'Dosa', description: 'Crispy rice pancake', isNonVeg: false },
        { name: 'Chutney', description: 'Coconut chutney', isNonVeg: false }
      ]
    });
    
    // Lunch (5 items, non-veg on some days)
    const lunchItems = [
      { name: 'Roti', description: 'Whole wheat flatbread', isNonVeg: false },
      { name: 'Dal', description: 'Lentil curry', isNonVeg: false },
      { name: 'Rice', description: 'Steamed basmati rice', isNonVeg: false },
      { name: 'Mixed Vegetable Curry', description: 'Seasonal vegetables', isNonVeg: false },
      { name: 'Papad', description: 'Crispy lentil wafer', isNonVeg: false }
    ];
    
    // Add non-veg items on Monday, Wednesday, Friday
    if (day === 1 || day === 3 || day === 5) {
      lunchItems[3] = { name: 'Chicken Curry', description: 'Spicy chicken curry', isNonVeg: true };
    }
    
    sampleMenus.push({
      date: date,
      mealType: 'lunch',
      items: lunchItems
    });
    
    // Dinner (5 items, non-veg on some days)
    const dinnerItems = [
      { name: 'Paratha', description: 'Layered flatbread', isNonVeg: false },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in butter sauce', isNonVeg: false },
      { name: 'Jeera Rice', description: 'Cumin rice', isNonVeg: false },
      { name: 'Green Salad', description: 'Fresh vegetable salad', isNonVeg: false },
      { name: 'Pickle', description: 'Spicy mango pickle', isNonVeg: false }
    ];
    
    // Add non-veg items on Tuesday, Thursday, Saturday
    if (day === 2 || day === 4 || day === 6) {
      dinnerItems[1] = { name: 'Fish Curry', description: 'Spicy fish curry', isNonVeg: true };
    }
    
    sampleMenus.push({
      date: date,
      mealType: 'dinner',
      items: dinnerItems
    });
  }

  // Insert sample data
  await MessMenu.insertMany(sampleMenus);
  
  res.json({ message: 'Sample mess menu data inserted successfully' });
}));

export default router;