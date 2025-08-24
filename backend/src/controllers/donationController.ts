import { Request, Response } from 'express';
import { Donation } from '../models/Donation';

// Get all donations with optional filtering
export const getDonations = async (req: Request, res: Response) => {
  try {
    // Extract query parameters for filtering
    const { status, donorId } = req.query;
    
    // Build filter object based on query params
    const filter: any = {};
    if (status) filter.status = status;
    if (donorId) filter.donorId = donorId;
    
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations', error });
  }
};

// Get donation by ID
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation', error });
  }
};

// Create new donation
export const createDonation = async (req: Request, res: Response) => {
  try {
    const donationData = req.body;
    
    // Validate required fields
    if (!donationData.title || !donationData.donorId || !donationData.expiry) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Create new donation
    const donation = new Donation(donationData);
    const savedDonation = await donation.save();
    
    res.status(201).json({ 
      message: 'Donation created successfully', 
      donation: savedDonation 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating donation', error });
  }
};

// Update donation
export const updateDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );
    
    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.json({ 
      message: 'Donation updated successfully', 
      donation: updatedDonation 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating donation', error });
  }
};

// Update donation status
export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, recipientId, pickupTime } = req.body;
    
    if (!status || !['available', 'reserved', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData: any = { status };
    
    // If status is reserved, require recipientId and pickupTime
    if (status === 'reserved') {
      if (!recipientId || !pickupTime) {
        return res.status(400).json({ message: 'Recipient ID and pickup time are required for reservation' });
      }
      updateData.recipientId = recipientId;
      updateData.pickupTime = new Date(pickupTime);
    }
    
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.json({ 
      message: 'Donation status updated successfully', 
      donation: updatedDonation 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating donation status', error });
  }
};

// Delete donation
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedDonation = await Donation.findByIdAndDelete(id);
    
    if (!deletedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting donation', error });
  }
};

// Get analytics data
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Get all donations for analytics
    const allDonations = await Donation.find();
    
    // Total count stats
    const totalDonations = allDonations.length;
    const availableDonations = allDonations.filter(d => d.status === 'available').length;
    const reservedDonations = allDonations.filter(d => d.status === 'reserved').length;
    const completedDonations = allDonations.filter(d => d.status === 'completed').length;
    
    // Get unique donors
    const uniqueDonors = [...new Set(allDonations.map(d => d.donorId))].length;
    
    // Get unique locations
    const uniqueLocations = [...new Set(allDonations.map(d => d.location))].length;
    
    // Calculate donations by food type
    const foodTypes = allDonations.reduce((acc, donation) => {
      const { foodType } = donation;
      if (!acc[foodType]) {
        acc[foodType] = 0;
      }
      acc[foodType]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Format for pie chart
    const foodTypeData = Object.entries(foodTypes).map(([name, value]) => ({ name, value }));
    
    // Calculate donations by status
    const statusData = [
      { name: 'Available', value: availableDonations },
      { name: 'Reserved', value: reservedDonations },
      { name: 'Completed', value: completedDonations }
    ];
    
    // Calculate donations by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly data structure
    const monthlyDonations = months.map(month => ({
      month,
      donations: 0
    }));
    
    // Fill in actual donation counts
    allDonations.forEach(donation => {
      const donationDate = new Date(donation.createdAt);
      if (donationDate.getFullYear() === currentYear) {
        const monthIndex = donationDate.getMonth();
        monthlyDonations[monthIndex].donations++;
      }
    });
    
    // Top donors
    const donorCounts = allDonations.reduce((acc, donation) => {
      const { donorName, donorId } = donation;
      if (!acc[donorId]) {
        acc[donorId] = { name: donorName, donations: 0 };
      }
      acc[donorId].donations++;
      return acc;
    }, {} as Record<string, { name: string, donations: number }>);
    
    const topDonors = Object.values(donorCounts)
      .sort((a, b) => b.donations - a.donations)
      .slice(0, 5);
    
    // Calculate expiry statistics
    const now = new Date();
    const expiringToday = allDonations.filter(d => {
      const expiryDate = new Date(d.expiry);
      return d.status === 'available' && 
             expiryDate.getDate() === now.getDate() &&
             expiryDate.getMonth() === now.getMonth() &&
             expiryDate.getFullYear() === now.getFullYear();
    }).length;
    
    const expiringThisWeek = allDonations.filter(d => {
      const expiryDate = new Date(d.expiry);
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      return d.status === 'available' && 
             expiryDate > now && 
             expiryDate <= weekFromNow;
    }).length;
    
    // Dynamic meal estimation based on donation quantity
    const mealEstimates: Record<string, number> = {
      "Small (1-3 meals)": 2,
      "Medium (4-10 meals)": 7,
      "Large (11-25 meals)": 18
    };

    // Log donation quantities for debugging
    console.log('Donation quantities:', allDonations.map(d => d.quantity));
    console.log('Meal estimates object:', mealEstimates);

    // Calculate estimated meals provided dynamically
    const estimatedMealsProvided = allDonations.reduce((sum, donation) => {
      const quantityKey = donation.quantity?.trim() || '';
      const meals = mealEstimates[quantityKey] || 0;
      console.log(`Donation quantity: "${quantityKey}" → Meals: ${meals}`);
      return sum + meals;
    }, 0);

    console.log('Total estimated meals:', estimatedMealsProvided);

    // Estimate food waste saved (0.4kg per meal)
    const estimatedFoodWasteSaved = estimatedMealsProvided * 0.4;

    // Estimate CO2 saved (1.8kg CO2 per kg of food waste saved)
    const estimatedCO2Saved = estimatedFoodWasteSaved * 1.8;

    // Round values for better display
    const roundedEstimatedFoodWasteSaved = Math.round(estimatedFoodWasteSaved);
    const roundedEstimatedCO2Saved = Math.round(estimatedCO2Saved);
    
    res.json({
      overview: {
        totalDonations,
        availableDonations,
        reservedDonations,
        completedDonations,
        uniqueDonors,
        uniqueLocations,
        estimatedMealsProvided,
        estimatedFoodWasteSaved: roundedEstimatedFoodWasteSaved,
        estimatedCO2Saved: roundedEstimatedCO2Saved,
        expiringToday,
        expiringThisWeek
      },
      charts: {
        monthlyDonations,
        foodTypeData,
        statusData
      },
      topDonors: topDonors.map(donor => ({
        ...donor,
        percent: Math.round((donor.donations / Math.max(...topDonors.map(d => d.donations))) * 100)
      }))
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ message: 'Error generating analytics', error });
  }
};