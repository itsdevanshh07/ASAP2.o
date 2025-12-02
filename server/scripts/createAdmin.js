import mongoose from 'mongoose';
import User from '../models/User.js';
import 'dotenv/config';

const createAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log("Please provide an email address: node scripts/createAdmin.js <email>");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`User ${user.name} (${email}) is now an Admin.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createAdmin();
