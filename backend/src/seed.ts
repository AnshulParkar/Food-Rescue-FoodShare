import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';

// Load environment variables
dotenv.config();

const users = [
  {
    username: "john_doe",
    email: "john.doe@example.com",
    password: "password123"
  },
  {
    username: "jane_smith",
    email: "jane.smith@example.com",
    password: "securepass456"
  },
  {
    username: "alex_wilson",
    email: "alex.wilson@example.com",
    password: "strongpass789"
  },
  {
    username: "sarah_parker",
    email: "sarah.parker@example.com",
    password: "userpass321"
  },
  {
    username: "mike_johnson",
    email: "mike.johnson@example.com",
    password: "mikepass654"
  }
];

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function seedDatabase() {
  try {
    // Type assertion since we've already checked for undefined
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected to MongoDB Atlas successfully');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log('Successfully seeded users:', createdUsers.map(user => user.username));

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 