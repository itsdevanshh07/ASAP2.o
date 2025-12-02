import mongoose from 'mongoose';
import User from '../models/User.js';
import 'dotenv/config';

const syncAndPromote = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log("Please provide an email address: node scripts/syncAndPromote.js <email>");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found in local DB. Attempting to fetch from Clerk...`);

            if (!process.env.CLERK_SECRET_KEY) {
                console.error("CLERK_SECRET_KEY is missing in .env");
                process.exit(1);
            }

            // Fetch user from Clerk by email
            const clerkResponse = await fetch(`https://api.clerk.com/v1/users?email_address=${email}`, {
                headers: {
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!clerkResponse.ok) {
                console.error(`Failed to fetch from Clerk: ${clerkResponse.statusText}`);
                process.exit(1);
            }

            const clerkUsers = await clerkResponse.json();

            if (!clerkUsers || clerkUsers.length === 0) {
                console.error(`User with email ${email} does not exist in Clerk either. Please sign up first.`);
                process.exit(1);
            }

            const clerkUser = clerkUsers[0];

            // Create user in local DB
            user = await User.create({
                _id: clerkUser.id,
                name: `${clerkUser.first_name} ${clerkUser.last_name}`,
                email: clerkUser.email_addresses[0].email_address,
                image: clerkUser.image_url,
                role: 'admin', // Create directly as admin
                resume: ''
            });

            console.log(`User synced from Clerk and created as ADMIN.`);
        } else {
            // User exists, just promote
            user.role = 'admin';
            await user.save();
            console.log(`User ${user.name} (${email}) updated to ADMIN.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

syncAndPromote();
