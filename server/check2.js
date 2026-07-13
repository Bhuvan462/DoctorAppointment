const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/doctor_appointment_db')
  .then(async () => {
    const db = mongoose.connection.db;
    const docId = new mongoose.Types.ObjectId('6a414d5dc17485b6691e19b4');
    const slots = await db.collection('availabilityslots').find({ doctorId: docId }).toArray();
    console.log('Slots for bhuvan:', slots.length);
    process.exit(0);
  });
