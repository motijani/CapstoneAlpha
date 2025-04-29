import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const csvTestAsset = require('../assets/extended_30day_data.csv');
console.log("CSV asset:", csvTestAsset);
// Static mapping of CSV filenames to required assets
const CSV_CACHE = {};

const CSV_MODULES = {
  'extended_30day_data.csv': require('../assets/extended_30day_data.csv'),
  // Add more CSVs here as needed...
};

// Load and parse a CSV file from assets
export const loadCSVFromAssets = async (csvFileName) => {
  const csvModule = CSV_MODULES[csvFileName];
  if (!csvModule) {
    console.error(`Unknown CSV file requested: ${csvFileName}`);
    return [];
  }

  try {
    const asset = Asset.fromModule(csvModule);
    await asset.downloadAsync();
    const csvText = await FileSystem.readAsStringAsync(asset.localUri);
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error loading CSV file: ${csvFileName}`, error);
    return [];
  }
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
  const lines = csvText.split('\n');
  const HEADER_MAP = {
    'Timestamp':           'timestamp',
    'Glucose':             'glucose',
    'Glucose_Makeshift':   'insulin',
    'CaloriesConsumed':    'calories_consumed',
    'CaloriesBurnt':       'calories_burned',
  };

  const headers = lines[0]
    .split(',')
    .map(h => HEADER_MAP[h.trim()] || h.trim().toLowerCase());

  return lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, idx) => {
        const raw = values[idx];
        row[header] = raw !== undefined && !isNaN(Number(raw)) ? Number(raw) : raw;
      });
      return row;
    });
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
