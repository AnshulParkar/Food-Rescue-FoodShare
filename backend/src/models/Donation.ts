import mongoose, { Document } from 'mongoose';

export interface IDonation extends Document {
  title: string;
  description: string;
  donorName: string;
  donorId: string;
  location: string;
  expiry: Date;
  quantity: string;
  status: 'available' | 'reserved' | 'completed';
  imageUrl: string;
  foodType: string;
  createdAt: Date;
  updatedAt: Date;
  recipientId: string | null;
  pickupTime: Date | null;
}

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  expiry: {
    type: Date,
    required: true
  },
  quantity: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'reserved', 'completed'],
    default: 'available'
  },
  imageUrl: {
    type: String,
    required: true
  },
  foodType: {
    type: String,
    required: true,
    trim: true
  },
  recipientId: {
    type: String,
    ref: 'User',
    default: null
  },
  pickupTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const Donation = mongoose.model<IDonation>('Donation', donationSchema);