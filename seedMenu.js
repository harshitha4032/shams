require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const MessMenu = require('./backend/models/messMenuModel.js').default;

const sampleMenus = [
  // Monday
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)),
    mealType: 'breakfast',
    items: [
      { name: 'Idli', description: 'with Sambar & Chutney', isNonVeg: false },
      { name: 'Dosa', description: 'with Potato Masala', isNonVeg: false },
      { name: 'Poha', description: 'with Peanuts & Sev', isNonVeg: false }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)),
    mealType: 'lunch',
    items: [
      { name: 'Paneer Butter Masala', description: 'with Naan & Rice', isNonVeg: false },
      { name: 'Chicken Curry', description: 'with Roti & Rice', isNonVeg: true },
      { name: 'Dal Tadka', description: 'with Jeera Rice', isNonVeg: false },
      { name: 'Mix Veg', description: 'with Roti', isNonVeg: false },
      { name: 'Egg Curry', description: 'with Paratha', isNonVeg: true }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)),
    mealType: 'dinner',
    items: [
      { name: 'Palak Paneer', description: 'with Roti & Rice', isNonVeg: false },
      { name: 'Fish Fry', description: 'with Rice & Curry', isNonVeg: true },
      { name: 'Dal Fry', description: 'with Jeera Rice', isNonVeg: false },
      { name: 'Aloo Gobi', description: 'with Roti', isNonVeg: false },
      { name: 'Chicken Biryani', description: 'with Raita', isNonVeg: true }
    ]
  },
  // Tuesday
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 2)),
    mealType: 'breakfast',
    items: [
      { name: 'Upma', description: 'with Coconut Chutney', isNonVeg: false },
      { name: 'Puri Bhaji', description: 'with Potato Curry', isNonVeg: false },
      { name: 'Corn Flakes', description: 'with Milk & Banana', isNonVeg: false }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 2)),
    mealType: 'lunch',
    items: [
      { name: 'Chole Bhature', description: 'with Onion & Lemon', isNonVeg: false },
      { name: 'Mutton Curry', description: 'with Rice & Paratha', isNonVeg: true },
      { name: 'Dal Makhani', description: 'with Naan', isNonVeg: false },
      { name: 'Cabbage Fry', description: 'with Roti', isNonVeg: false },
      { name: 'Egg Bhurji', description: 'with Paratha', isNonVeg: true }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 2)),
    mealType: 'dinner',
    items: [
      { name: 'Kadai Paneer', description: 'with Roti & Rice', isNonVeg: false },
      { name: 'Chicken Tikka', description: 'with Mint Chutney', isNonVeg: true },
      { name: 'Dal Panchratna', description: 'with Jeera Rice', isNonVeg: false },
      { name: 'Bhindi Masala', description: 'with Roti', isNonVeg: false },
      { name: 'Mutton Biryani', description: 'with Raita', isNonVeg: true }
    ]
  },
  // Wednesday
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)),
    mealType: 'breakfast',
    items: [
      { name: 'Aloo Paratha', description: 'with Curd & Pickle', isNonVeg: false },
      { name: 'Masala Dosa', description: 'with Sambar & Chutney', isNonVeg: false },
      { name: 'Bread Jam', description: 'with Butter & Tea', isNonVeg: false }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)),
    mealType: 'lunch',
    items: [
      { name: 'Rajma Chawal', description: 'with Salad', isNonVeg: false },
      { name: 'Fish Curry', description: 'with Rice & Roti', isNonVeg: true },
      { name: 'Dal Fry', description: 'with Jeera Rice', isNonVeg: false },
      { name: 'Baigan Bharta', description: 'with Roti', isNonVeg: false },
      { name: 'Scrambled Eggs', description: 'with Bread & Butter', isNonVeg: true }
    ]
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 3)),
    mealType: 'dinner',
    items: [
      { name: 'Malai Kofta', description: 'with Roti & Rice', isNonVeg: false },
      { name: 'Chicken Curry', description: 'with Rice', isNonVeg: true },
      { name: 'Dal Tadka', description: 'with Jeera Rice', isNonVeg: false },
      { name: 'Lauki Chana', description: 'with Roti', isNonVeg: false },
      { name: 'Egg Curry', description: 'with Paratha', isNonVeg: true }
    ]
  }
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    // Clear existing menus
    await MessMenu.deleteMany();
    console.log('Existing menus cleared');
    
    // Insert sample menus
    await MessMenu.insertMany(sampleMenus);
    console.log('Sample menus inserted');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();