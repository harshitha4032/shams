import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hostel from './models/hostelModel.js';
import Mess from './models/messModel.js';
import Room from './models/roomModel.js';

dotenv.config();

const hostelsData = [
  {
    name: 'Hostel A',
    block: 'A',
    gender: 'male',
    address: 'Main Building, North Wing',
    facilities: ['WiFi', 'Gym', 'Library', 'Common Room']
  },
  {
    name: 'Hostel B',
    block: 'B',
    gender: 'male',
    address: 'Main Building, South Wing',
    facilities: ['WiFi', 'Gym', 'Library', 'Common Room']
  },
  {
    name: 'Hostel C',
    block: 'C',
    gender: 'female',
    address: 'Girls Building, East Wing',
    facilities: ['WiFi', 'Common Room', 'Study Area']
  },
  {
    name: 'Hostel D',
    block: 'D',
    gender: 'female',
    address: 'Girls Building, West Wing',
    facilities: ['WiFi', 'Common Room', 'Study Area']
  },
  {
    name: 'Hostel E',
    block: 'E',
    gender: 'male',
    address: 'New Building, Floor 1',
    facilities: ['WiFi', 'Gym', 'Library', 'Common Room']
  },
  {
    name: 'Hostel F',
    block: 'F',
    gender: 'male',
    address: 'New Building, Floor 2',
    facilities: ['WiFi', 'Gym', 'Library', 'Common Room']
  },
  {
    name: 'Hostel G',
    block: 'G',
    gender: 'female',
    address: 'Girls New Building, Floor 1',
    facilities: ['WiFi', 'Common Room', 'Study Area']
  },
  {
    name: 'Hostel H',
    block: 'H',
    gender: 'female',
    address: 'Girls New Building, Floor 2',
    facilities: ['WiFi', 'Common Room', 'Study Area']
  },
  {
    name: 'Hostel I',
    block: 'I',
    gender: 'male',
    address: 'International Hostel',
    facilities: ['WiFi', 'Gym', 'Library', 'Common Room', 'Laundry']
  },
  {
    name: 'Hostel J',
    block: 'J',
    gender: 'female',
    address: 'International Girls Hostel',
    facilities: ['WiFi', 'Common Room', 'Study Area', 'Laundry']
  }
];

const messesData = [
  {
    name: 'Main Mess',
    capacity: 500,
    menuType: 'both',
    facilities: ['AC Dining', 'Buffet Service', 'Seating Capacity 500']
  },
  {
    name: 'North Block Mess',
    capacity: 300,
    menuType: 'both',
    facilities: ['Non-AC Dining', 'Seating Capacity 300']
  },
  {
    name: 'South Block Mess',
    capacity: 200,
    menuType: 'veg',
    facilities: ['AC Dining', 'Seating Capacity 200']
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

const seedHostels = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Hostel.deleteMany({});
    await Mess.deleteMany({});
    await Room.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Insert hostels
    const hostels = await Hostel.insertMany(hostelsData);
    console.log(`Inserted ${hostels.length} hostels`);
    
    // Assign messes to first 3 hostels
    for (let i = 0; i < Math.min(3, hostels.length); i++) {
      const messData = {
        ...messesData[i],
        hostel: hostels[i]._id
      };
      
      const mess = new Mess(messData);
      await mess.save();
      console.log(`Created mess "${mess.name}" for hostel "${hostels[i].name}"`);
    }
    
    // Create sample rooms for each hostel
    const roomTypes = ['single', 'double', 'triple', 'quad'];
    const genders = ['male', 'female'];
    
    for (let hostel of hostels) {
      const gender = hostel.gender;
      const floors = gender === 'male' ? 3 : 2;
      const roomsPerFloor = 10;
      
      for (let floor = 1; floor <= floors; floor++) {
        for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
          const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
          const capacity = roomType === 'single' ? 1 : 
                          roomType === 'double' ? 2 : 
                          roomType === 'triple' ? 3 : 4;
          
          const hasAC = Math.random() > 0.5;
          const feePerYear = roomType === 'single' ? 
                            (hasAC ? 60000 : 40000) : 
                            (hasAC ? 50000 : 30000);
          
          const room = new Room({
            hostel: hostel.name,
            floor: floor,
            number: `${floor}${roomNum.toString().padStart(2, '0')}`,
            roomType: roomType,
            capacity: capacity,
            gender: gender,
            facilities: hasAC ? ['AC', 'WiFi', 'Study Table'] : ['WiFi', 'Study Table'],
            hasAC: hasAC,
            feePerYear: feePerYear
          });
          
          await room.save();
        }
      }
      
      // Update hostel stats
      const hostelRooms = await Room.find({ hostel: hostel.name });
      hostel.totalRooms = hostelRooms.length;
      hostel.totalCapacity = hostelRooms.reduce((sum, room) => sum + room.capacity, 0);
      await hostel.save();
    }
    
    console.log('Sample rooms created for all hostels');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedHostels();