import * as z from "zod";

export const donationFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  expiry: z.date().min(new Date(), "Expiry date must be in the future"),
  quantity: z.string().min(1, "Quantity is required"),
  foodType: z.string().min(1, "Food type is required"),
  imageUrl: z.string().min(1, "Image is required"),
});

export type DonationFormValues = z.infer<typeof donationFormSchema>; 