import asyncHandler from 'express-async-handler';
import Hostel from '../models/hostelModel.js';
import Room from '../models/roomModel.js';
import Mess from '../models/messModel.js';
import User from '../models/userModel.js';

// @desc    Create a new hostel
// @route   POST /api/admin/hostels
// @access  Private/Admin
export const createHostel = asyncHandler(async (req, res) => {
  const { name, block, gender, warden, facilities, address } = req.body;

  const hostel = new Hostel({
    name,
    block,
    gender,
    warden,
    facilities,
    address
  });

  const createdHostel = await hostel.save();
  res.status(201).json(createdHostel);
});

// @desc    Get all hostels
// @route   GET /api/admin/hostels
// @access  Private/Admin
export const getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find({}).populate('warden', 'name email');
  res.json(hostels);
});

// @desc    Get hostel by ID
// @route   GET /api/admin/hostels/:id
// @access  Private/Admin
export const getHostelById = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id).populate('warden', 'name email');
  
  if (hostel) {
    res.json(hostel);
  } else {
    res.status(404).json({ message: 'Hostel not found' });
  }
});

// @desc    Update hostel
// @route   PUT /api/admin/hostels/:id
// @access  Private/Admin
export const updateHostel = asyncHandler(async (req, res) => {
  const { name, block, gender, warden, facilities, address, isActive } = req.body;

  const hostel = await Hostel.findById(req.params.id);

  if (hostel) {
    hostel.name = name || hostel.name;
    hostel.block = block || hostel.block;
    hostel.gender = gender || hostel.gender;
    hostel.warden = warden || hostel.warden;
    hostel.facilities = facilities || hostel.facilities;
    hostel.address = address || hostel.address;
    hostel.isActive = isActive !== undefined ? isActive : hostel.isActive;

    const updatedHostel = await hostel.save();
    res.json(updatedHostel);
  } else {
    res.status(404).json({ message: 'Hostel not found' });
  }
});

// @desc    Delete hostel
// @route   DELETE /api/admin/hostels/:id
// @access  Private/Admin
export const deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id);

  if (hostel) {
    await hostel.remove();
    res.json({ message: 'Hostel removed' });
  } else {
    res.status(404).json({ message: 'Hostel not found' });
  }
});

// @desc    Get detailed hostel information including rooms and mess
// @route   GET /api/admin/hostels/:id/details
// @access  Private/Admin
export const getHostelDetails = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id).populate('warden', 'name email');
  
  if (hostel) {
    // Get rooms for this hostel
    const rooms = await Room.find({ hostel: hostel.name });
    
    // Calculate room statistics
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedCapacity = rooms.reduce((sum, room) => sum + room.occupants.length, 0);
    const availableCapacity = totalCapacity - occupiedCapacity;
    
    // Room type breakdown
    const roomTypeBreakdown = {};
    rooms.forEach(room => {
      if (!roomTypeBreakdown[room.roomType]) {
        roomTypeBreakdown[room.roomType] = {
          count: 0,
          totalCapacity: 0,
          occupiedCapacity: 0,
          availableCapacity: 0
        };
      }
      roomTypeBreakdown[room.roomType].count += 1;
      roomTypeBreakdown[room.roomType].totalCapacity += room.capacity;
      roomTypeBreakdown[room.roomType].occupiedCapacity += room.occupants.length;
      roomTypeBreakdown[room.roomType].availableCapacity += (room.capacity - room.occupants.length);
    });
    
    // Get messes for this hostel
    const messes = await Mess.find({ hostel: hostel._id });
    
    res.json({
      hostel,
      rooms: {
        total: totalRooms,
        totalCapacity,
        occupiedCapacity,
        availableCapacity,
        roomTypeBreakdown,
        list: rooms
      },
      messes
    });
  } else {
    res.status(404).json({ message: 'Hostel not found' });
  }
});

// @desc    Create a new room
// @route   POST /api/admin/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res) => {
  const { hostel, floor, number, roomType, capacity, gender, assignedWarden, facilities, hasAC, feePerYear } = req.body;

  const room = new Room({
    hostel,
    floor,
    number,
    roomType,
    capacity,
    gender,
    assignedWarden,
    facilities,
    hasAC,
    feePerYear
  });

  const createdRoom = await room.save();
  
  // Update hostel room count
  const hostelDoc = await Hostel.findOne({ name: hostel });
  if (hostelDoc) {
    hostelDoc.totalRooms += 1;
    hostelDoc.totalCapacity += capacity;
    await hostelDoc.save();
  }
  
  res.status(201).json(createdRoom);
});

