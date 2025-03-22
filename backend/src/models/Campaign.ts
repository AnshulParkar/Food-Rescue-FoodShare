import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  recipientId: string;
  recipientName: string;
  targetQuantity: number;
  currentQuantity: number;
  foodType: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled';
  endDate: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
      ref: 'User',
    },
    recipientName: {
      type: String,
      required: true,
    },
    targetQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    currentQuantity: {
      type: Number,
      default: 0,
    },
    foodType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    endDate: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign; 