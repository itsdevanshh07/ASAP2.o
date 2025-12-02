import mongoose from 'mongoose';
import User from '../models/User.js';
import 'dotenv/config';

const checkAdminStatus = async () => {
    const email = 'undhyani07@gmail.com';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email });
        if (user) {
            console.log(`User: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Is Admin? ${user.role === 'admin'}`);
        } else {
            console.log("User not found in DB");
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdminStatus();
