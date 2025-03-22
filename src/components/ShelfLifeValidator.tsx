import { useState } from "react";
import { Upload, Check, AlertCircle, Image as ImageIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

interface ShelfLifeValidatorProps {
  onValidationComplete: (validationResult: ValidationResult) => void;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  detectedDate?: string;
  suggestedExpiry?: Date;
  expiryDate?: string;
  confidenceScore?: number;
  foodType?: string;
  estimatedShelfLife?: string;
}

const ShelfLifeValidator = ({ onValidationComplete }: ShelfLifeValidatorProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [estimateShelfLife, setEstimateShelfLife] = useState(true);

  // Function to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          // Target max width/height
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get compressed image as data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    
    try {
      // Compress the image
      const compressedImage = await compressImage(file);
      setUploadedImage(compressedImage);
      
      // Start API validation process
      validateImage(compressedImage);
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error("Failed to process the image");
    } finally {
      setIsUploading(false);
    }
  };

  // Format and clean up AI messages
  const formatAIMessage = (message: string): string => {
    // Remove confidence information and "Image is clear" text
    return message
      .replace(/Confidence:\s*\d+%/i, '')
      .replace(/Image is clear and shows relevant dates/i, '')
      .replace(/dont show this part/i, '')
      .trim();
  };

  const validateImage = async (imageData: string) => {
    setValidationStatus('validating');
    
    try {
      // Extract base64 data from the data URL
      const base64Data = imageData.split(',')[1];
      
      // Call the backend API to validate the image
      const response = await axios.post('http://localhost:5000/api/validate-expiry', {
        image: base64Data,
        estimateShelfLife: estimateShelfLife
      });
      
      const data = response.data;
      
      if (data.isValid) {
        // Process successful validation
        const result: ValidationResult = {
          isValid: true,
          message: formatAIMessage(data.message) || "Food item is valid for donation",
          detectedDate: data.detectedDate,
          expiryDate: data.expiryDate,
          suggestedExpiry: data.suggestedExpiry ? new Date(data.suggestedExpiry) : undefined,
          confidenceScore: data.confidenceScore,
          foodType: data.foodType,
          estimatedShelfLife: data.estimatedShelfLife
        };
        
        setValidationStatus('valid');
        setValidationResult(result);
        onValidationComplete(result);
        toast.success("Food verified as safe for donation");
      } else {
        // Process failed validation
        const result: ValidationResult = {
          isValid: false,
          message: formatAIMessage(data.message) || "This food item may not be suitable for donation",
          confidenceScore: data.confidenceScore,
          foodType: data.foodType,
          estimatedShelfLife: data.estimatedShelfLife,
          expiryDate: data.expiryDate
        };
        setValidationStatus('invalid');
        setValidationResult(result);
        onValidationComplete(result);
        toast.error("This food item may not be suitable for donation");
      }
    } catch (error) {
      console.error('Error validating image:', error);
      const result: ValidationResult = {
        isValid: false,
        message: "Failed to validate the image. Please try again."
      };
      setValidationStatus('invalid');
      setValidationResult(result);
      onValidationComplete(result);
      toast.error("Failed to validate image. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="text-center">
          <h3 className="text-lg font-medium">Shelf Life Validator</h3>
          <p className="text-sm text-muted-foreground">
            Upload an image of the food item or invoice for validation
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            id="estimate-shelf-life"
            checked={estimateShelfLife}
            onChange={(e) => setEstimateShelfLife(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
          <label htmlFor="estimate-shelf-life" className="text-sm text-muted-foreground">
            Estimate shelf life for items without visible dates
          </label>
        </div>
        
        <div className="w-full">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          {!uploadedImage ? (
            <label 
              htmlFor="image-upload" 
              className="block w-full h-40 border-2 border-dashed rounded-md cursor-pointer bg-secondary/30 border-secondary hover:bg-secondary/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Click to upload an image"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG
                </span>
              </div>
            </label>
          ) : (
            <Card className="relative overflow-hidden p-0">
              <div className="aspect-video bg-secondary/30 rounded-md overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded food" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${
                  validationStatus === 'validating' ? 'opacity-70' : 'opacity-0'
                }`}
              >
                {validationStatus === 'validating' && (
                  <div className="animate-pulse text-white text-center">
                    <p className="font-semibold">Analyzing image...</p>
                    <p className="text-sm">Checking manufacturing date and expiry</p>
                  </div>
                )}
              </div>
              
              {validationStatus !== 'idle' && validationStatus !== 'validating' && (
                <div className={`absolute top-2 right-2 rounded-full p-1 ${
                  validationStatus === 'valid' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {validationStatus === 'valid' 
                    ? <Check className="h-4 w-4 text-white" /> 
                    : <AlertCircle className="h-4 w-4 text-white" />
                  }
                </div>
              )}
            </Card>
          )}
          
          {uploadedImage && (
            <div className="mt-2 flex justify-between">
              <p className="text-sm text-muted-foreground truncate max-w-[50%]">
                {validationStatus === 'validating' 
                  ? "Analyzing image..." 
                  : validationStatus === 'valid'
                    ? "Food validated as safe for donation" 
                    : validationStatus === 'invalid'
                      ? "Validation failed - food may not be suitable" 
                      : "Image uploaded"}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setUploadedImage(null);
                  setValidationStatus('idle');
                  setValidationResult(null);
                }}
              >
                Replace
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {validationStatus === 'valid' && (
        <div className="rounded-md bg-green-50 p-3 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Food validated successfully</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{validationResult?.message || "This food appears to be suitable for donation."}</p>
                {validationResult && (
                  <ul className="list-disc pl-5 mt-1">
                    {validationResult.foodType && (
                      <li>Food Type: {validationResult.foodType}</li>
                    )}
                    {validationResult.detectedDate && (
                      <li>Manufacturing Date: {validationResult.detectedDate}</li>
                    )}
                    {validationResult.expiryDate && (
                      <li>Detected Expiry: {validationResult.expiryDate}</li>
                    )}
                    {!validationResult.expiryDate && validationResult.estimatedShelfLife && (
                      <li>Estimated Shelf Life: {validationResult.estimatedShelfLife}</li>
                    )}
                    {validationResult.suggestedExpiry && (
                      <li>Suggested Use By: {validationResult.suggestedExpiry.toLocaleDateString()}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {validationStatus === 'invalid' && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{validationResult?.message || "This food may not be suitable for donation."}</p>
                <ul className="list-disc pl-5 mt-1">
                  {validationResult?.foodType && (
                    <li>Food Type: {validationResult.foodType}</li>
                  )}
                  {validationResult?.expiryDate && (
                    <li>Detected Expiry: {validationResult.expiryDate}</li>
                  )}
                  {validationResult?.estimatedShelfLife && (
                    <li>Estimated Shelf Life: {validationResult.estimatedShelfLife}</li>
                  )}
                  <li>Please check that the item is properly sealed and undamaged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!uploadedImage && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Upload food/invoice image</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Estimate shelf life & freshness</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <AlertCircle className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">AI validates donation suitability</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelfLifeValidator;

