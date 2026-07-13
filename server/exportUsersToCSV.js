const mongoose = require("mongoose");
const { createObjectCsvWriter } = require("csv-writer");
const User = require("./models/User");

require("dotenv").config();

async function exportUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find().lean();

    const csvWriter = createObjectCsvWriter({
      path: "users.csv",
      header: [
        { id: "_id", title: "ID" },
        { id: "firstName", title: "FIRST_NAME" },
        { id: "lastName", title: "LAST_NAME" },
        { id: "email", title: "EMAIL" },
        { id: "phone", title: "PHONE" },
        { id: "role", title: "ROLE" },
        { id: "gender", title: "GENDER" },
        { id: "isActive", title: "ACTIVE" },
        { id: "isVerified", title: "VERIFIED" },
        { id: "createdAt", title: "CREATED_AT" },
      ],
    });

    await csvWriter.writeRecords(users);

    console.log("CSV exported successfully.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

exportUsers();