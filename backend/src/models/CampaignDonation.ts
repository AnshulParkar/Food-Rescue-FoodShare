import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICampaignDonation extends Document {
  _id: Types.ObjectId;
  campaignId: string;
  donorId: string;
  quantity: number;
  foodType: string;
  status: 'pending' | 'delivered' | 'cancelled';
  recipientId: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignDonationSchema = new Schema<ICampaignDonation>(
  {
    campaignId: {
      type: String,
      required: true,
      ref: 'Campaign',
    },
    donorId: {
      type: String,
      required: true,
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    foodType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'cancelled'],
      default: 'pending',
    },
    recipientId: {
      type: String,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const CampaignDonation = mongoose.model<ICampaignDonation>('CampaignDonation', campaignDonationSchema);

export default CampaignDonation; 