// @desc    Get all rooms
// @route   GET /api/admin/rooms
// @access  Private/Admin
export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({}).populate('assignedWarden', 'name email').populate('occupants', 'name email hostelId');
  res.json(rooms);
});

// @desc    Get room by ID
// @route   GET /api/admin/rooms/:id
// @access  Private/Admin
export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('assignedWarden', 'name email').populate('occupants', 'name email hostelId');
  
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// @desc    Update room
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
export const updateRoom = asyncHandler(async (req, res) => {
  const { hostel, floor, number, roomType, capacity, gender, assignedWarden, facilities, hasAC, feePerYear, maintenanceStatus, lastMaintenance } = req.body;

  const room = await Room.findById(req.params.id);

  if (room) {
    const oldCapacity = room.capacity;
    
    room.hostel = hostel || room.hostel;
    room.floor = floor || room.floor;
    room.number = number || room.number;
    room.roomType = roomType || room.roomType;
    room.capacity = capacity || room.capacity;
    room.gender = gender || room.gender;
    room.assignedWarden = assignedWarden || room.assignedWarden;
    room.facilities = facilities || room.facilities;
    room.hasAC = hasAC !== undefined ? hasAC : room.hasAC;
    room.feePerYear = feePerYear || room.feePerYear;
    room.maintenanceStatus = maintenanceStatus || room.maintenanceStatus;
    room.lastMaintenance = lastMaintenance || room.lastMaintenance;

    const updatedRoom = await room.save();
    
    // Update hostel capacity if capacity changed
    if (capacity !== oldCapacity) {
      const hostelDoc = await Hostel.findOne({ name: room.hostel });
      if (hostelDoc) {
        hostelDoc.totalCapacity += (capacity - oldCapacity);
        await hostelDoc.save();
      }
    }
    
    res.json(updatedRoom);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// @desc    Delete room
// @route   DELETE /api/admin/rooms/:id
// @access  Private/Admin
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    // Update hostel room count
    const hostelDoc = await Hostel.findOne({ name: room.hostel });
    if (hostelDoc) {
      hostelDoc.totalRooms -= 1;
      hostelDoc.totalCapacity -= room.capacity;
      await hostelDoc.save();
    }
    
    await room.remove();
    res.json({ message: 'Room removed' });
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

// @desc    Create a new mess
// @route   POST /api/admin/messes
// @access  Private/Admin
export const createMess = asyncHandler(async (req, res) => {
  const { name, hostel, capacity, menuType, facilities } = req.body;

  const mess = new Mess({
    name,
    hostel,
    capacity,
    menuType,
    facilities
  });

  const createdMess = await mess.save();
  res.status(201).json(createdMess);
});

// @desc    Get all messes
// @route   GET /api/admin/messes
// @access  Private/Admin
export const getMesses = asyncHandler(async (req, res) => {
  const messes = await Mess.find({}).populate('hostel', 'name block');
  res.json(messes);
});

// @desc    Get mess by ID
// @route   GET /api/admin/messes/:id
// @access  Private/Admin
export const getMessById = asyncHandler(async (req, res) => {
  const mess = await Mess.findById(req.params.id).populate('hostel', 'name block');
  
  if (mess) {
    res.json(mess);
  } else {
    res.status(404).json({ message: 'Mess not found' });
  }
});

// @desc    Update mess
// @route   PUT /api/admin/messes/:id
// @access  Private/Admin
export const updateMess = asyncHandler(async (req, res) => {
  const { name, hostel, capacity, menuType, facilities, isActive } = req.body;

  const mess = await Mess.findById(req.params.id);

  if (mess) {
    mess.name = name || mess.name;
    mess.hostel = hostel || mess.hostel;
    mess.capacity = capacity || mess.capacity;
    mess.menuType = menuType || mess.menuType;
    mess.facilities = facilities || mess.facilities;
    mess.isActive = isActive !== undefined ? isActive : mess.isActive;

    const updatedMess = await mess.save();
    res.json(updatedMess);
  } else {
    res.status(404).json({ message: 'Mess not found' });
  }
});

// @desc    Delete mess
// @route   DELETE /api/admin/messes/:id
// @access  Private/Admin
export const deleteMess = asyncHandler(async (req, res) => {
  const mess = await Mess.findById(req.params.id);

  if (mess) {
    await mess.remove();
    res.json({ message: 'Mess removed' });
  } else {
    res.status(404).json({ message: 'Mess not found' });
  }
});