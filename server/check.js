const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/doctor_appointment_db')
  .then(async () => {
    const db = mongoose.connection.db;
    const slots = await db.collection('availabilityslots').find().toArray();
    console.log('Slots:', slots.length);
    if(slots.length > 0) {
      console.log('First slot:', slots[0]);
    }
    const users = await db.collection('users').find({ role: 'doctor' }).toArray();
    console.log('Doctors:', users.length);
    if(users.length > 0) {
        console.log('First Doctor ID:', users[0]._id, users[0].firstName);
    }
    process.exit(0);
  });
