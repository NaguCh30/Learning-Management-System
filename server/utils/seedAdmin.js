const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // path relative to /tmp/

async function seed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/lms");
    console.log("Database connected successfully.");

    const adminEmail = "admin@lms.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin account already exists: ", adminEmail);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "System Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        adminType: "super",
        status: "approved",
      });
      console.log("Successfully created super admin account: ", adminEmail);
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seed();
