const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

// Import models
const MessMenu = require('./models/messMenuModel');

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Clear existing data
  await MessMenu.deleteMany({});
  console.log('Cleared existing mess menu data');

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
  try {
    await MessMenu.insertMany(sampleMenus);
    console.log('Sample mess menu data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }

  // Close connection
  mongoose.connection.close();
  console.log('Disconnected from MongoDB');
});