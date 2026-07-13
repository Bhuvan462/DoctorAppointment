const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/doctor_appointment_db')
  .then(async () => {
    const db = mongoose.connection.db;
    const doctorId = new mongoose.Types.ObjectId('6a414d5dc17485b6691e19b4');
    
    const slots = [];
    // Create slots for the next 7 days
    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0); // UTC midnight

        // 9:00 AM to 12:00 PM
        slots.push({
            doctorId,
            date: date,
            startTime: '09:00',
            endTime: '09:30',
            isBooked: false,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });
        slots.push({
            doctorId,
            date: date,
            startTime: '09:30',
            endTime: '10:00',
            isBooked: false,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });
        slots.push({
            doctorId,
            date: date,
            startTime: '10:00',
            endTime: '10:30',
            isBooked: false,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });
    }

    await db.collection('availabilityslots').insertMany(slots);
    console.log(`Inserted ${slots.length} slots for doctor bhuvan chandra`);
    process.exit(0);
  });
