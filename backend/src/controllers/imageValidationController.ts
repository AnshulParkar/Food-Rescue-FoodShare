import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function to validate base64 image
const isValidBase64Image = (base64String: string): boolean => {
  try {
    // Check if it's a valid base64 string
    return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(base64String);
  } catch {
    return false;
  }
};

// Helper function to verify expiration date logic
const verifyExpirationLogic = (
  aiText: string, 
  aiIsExpired: boolean, 
  extractedDate: string | null
): { isValid: boolean, override: boolean, message: string } => {
  // Default values
  let isValid = !aiIsExpired;
  let override = false;
  let message = "";
  
  // Current date - for comparison
  const currentDate = new Date();
  const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  console.log(`AI conclusion: ${aiIsExpired ? 'EXPIRED' : 'NOT EXPIRED'}, Date: ${extractedDate}, Current: ${currentDateStr}`);
  
  // Special case handling for the specific date format in the example (26/07/25)
  const europeanDateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{2})/g;
  const europeanDateMatches = [...aiText.matchAll(europeanDateRegex)];
  
  for (const match of europeanDateMatches) {
    const fullMatch = match[0]; // e.g., "26/07/25"
    console.log(`Found potential European date format: ${fullMatch}`);
    
    try {
      // European format: DD/MM/YY
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      const yearShort = parseInt(match[3]);
      
      // Assume 20xx for years less than 50, and 19xx for years 50+
      const year = yearShort < 50 ? 2000 + yearShort : 1900 + yearShort;
      
      console.log(`Interpreted as: Day=${day}, Month=${month+1}, Year=${year}`);
      
      const expiryDate = new Date(year, month, day);
      console.log(`Parsed European date: ${expiryDate.toISOString()}`);
      
      // Valid date check
      if (!isNaN(expiryDate.getTime())) {
        const isActuallyExpired = expiryDate < currentDate;
        console.log(`Date comparison: ${expiryDate.toISOString()} vs ${currentDate.toISOString()}`);
        console.log(`Is actually expired: ${isActuallyExpired}`);
        
        // Explicitly check if AI conclusion conflicts with actual date logic
        if (aiIsExpired && expiryDate > currentDate) {
          // AI said expired but date is in the future
          override = true;
          isValid = true;
          message = `The item has NOT expired. Expiry date ${expiryDate.toLocaleDateString()} (${day}/${month+1}/${year}) is in the future compared to today (${currentDate.toLocaleDateString()}).`;
          console.log(`OVERRIDE: AI incorrectly said expired but date is in the future`);
          return { isValid, override, message };
        } 
        else if (!aiIsExpired && expiryDate < currentDate) {
          // AI said not expired but date is in the past
          override = true;
          isValid = false;
          message = `The item has expired. Expiry date ${expiryDate.toLocaleDateString()} (${day}/${month+1}/${year}) is in the past compared to today (${currentDate.toLocaleDateString()}).`;
          console.log(`OVERRIDE: AI incorrectly said not expired but date is in the past`);
          return { isValid, override, message };
        }
      }
    } catch (dateError) {
      console.error('Error parsing European date format:', dateError);
    }
  }
  
  // Continue with existing date parsing logic if no European date format match
  // If we have an extracted date, we can verify the logic
  if (extractedDate) {
    try {
      let expiryDate: Date | null = null;
      
      // Check for DD/MM/YY or DD/MM/YYYY format in the raw text
      const ddmmyyRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
      const dateMatches = [...aiText.matchAll(ddmmyyRegex)];
      
      if (dateMatches.length > 0) {
        // Get the most likely expiry date match
        for (const match of dateMatches) {
          if (aiText.substring(Math.max(0, aiText.indexOf(match[0]) - 15), 
                             aiText.indexOf(match[0])).toLowerCase().includes('expir')) {
            // Convert DD/MM/YY to YYYY-MM-DD
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3].length === 2 ? `20${match[3]}` : match[3];
            
            expiryDate = new Date(`${year}-${month}-${day}`);
            console.log(`Parsed date from regex: ${expiryDate}`);
            break;
          }
        }
      }
      
      // If we didn't get a date from regex or it's invalid, try the extracted date
      if (!expiryDate || isNaN(expiryDate.getTime())) {
        expiryDate = new Date(extractedDate);
      }
      
      // Check if the date is valid
      if (!isNaN(expiryDate.getTime())) {
        // Compare with current date
        const isActuallyExpired = expiryDate < currentDate;
        
        // If AI conclusion contradicts actual date comparison
        if (isActuallyExpired !== aiIsExpired) {
          override = true;
          isValid = !isActuallyExpired;
          
          if (isActuallyExpired) {
            message = `The item has expired. Expiry date ${expiryDate.toLocaleDateString()} is before today (${currentDate.toLocaleDateString()}).`;
          } else {
            message = `The item has NOT expired. Expiry date ${expiryDate.toLocaleDateString()} is after today (${currentDate.toLocaleDateString()}).`;
          }
          
          console.log(`OVERRIDE: AI conclusion was wrong. Actual expiration status: ${isActuallyExpired ? 'EXPIRED' : 'NOT EXPIRED'}`);
        }
      }
    } catch (dateError) {
      console.error('Error parsing date:', dateError);
    }
  } else {
    // No extracted date, try to find dates in the text
    const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
    const matches = [...aiText.matchAll(dateRegex)];
    
    if (matches.length > 0) {
      try {
        // Find date near expiry keywords
        for (const match of matches) {
          const context = aiText.substring(
            Math.max(0, aiText.indexOf(match[0]) - 30),
            Math.min(aiText.length, aiText.indexOf(match[0]) + 30)
          );
          
          if (context.toLowerCase().includes('expir') || 
              context.toLowerCase().includes('best before') ||
              context.toLowerCase().includes('use by')) {
            
            // Format date
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3].length === 2 ? `20${match[3]}` : match[3];
            
            const expiryDate = new Date(`${year}-${month}-${day}`);
            
            if (!isNaN(expiryDate.getTime())) {
              const isActuallyExpired = expiryDate < currentDate;
              
              // If AI conclusion contradicts actual date comparison
              if (isActuallyExpired !== aiIsExpired) {
                override = true;
                isValid = !isActuallyExpired;
                
                if (isActuallyExpired) {
                  message = `The item has expired. Expiry date ${expiryDate.toLocaleDateString()} is before today (${currentDate.toLocaleDateString()}).`;
                } else {
                  message = `The item has NOT expired. Expiry date ${expiryDate.toLocaleDateString()} is after today (${currentDate.toLocaleDateString()}).`;
                }
                
                console.log(`OVERRIDE: AI conclusion was wrong. Actual expiration status: ${isActuallyExpired ? 'EXPIRED' : 'NOT EXPIRED'}`);
                break;
              }
            }
          }
        }
      } catch (regex_error) {
        console.error('Error parsing date from text:', regex_error);
      }
    }
  }
  
  return { isValid, override, message };
};

