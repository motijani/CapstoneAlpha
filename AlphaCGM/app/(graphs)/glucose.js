// src/app/glucose.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import LineChartComponent from '../../components/LineChartComponent';
import { loadCSVFromAssets, filterDataByDateRange, calculateStats, getCurrentAndPredictedData } from '../../scripts/csvParser';

export default function GlucoseView() {
  // Default to March 30, 2025 for the "Today" tab (date of the second-to-last row)
  const defaultDate = '2025-03-30';

  const [dateRange, setDateRange] = useState({ startDate: defaultDate, endDate: defaultDate });
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [glucoseMetrics, setGlucoseMetrics] = useState({ min: 0, max: 0, avg: 0 });
  const [insulinMetrics, setInsulinMetrics] = useState({ min: 0, max: 0, avg: 0 });
  const [currentData, setCurrentData] = useState(null);
  const [predictedData, setPredictedData] = useState(null);

  const isOneDay = dateRange.startDate === dateRange.endDate;

  // Load CSV once and get current data (second-to-last row)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await loadCSVFromAssets('extended_30day_data.csv');
        setRawData(data);
        
        // Get current data from second-to-last row and predicted data from last row
        const { currentData: current, predictedData: predicted } = getCurrentAndPredictedData(data);
        setCurrentData(current);
        setPredictedData(predicted);
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute chart data and bar ratios
  useEffect(() => {
    if (!rawData.length) return;
    let buckets = [];
    let calorieData = [];

    if (isOneDay) {
      // For "Today" view, group data by hour but keep the last point (prediction) as is
      
      // Filter data for the selected date
      const dateStart = new Date(`${dateRange.startDate}T00:00:00`);
      const dateEnd = new Date(`${dateRange.startDate}T23:59:59.999`);
      
      const dayData = rawData.filter(item => {
        const t = new Date(item.timestamp);
        return t >= dateStart && t <= dateEnd;
      });
      
      // Sort data by timestamp
      const sortedData = [...dayData].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Get the last point (prediction)
      const lastPoint = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;
      
      // Group data by hour (except the last point)
      const hourlyData = [];
      for (let h = 0; h < 24; h++) {
        const hourStart = new Date(`${dateRange.startDate}T${String(h).padStart(2,'0')}:00:00`);
        const hourEnd = new Date(hourStart);
        hourEnd.setMinutes(59, 59, 999);
        
        const inHour = sortedData.filter((item, index) => {
          // Skip the last point (prediction)
          if (index === sortedData.length - 1) return false;
          
          const t = new Date(item.timestamp);
          return t >= hourStart && t <= hourEnd;
        });
        
        if (inHour.length > 0) {
          const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          const g = parseFloat(avg(inHour.map(i => i.glucose)).toFixed(2));
          const ins = parseFloat(avg(inHour.map(i => i.insulin)).toFixed(2));
          
          hourlyData.push({ 
            timestamp: hourStart.toISOString(), 
            glucose: g, 
            insulin: ins 
          });
        }
      }
      
      // Add the last point (prediction) to the hourly data
      if (lastPoint) {
        hourlyData.push(lastPoint);
      }
      
      buckets = hourlyData;
      
      // Generate calorie data for each hour
      for (let h = 0; h < 24; h++) {
        
        // Generate calorie consumption vs burnt data for bar graph
        // For demo purposes, let's create some sample calorie data
        // In a real app, this would come from your actual calorie tracking data
        const consumed = Math.floor(Math.random() * 300) + 50; // Random between 50-350
        const burnt = Math.floor(Math.random() * 200) + 20;    // Random between 20-220
        
        // The difference between consumed and burnt calories
        calorieData.push(consumed - burnt);
      }
    } else {
      // Daily averages for multi-day
      const filtered = filterDataByDateRange(rawData, dateRange.startDate, dateRange.endDate, 'timestamp');
      const grouped = {};
      filtered.forEach(item => {
        const d = new Date(item.timestamp);
        const key = d.toISOString().split('T')[0];
        if (!grouped[key]) grouped[key] = { sumG: 0, sumI: 0, count: 0 };
        grouped[key].sumG += item.glucose;
        grouped[key].sumI += item.insulin;
        grouped[key].count += 1;
      });
      buckets = Object.entries(grouped).map(([day, { sumG, sumI, count }]) => ({
        timestamp: `${day}T00:00:00`,
        glucose: parseFloat((sumG / count).toFixed(2)),
        insulin: parseFloat((sumI / count).toFixed(2)),
      }));
      calorieData = []; // no bar chart for multi-day
    }

    setChartData(buckets);
    setBarData(calorieData);
    setGlucoseMetrics(calculateStats(buckets, 'glucose'));
    setInsulinMetrics(calculateStats(buckets, 'insulin'));
  }, [rawData, dateRange]);

  // Navigation and tab handling
  const navigate = path => () => router.push(path);
  const updateDateRange = (s, e) => setDateRange({ startDate: s, endDate: e });

  // Header formatting
  const formatHeader = () => {
    const [y, m, d] = dateRange.startDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    if (isOneDay) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const [ey, em, ed] = dateRange.endDate.split('-').map(Number);
    const end = new Date(ey, em - 1, ed);
    return `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})} - ${end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
  };

  // Preset tabs
  const presets = [
    { label: 'Today', start: defaultDate, end: defaultDate },
    { label: 'Last 7 Days', start: '2025-03-24', end: '2025-03-30' },
    { label: 'Last 14 Days', start: '2025-03-17', end: '2025-03-30' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GL Level</Text>
          <Text style={styles.dateRange}>{formatHeader()}</Text>
        </View>

        {/* Combined Line + Bar Chart */}
        <View style={styles.chartContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading data...</Text>
          ) : (
            <>
              <LineChartComponent
                data={chartData}
                title="Glucose Level"
                xAxis="timestamp"
                yAxis="glucose"
                secondaryDataKey="insulin"
                barData={barData}
                barColor="#FFA500"
                color="#7D4ED4"
                secondaryColor="#4EAEDC"
                chartHeight={350}
                isOneDay={isOneDay}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#7D4ED4' }]} />
                  <Text style={styles.legendText}>Glucose</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4EAEDC' }]} />
                  <Text style={styles.legendText}>Insulin</Text>
                </View>
                {isOneDay && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#51ff00' }]} />
                    <Text style={styles.legendText}>Predicted Glucose (Next 5 min)</Text>
                  </View>
                )}
              </View>
              <Text style={styles.chartNote}>
                {isOneDay 
                  ? "Note: Data is shown chronologically from left to right. The orange point at the end is the predicted glucose level for the next 5 minutes."
                  : "Note: Data is shown chronologically from left to right, displaying average values for each day."}
              </Text>
            </>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {presets.map(p => (
            <TouchableOpacity key={p.label} onPress={() => updateDateRange(p.start, p.end)}>
              <Text style={[
                styles.tabItem,
                dateRange.startDate === p.start && dateRange.endDate === p.end ? styles.activeTab : null
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Glucose</Text>
            <Text style={styles.metricValue}>High: {glucoseMetrics.max}</Text>
            <Text style={styles.metricValue}>Low: {glucoseMetrics.min}</Text>
            <Text style={styles.metricValue}>Avg: {glucoseMetrics.avg}</Text>
          </View>
          <View style={[styles.metricBox, { marginLeft: 10 }]}>  
            <Text style={styles.metricTitle}>Insulin</Text>
            <Text style={styles.metricValue}>High: {insulinMetrics.max}</Text>
            <Text style={styles.metricValue}>Low: {insulinMetrics.min}</Text>
            <Text style={styles.metricValue}>Avg: {insulinMetrics.avg}</Text>
          </View>
        </View>
        
        {/* Glucose Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Glucose Summary</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryLevel}>
              <Text style={styles.summaryLabel}>Current Level:</Text>
              <Text style={[
                styles.summaryValue, 
                currentData && currentData.glucose < 70 ? styles.lowGlucose : 
                currentData && currentData.glucose > 180 ? styles.highGlucose : 
                styles.normalGlucose
              ]}>
                {currentData ? currentData.glucose.toFixed(1) : '0'} mg/dL
              </Text>
            </View>
            <View style={styles.summaryStatus}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                currentData && currentData.glucose < 70 ? styles.lowStatus :
                currentData && currentData.glucose > 180 ? styles.highStatus :
                styles.normalStatus
              ]}>
                {currentData && currentData.glucose < 70 ? 'LOW' : 
                 currentData && currentData.glucose > 180 ? 'HIGH' : 
                 'NORMAL'}
              </Text>
            </View>
            <View style={styles.summaryAction}>
              <Text style={styles.summaryLabel}>Recommended Action:</Text>
              <Text style={styles.actionValue}>
                {currentData && currentData.glucose < 70 ? 'Consider consuming 15g of fast-acting carbs' : 
                 currentData && currentData.glucose > 180 ? 'Check if insulin dose is needed' : 
                 'No adjustments needed at this time'}
              </Text>
            </View>
            <View style={styles.summaryTime}>
              <Text style={styles.summaryLabel}>Last Reading:</Text>
              <Text style={styles.timeValue}>
                {currentData ? new Date(currentData.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </Text>
            </View>
            <View style={styles.summaryPrediction}>
              <Text style={styles.summaryLabel}>Predicted Level (Next 5 min):</Text>
              <Text style={[
                styles.summaryValue, 
                predictedData && predictedData.glucose < 70 ? styles.lowGlucose : 
                predictedData && predictedData.glucose > 180 ? styles.highGlucose : 
                styles.normalGlucose
              ]}>
                {predictedData ? predictedData.glucose.toFixed(1) : '0'} mg/dL
              </Text>
            </View>
          </View>
        </View>
        
        {/* Calorie Info (Only for Today view) */}
        {isOneDay && (
          <View style={styles.calorieContainer}>
            <Text style={styles.calorieTitle}>Daily Calorie Balance</Text>
            <View style={styles.calorieSummary}>
              <View style={styles.calorieItem}>
                <Text style={styles.calorieLabel}>Consumed</Text>
                <Text style={styles.calorieValue}>2,450</Text>
              </View>
              <View style={styles.calorieItem}>
                <Text style={styles.calorieLabel}>Burnt</Text>
                <Text style={styles.calorieValue}>1,850</Text>
              </View>
              <View style={styles.calorieItem}>
                <Text style={styles.calorieLabel}>Net</Text>
                <Text style={[styles.calorieValue, { color: '#FFA500' }]}>+600</Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.circlesContainer}>
          <TouchableOpacity style={[styles.circlePlaceholder, styles.activeCircle]} onPress={navigate('/glucose')}>
            <Text style={styles.circleText}>GL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circlePlaceholder} onPress={navigate('/meal-plans')}>
            <Text style={styles.circleText}>Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circlePlaceholder} onPress={navigate('/log-entries')}>
            <Text style={styles.circleText}>Log</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 20 : 50, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  dateRange: { fontSize: 14, color: '#666' },
  chartContainer: { 
    minHeight: 450, 
    borderRadius: 10, 
    overflow: 'hidden', 
    backgroundColor: '#F9F6FF', 
    marginBottom: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 5
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5
  },
  legendText: {
    fontSize: 12,
    color: '#666'
  },
  chartNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 10
  },
  loadingText: { fontSize: 16, color: '#666' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  tabItem: { fontSize: 14, color: '#999', padding: 5 },
  activeTab: { color: '#7D4ED4', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#7D4ED4' },
  metricsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metricBox: { flex: 1, backgroundColor: '#F9F6FF', borderRadius: 10, padding: 15, alignItems: 'center' },
  metricTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#7D4ED4' },
  metricValue: { fontSize: 14, color: '#333', marginBottom: 4 },
  circlesContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  circlePlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  activeCircle: { backgroundColor: '#E9D5FF', borderWidth: 2, borderColor: '#7D4ED4' },
  circleText: { fontSize: 12, color: '#7D4ED4' },
  calorieContainer: {
    backgroundColor: '#FFF9EF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#FFA500',
    textAlign: 'center',
  },
  calorieSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieItem: {
    alignItems: 'center',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4682B4',
    textAlign: 'center',
  },
  summaryContent: {
    padding: 10,
  },
  summaryLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  summaryTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryPrediction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  lowGlucose: {
    color: '#FF6347',
  },
  normalGlucose: {
    color: '#32CD32',
  },
  highGlucose: {
    color: '#FF8C00',
  },
  lowStatus: {
    color: '#FF6347',
  },
  normalStatus: {
    color: '#32CD32',
  },
  highStatus: {
    color: '#FF8C00',
  },
});
