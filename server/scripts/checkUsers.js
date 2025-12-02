import mongoose from 'mongoose';
import User from '../models/User.js';
import 'dotenv/config';

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({}, 'name email role');
        console.log("Users found:", users);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