export const validateExpiry = async (req: Request, res: Response) => {
  try {
    const { image, estimateShelfLife = true } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Validate base64 image
    if (!isValidBase64Image(image)) {
      return res.status(400).json({ error: 'Invalid image format. Please provide a valid base64 encoded image.' });
    }

    // Initialize Gemini API
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Update to use the newer gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Current date for expiry calculations
    const currentDate = new Date();
    
    // Prepare prompt for Gemini with current date context
    const prompt = `
      Current date: ${currentDate.toISOString().split('T')[0]}
      
      Analyze this image of a food product and identify the following:
      1. The expiration date or best-by date
      2. The manufacturing date (if visible)
      3. Based on these dates and current date above, determine if this food is still good for donation
      
      If exact dates are not visible:
      1. Identify the type of food product shown in the image
      2. Estimate typical shelf life for this kind of product
      3. Determine if the food appears fresh and in good condition (no visible spoilage)
      4. Recommend whether it's suitable for donation based on appearance
      
      Rules for donation:
      - Food must not be expired as of current date
      - Food should have at least 2 days remaining before expiration
      - If no expiration date is visible, assess based on food type and visual condition
      - Packaged, non-perishable items are generally safer for donation than perishable items
      - If dates are unclear, err on the side of caution
      
      Format your response as JSON with the following structure:
      {
        "isValid": boolean,
        "message": string explaining your assessment,
        "detectedDate": string (the manufacturing date if found, in YYYY-MM-DD format),
        "expiryDate": string (the expiration date if found, in YYYY-MM-DD format),
        "foodType": string (the type of food product identified),
        "estimatedShelfLife": string (estimated shelf life for this food type, e.g. "1-2 weeks", "6 months"),
        "suggestedExpiry": string (ISO date string of when this should expire),
        "confidenceScore": number between 0-1
      }
    `;

    // Prepare the image parts for Gemini API
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: image
      }
    };

    try {
      // Generate content with the model
      const result = await model.generateContent([
        { text: prompt },
        imagePart
      ]);

      const response = await result.response;
      const text = response.text();
      console.log("Raw Gemini Response:", text);

      // Try to extract JSON from the response
      let jsonResponse;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
          
          // Verify the AI's expiration logic if we have dates
          const verification = verifyExpirationLogic(
            text, 
            !jsonResponse.isValid, 
            jsonResponse.expiryDate
          );
          
          // Override AI conclusion if needed
          if (verification.override) {
            jsonResponse.isValid = verification.isValid;
            jsonResponse.message = verification.message;
          }
          
        } else {
          // If no JSON found, analyze text for structured information
          // Check if the text indicates expiry status
          const isExpired = text.toLowerCase().includes('expired') || 
                          text.toLowerCase().includes('not suitable');
          
          // Try to extract date information using regex
          const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g;
          const dates = [...text.matchAll(dateRegex)];
          
          let expiryDate = null;
          // Look for dates mentioned near expiration keywords
          const expiryKeywords = ['expir', 'expirat', 'best before', 'best by', 'use by'];
          for (const match of dates) {
            const dateContext = text.substring(
              Math.max(0, text.indexOf(match[0]) - 30), 
              Math.min(text.length, text.indexOf(match[0]) + 30)
            );
            
            if (expiryKeywords.some(keyword => dateContext.toLowerCase().includes(keyword))) {
              // Format as YYYY-MM-DD
              const day = match[1].padStart(2, '0');
              const month = match[2].padStart(2, '0');
              const year = match[3].length === 2 ? `20${match[3]}` : match[3];
              expiryDate = `${year}-${month}-${day}`;
              break;
            }
          }
          
          // Try to extract confidence information
          let confidenceScore = 0.6; // Default medium confidence
          const confidenceMatch = text.match(/confidence:?\s*(\d+)%/i);
          if (confidenceMatch) {
            confidenceScore = parseInt(confidenceMatch[1]) / 100;
          }
          
          // Try to extract food type and shelf life information
          let foodType = null;
          let estimatedShelfLife = null;
          
          // Look for food type information
          const foodTypeMatch = text.match(/(?:food|product|item)(?:\s+type)?(?:\s+is)?(?:\s+a)?(?:\s+an)?[\s:]+([^.,\n]+)/i);
          if (foodTypeMatch) {
            foodType = foodTypeMatch[1].trim();
          }
          
          // Look for shelf life information
          const shelfLifeMatch = text.match(/(?:shelf life|lasts for|good for|expires in|storage time)[\s:]+([^.,\n]+)/i);
          if (shelfLifeMatch) {
            estimatedShelfLife = shelfLifeMatch[1].trim();
          }
          
          // Verify the AI's expiration logic
          const verification = verifyExpirationLogic(
            text, 
            isExpired, 
            expiryDate
          );
          
          return res.status(200).json({
            isValid: verification.override ? verification.isValid : !isExpired,
            message: verification.override ? verification.message : 
                    (text.split('\n')[0] || (isExpired 
                      ? "The item appears to be expired or unsuitable based on analysis." 
                      : "The item appears to be valid for donation based on analysis.")),
            expiryDate: expiryDate,
            suggestedExpiry: expiryDate,
            foodType: foodType,
            estimatedShelfLife: estimatedShelfLife,
            confidenceScore: confidenceScore
          });
        }

        // Return the validation result
        return res.status(200).json({
          isValid: jsonResponse.isValid,
          message: jsonResponse.message,
          detectedDate: jsonResponse.detectedDate,
          expiryDate: jsonResponse.expiryDate,
          foodType: jsonResponse.foodType,
          estimatedShelfLife: jsonResponse.estimatedShelfLife,
          suggestedExpiry: jsonResponse.suggestedExpiry,
          confidenceScore: jsonResponse.confidenceScore || 0.7
        });

      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        return res.status(200).json({
          isValid: !text.toLowerCase().includes('expired'),
          message: "Unable to fully analyze dates. Please verify manually.",
          confidenceScore: 0.4
        });
      }

    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      return res.status(500).json({ 
        error: apiError.message || 'Failed to process image with AI',
        isValid: false,
        message: 'Failed to analyze image. Please try again with a clearer image.'
      });
    }

  } catch (error: any) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process image',
      isValid: false,
      message: 'An error occurred while analyzing the image. Please try again.'
    });
  }
};