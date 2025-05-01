import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as Papa from 'papaparse';
import { Platform } from 'react-native';

// Static mapping of CSV filenames to required assets
const CSV_MODULES = {
  'extended_30day_data.csv': require('../assets/extended_30day_data.csv'),
  'split_Processed_Patient_3_part1.csv': require('../split_Processed_Patient_3_part1.csv'),
  'split_Processed_Patient_3_part2.csv': require('../split_Processed_Patient_3_part2.csv'),
  // Add more CSVs here as needed...
};

// Load and parse a CSV file from assets
export const loadCSVFromAssets = async (csvFileName) => {
  console.log(`Attempting to load CSV file: ${csvFileName}`);
  
  try {
    // For web platform, use a different approach
    if (Platform.OS === 'web') {
      const csvModule = CSV_MODULES[csvFileName];
      if (!csvModule) {
        console.error(`Unknown CSV file requested: ${csvFileName}`);
        return [];
      }
      
      // Use fetch for web
      const response = await fetch(csvModule);
      const csvText = await response.text();
      return parseCSV(csvText);
    } else {
      // For native platforms, use Expo's Asset system
      const csvModule = CSV_MODULES[csvFileName];
      if (!csvModule) {
        console.error(`Unknown CSV file requested: ${csvFileName}`);
        return [];
      }
      
      const asset = Asset.fromModule(csvModule);
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        throw new Error('Failed to get localUri for asset');
      }
      
      console.log(`Asset downloaded, localUri: ${asset.localUri}`);
      const csvText = await FileSystem.readAsStringAsync(asset.localUri);
      
      // Use Papa Parse for more robust CSV parsing
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          const HEADER_MAP = {
            'Timestamp': 'timestamp',
            'Glucose': 'glucose',
            'Glucose_Makeshift': 'insulin',
            'CaloriesConsumed': 'calories_consumed',
            'CaloriesBurnt': 'calories_burned',
          };
          return HEADER_MAP[header.trim()] || header.trim().toLowerCase();
        },
        transform: (value) => {
          return value !== undefined && !isNaN(Number(value)) ? Number(value) : value;
        }
      });
      
      if (parseResult.errors.length > 0) {
        console.warn('CSV parsing had errors:', parseResult.errors);
      }
      
      // Process the data to ensure it has all required fields
      const processedData = parseResult.data.map(item => {
        // Ensure all required fields exist
        const processedItem = {
          timestamp: item.timestamp || '',
          glucose: item.glucose || 0,
          insulin: item.insulin || 0,
          calories_consumed: item.calories_consumed || 0,
          calories_burned: item.calories_burned || 0
        };
        
        // For split_Processed_Patient_3_part1.csv, generate insulin values based on glucose
        if (csvFileName === 'split_Processed_Patient_3_part1.csv' && !item.insulin && item.glucose) {
          // Generate a synthetic insulin value that's correlated with glucose
          // This is a simple formula that creates a reasonable relationship
          processedItem.insulin = Math.max(1, (item.glucose / 50) + (Math.random() * 2));
        }
        
        return processedItem;
      });
      
      return processedData;
    }
  } catch (error) {
    console.error(`Error loading CSV file: ${csvFileName}`, error);
    // Return sample data for development/testing
    return generateSampleData();
  }
};

// Generate sample data for development/testing when CSV loading fails
const generateSampleData = () => {
  console.log("Generating sample data as fallback");
  const data = [];
  
  // Use the current date as the base date for sample data
  const now = new Date();
  const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(`Generating sample data for date: ${baseDate.toISOString().split('T')[0]}`);
  
  // Generate data points every 5 minutes for 24 hours
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const timestamp = new Date(baseDate);
      timestamp.setHours(h, m);
      
      // Create a more interesting glucose pattern
      let glucoseBase = 120; // Base glucose level
      
      // Add time-of-day variation (higher after meals, lower at night)
      if (h >= 7 && h < 9) glucoseBase += 30; // Breakfast
      if (h >= 12 && h < 14) glucoseBase += 40; // Lunch
      if (h >= 18 && h < 20) glucoseBase += 35; // Dinner
      if (h >= 0 && h < 5) glucoseBase -= 20; // Night time
      
      // Add some randomness
      const glucose = glucoseBase + (Math.random() * 30) - 15;
      
      data.push({
        timestamp: timestamp.toISOString(),
        glucose: parseFloat(glucose.toFixed(1)),
        insulin: Math.max(1, (glucose / 50) + (Math.random() * 2)),
        calories_consumed: Math.floor(Math.random() * 300) + 50,
        calories_burned: Math.floor(Math.random() * 200) + 20
      });
    }
  }
  
  // Add a prediction point
  const predictionTime = new Date(baseDate);
  predictionTime.setHours(24, 5); // Next day, 00:05
  
  // Make prediction based on the last few points
  const lastPoints = data.slice(-5);
  const avgGlucose = lastPoints.reduce((sum, p) => sum + p.glucose, 0) / lastPoints.length;
  const trend = (lastPoints[lastPoints.length - 1].glucose - lastPoints[0].glucose) / 5;
  const predictedGlucose = avgGlucose + (trend * 2);
  
  data.push({
    timestamp: predictionTime.toISOString(),
    glucose: parseFloat(predictedGlucose.toFixed(1)),
    insulin: Math.max(1, (predictedGlucose / 50) + (Math.random() * 2)),
    calories_consumed: 0,
    calories_burned: 0
  });
  
  console.log(`Generated ${data.length} sample data points`);
  return data;
};

