import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import LineChartComponent from '../../components/LineChartComponent';
import { loadCSVFromAssets, filterDataByDateRange, calculateStats } from '../../scripts/csvParser';

export default function CaloriesView() {
  // State for date range selection
  const [dateRange, setDateRange] = useState({
    startDate: '2025-03-01',
    endDate: '2025-03-01'
  });
  
  // State for the data from CSV
  const [caloriesData, setCaloriesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Metrics state
  const [consumedMetrics, setConsumedMetrics] = useState({
    min: 0,
    max: 0,
    avg: 0,
    total: 0
  });
  
  const [burnedMetrics, setBurnedMetrics] = useState({
    min: 0,
    max: 0,
    avg: 0,
    total: 0
  });
  
  // Load CSV data on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load calories data from CSV file
        const data = await loadCSVFromAssets('extended_30day_data.csv');
        setCaloriesData(data);
        
        // Apply initial filtering
        updateFilteredData(data, dateRange.startDate, dateRange.endDate);
      } catch (error) {
        console.error("Error loading calories data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Update filtered data when date range changes
  useEffect(() => {
    updateFilteredData(caloriesData, dateRange.startDate, dateRange.endDate);
  }, [dateRange, caloriesData]);
  
  // Function to update filtered data and calculate metrics
  const updateFilteredData = (data, startDate, endDate) => {
    if (!data || data.length === 0) return;
    
    const filtered = filterDataByDateRange(data, startDate, endDate, 'timestamp');
    setFilteredData(filtered);
    
    // Calculate metrics
    const consumedStats = calculateStats(filtered, 'calories_consumed');
    const totalConsumed = filtered.reduce((sum, item) => sum + item.calories_consumed, 0);
    setConsumedMetrics({
      ...consumedStats,
      total: parseFloat(totalConsumed.toFixed(2))
    });
    
    const burnedStats = calculateStats(filtered, 'calories_burned');
    const totalBurned = filtered.reduce((sum, item) => sum + item.calories_burned, 0);
    setBurnedMetrics({
      ...burnedStats,
      total: parseFloat(totalBurned.toFixed(2))
    });
  };
  
  // Navigation handlers
  const handleNavigateToView1 = () => {
    router.push('/glucose');
  };

  const handleNavigateToView2 = () => {
    router.push('/calories');
  };

  const handleNavigateToView3 = () => {
    router.push('/exercise');
  };
  
  // Format date for display
  const formatDateRange = () => {
    const startDateObj = new Date(dateRange.startDate + "T00:00:00");
    const endDateObj = new Date(dateRange.endDate + "T00:00:00");
    
    return `${startDateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })} - ${endDateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  };
  
  // Predefined date ranges for quick selection
  const dateRangeOptions = [
    { 
      label: 'Today', 
      startDate: '2025-03-01',
      endDate: '2025-03-01'
    },
    { 
      label: 'Last 7 Days', 
      startDate: '2025-03-01',
      endDate: '2025-03-07'
    },
    { 
      label: 'Last 14 Days', 
      startDate: '2025-03-01',
      endDate: '2025-03-15'
    }
  ];
  
  // Update date range filter
  const updateDateRangeFilter = (newStartDate, newEndDate) => {
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
  };
  
  // Check if we have a single day selected (for chart formatting)
  const isOneDay = dateRange.startDate === dateRange.endDate;
  
  // Calculate calorie deficit/surplus
  const calorieBalance = consumedMetrics.total - burnedMetrics.total;
  const isCalorieDeficit = calorieBalance < 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with current date range */}
        <View style={styles.header}>
          <Text style={styles.title}>Calories Consumed - Calories Burnt</Text>
          <Text style={styles.dateRange}>{formatDateRange()}</Text>
        </View>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading data...</Text>
          ) : (
            <LineChartComponent 
              data={filteredData}
              title="Calories"
              xAxis="timestamp"
              yAxis="calories_consumed"
              color="#7D4ED4"
              secondaryDataKey="calories_burned"
              secondaryColor="#FF6B6B"
              chartHeight={350}
              isOneDay={isOneDay}
            />
          )}
        </View>

        {/* Date range selection tabs */}
        <View style={styles.tabContainer}>
          {dateRangeOptions.map((option) => (
            <TouchableOpacity 
              key={option.label} 
              onPress={() => updateDateRangeFilter(option.startDate, option.endDate)}
            >
              <Text style={[
                styles.tabItem, 
                (dateRange.startDate === option.startDate && dateRange.endDate === option.endDate) 
                  ? styles.activeTab : null
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calories Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Calories Consumed</Text>
            <Text style={styles.metricValue}>Total: {consumedMetrics.total}</Text>
            <Text style={styles.metricValue}>Average: {consumedMetrics.avg}/day</Text>
            <Text style={styles.metricValue}>High: {consumedMetrics.max}</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Calories Burned</Text>
            <Text style={styles.metricValue}>Total: {burnedMetrics.total}</Text>
            <Text style={styles.metricValue}>Average: {burnedMetrics.avg}/day</Text>
            <Text style={styles.metricValue}>High: {burnedMetrics.max}</Text>
          </View>
        </View>

        {/* New Feature: Calorie Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Calorie Balance</Text>
          <Text style={[
            styles.balanceValue, 
            isCalorieDeficit ? styles.deficitText : styles.surplusText
          ]}>
            {isCalorieDeficit ? `-${Math.abs(calorieBalance)}` : `+${calorieBalance}`} calories
          </Text>
          <Text style={styles.balanceDescription}>
            {isCalorieDeficit 
              ? "You're in a calorie deficit! This may lead to weight loss if maintained." 
              : "You're in a calorie surplus. Consider adjusting your intake or increasing activity for weight management."}
          </Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.circlesContainer}>
          <TouchableOpacity 
            style={styles.circlePlaceholder}
            onPress={handleNavigateToView1}
            activeOpacity={0.7}
          >
            <Text style={styles.circleText}>Glucose</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.circlePlaceholder, styles.activeCircle]}
            onPress={handleNavigateToView2}
            activeOpacity={0.7}
          >
            <Text style={styles.circleText}>Calories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.circlePlaceholder}
            onPress={handleNavigateToView3}
            activeOpacity={0.7}
          >
            <Text style={styles.circleText}>Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F9F6FF',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  // New container for the optimized WebView (mobile)
  webViewContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabItem: {
    fontSize: 14,
    color: '#999',
    padding: 5,
  },
  activeTab: {
    color: '#7D4ED4',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#7D4ED4',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    color: '#333',
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  circlePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#E9D5FF',
    borderWidth: 2,
    borderColor: '#7D4ED4',
  },
  circleText: {
    fontSize: 12,
    color: '#7D4ED4',
  },
});
