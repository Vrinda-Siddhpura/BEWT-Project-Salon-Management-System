const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');
const Attendance = require('../models/Attendance');
const WageRecord = require('../models/WageRecord');
const Holiday = require('../models/Holiday');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salon_management';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Service.deleteMany({});
    await Barber.deleteMany({});
    await Appointment.deleteMany({});
    await Attendance.deleteMany({});
    await WageRecord.deleteMany({});
    await Holiday.deleteMany({});

    console.log('Cleared existing database records.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@salon.com',
      password: 'Admin@123',
      role: 'Administrator',
      status: 'Active',
    });

    const receptionistUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'receptionist@salon.com',
      password: 'Recept@123',
      role: 'Receptionist',
      status: 'Active',
    });

    const barberUser1 = await User.create({
      name: 'John Doe',
      email: 'john@salon.com',
      password: 'Barber@123',
      role: 'Barber',
      status: 'Active',
    });

    const barberUser2 = await User.create({
      name: 'Alex Smith',
      email: 'alex@salon.com',
      password: 'Barber@123',
      role: 'Barber',
      status: 'Active',
    });

    const barberUser3 = await User.create({
      name: 'Maria Garcia',
      email: 'maria@salon.com',
      password: 'Barber@123',
      role: 'Barber',
      status: 'Active',
    });

    console.log('Seeded User accounts.');

    // 2. Create Barbers
    const barber1 = await Barber.create({
      userId: barberUser1._id,
      specialization: 'Haircuts & Styling',
      commissionPercentage: 40,
      joiningDate: new Date('2024-01-15'),
      status: 'Active',
    });

    const barber2 = await Barber.create({
      userId: barberUser2._id,
      specialization: 'Beard Grooming & Shaving',
      commissionPercentage: 45,
      joiningDate: new Date('2024-03-10'),
      status: 'Active',
    });

    const barber3 = await Barber.create({
      userId: barberUser3._id,
      specialization: 'Hair Coloring & Treatment',
      commissionPercentage: 50,
      joiningDate: new Date('2024-05-01'),
      status: 'Active',
    });

    console.log('Seeded Barber profiles.');

    // 3. Create Services
    const service1 = await Service.create({
      serviceName: 'Classic Men Haircut',
      duration: 30,
      price: 300,
      description: 'Precision haircut with wash and styling',
    });

    const service2 = await Service.create({
      serviceName: 'Beard Trim & Grooming',
      duration: 20,
      price: 200,
      description: 'Beard shaping, line-up, and hot towel treatment',
    });

    const service3 = await Service.create({
      serviceName: 'Premium Hair Color',
      duration: 60,
      price: 1200,
      description: 'Full hair coloring with organic dye and hair wash',
    });

    const service4 = await Service.create({
      serviceName: 'Executive Facial Massage',
      duration: 45,
      price: 800,
      description: 'Deep cleansing facial with relaxing steam and face massage',
    });

    const service5 = await Service.create({
      serviceName: 'Scalp Treatment & Head Spa',
      duration: 40,
      price: 600,
      description: 'Nourishing oil treatment for hair growth and stress relief',
    });

    console.log('Seeded Services.');

    // 4. Create Customers
    const customer1 = await Customer.create({
      name: 'Michael Brown',
      phone: '9876543210',
      email: 'michael.brown@gmail.com',
      gender: 'Male',
    });

    const customer2 = await Customer.create({
      name: 'Emma Watson',
      phone: '9876543211',
      email: 'emma.watson@gmail.com',
      gender: 'Female',
    });

    const customer3 = await Customer.create({
      name: 'David Miller',
      phone: '9876543212',
      email: 'david.m@yahoo.com',
      gender: 'Male',
    });

    const customer4 = await Customer.create({
      name: 'Sophia Taylor',
      phone: '9876543213',
      email: 'sophia.t@outlook.com',
      gender: 'Female',
    });

    console.log('Seeded Customers.');

    // 5. Create Holidays
    await Holiday.create({
      date: '2026-10-02',
      name: 'National Holiday',
    });

    await Holiday.create({
      date: '2026-12-25',
      name: 'Christmas',
    });

    // 6. Create Appointments (Past and Today)
    const todayStr = new Date().toISOString().split('T')[0];

    // Past completed appointments
    await Appointment.create({
      customerId: customer1._id,
      barberId: barber1._id,
      serviceId: service1._id,
      appointmentDate: '2026-09-20',
      startTime: '10:00',
      endTime: '10:30',
      status: 'Completed',
      remarks: 'Regular customer haircut',
    });

    await Appointment.create({
      customerId: customer2._id,
      barberId: barber3._id,
      serviceId: service3._id,
      appointmentDate: '2026-09-21',
      startTime: '11:00',
      endTime: '12:00',
      status: 'Completed',
      remarks: 'Full hair color',
    });

    await Appointment.create({
      customerId: customer3._id,
      barberId: barber2._id,
      serviceId: service2._id,
      appointmentDate: '2026-09-22',
      startTime: '14:00',
      endTime: '14:20',
      status: 'Completed',
      remarks: 'Beard trim',
    });

    // Today's appointments
    await Appointment.create({
      customerId: customer4._id,
      barberId: barber1._id,
      serviceId: service4._id,
      appointmentDate: todayStr,
      startTime: '10:00',
      endTime: '10:45',
      status: 'Completed',
      remarks: 'Morning appointment',
    });

    await Appointment.create({
      customerId: customer1._id,
      barberId: barber2._id,
      serviceId: service1._id,
      appointmentDate: todayStr,
      startTime: '15:00',
      endTime: '15:30',
      status: 'Confirmed',
      remarks: 'Afternoon booking',
    });

    console.log('Seeded Appointments.');

    // 7. Attendance
    await Attendance.create({
      barberId: barber1._id,
      checkIn: new Date(`${todayStr}T09:00:00Z`),
      date: todayStr,
    });

    await Attendance.create({
      barberId: barber2._id,
      checkIn: new Date(`${todayStr}T09:15:00Z`),
      date: todayStr,
    });

    console.log('Seeded Attendance.');

    // 8. Wage Records for current month
    const currentMonth = todayStr.substring(0, 7);
    await WageRecord.create({
      barberId: barber1._id,
      month: currentMonth,
      salary: 15000,
      commission: 440, // Calculated from completed appointments
      totalAmount: 15440,
    });

    console.log('Seeded Wage Records.');
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