// Generate additional sample data for a specific date if needed
export const generateAdditionalSampleData = (date) => {
  console.log(`Generating additional sample data for date: ${date}`);
  const data = [];
  const baseDate = new Date(date);
  
  // Generate data points every 5 minutes for 24 hours
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const timestamp = new Date(baseDate);
      timestamp.setHours(h, m);
      
      // Create a more interesting glucose pattern
      let glucoseBase = 120; // Base glucose level
      
      // Add time-of-day variation (higher after meals, lower at night)
      if (h >= 7 && h < 9) glucoseBase += 30; // Breakfast
      if (h >= 12 && h < 14) glucoseBase += 40; // Lunch
      if (h >= 18 && h < 20) glucoseBase += 35; // Dinner
      if (h >= 0 && h < 5) glucoseBase -= 20; // Night time
      
      // Add some randomness
      const glucose = glucoseBase + (Math.random() * 30) - 15;
      
      data.push({
        timestamp: timestamp.toISOString(),
        glucose: parseFloat(glucose.toFixed(1)),
        insulin: Math.max(1, (glucose / 50) + (Math.random() * 2)),
        calories_consumed: Math.floor(Math.random() * 300) + 50,
        calories_burned: Math.floor(Math.random() * 200) + 20
      });
    }
  }
  
  console.log(`Generated ${data.length} additional sample data points`);
  return data;
};

// Get the current glucose data (second-to-last row) and predicted data (last row)
export const getCurrentAndPredictedData = (data) => {
  if (!data || data.length < 2) {
    return { currentData: null, predictedData: null };
  }
  
  // Sort data by timestamp to ensure we get the correct last and second-to-last rows
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  const currentData = sortedData[sortedData.length - 2]; // Second-to-last row
  const predictedData = sortedData[sortedData.length - 1]; // Last row
  
  return { currentData, predictedData };
};

// Parse CSV text into array of objects with cleaned headers
export const parseCSV = (csvText) => {
  // Use Papa Parse for more robust CSV parsing
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      const HEADER_MAP = {
        'Timestamp': 'timestamp',
        'Glucose': 'glucose',
        'Glucose_Makeshift': 'insulin',
        'CaloriesConsumed': 'calories_consumed',
        'CaloriesBurnt': 'calories_burned',
      };
      return HEADER_MAP[header.trim()] || header.trim().toLowerCase();
    },
    transform: (value) => {
      return value !== undefined && !isNaN(Number(value)) ? Number(value) : value;
    }
  });
  
  if (parseResult.errors.length > 0) {
    console.warn('CSV parsing had errors:', parseResult.errors);
  }
  
  // Process the data to ensure it has all required fields
  const processedData = parseResult.data.map(item => {
    // Ensure all required fields exist
    const processedItem = {
      timestamp: item.timestamp || '',
      glucose: item.glucose || 0,
      insulin: item.insulin || 0,
      calories_consumed: item.calories_consumed || 0,
      calories_burned: item.calories_burned || 0
    };
    
    // If insulin is missing but glucose exists, generate a synthetic value
    if (!item.insulin && item.glucose) {
      // Generate a synthetic insulin value that's correlated with glucose
      processedItem.insulin = Math.max(1, (item.glucose / 50) + (Math.random() * 2));
    }
    
    return processedItem;
  });
  
  return processedData;
};

// Filter data by date range (inclusive)
export const filterDataByDateRange = (data, startDate, endDate, dateField = 'timestamp') => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (startDate === endDate) end.setHours(23, 59, 59, 999);

  return data.filter(item => {
    const dt = new Date(item[dateField]);
    return dt >= start && dt <= end;
  });
};

// Calculate min, max, and average for a numeric field
export const calculateStats = (data, field) => {
  if (!data || data.length === 0) return { min: 0, max: 0, avg: 0 };
  const vals = data.map(item => item[field]).filter(v => !isNaN(v));
  if (vals.length === 0) return { min: 0, max: 0, avg: 0 };

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;

  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    avg: parseFloat(avg.toFixed(2)),
  };
};
