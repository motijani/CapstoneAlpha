// src/app/glucose.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import LineChartComponent from '../../components/LineChartComponent';
import { loadCSVFromAssets, filterDataByDateRange, calculateStats } from '../../scripts/csvParser';

export default function GlucoseView() {
  // Default to March 1, 2025 for the "Today" tab
  const defaultDate = '2025-03-01';

  const [dateRange, setDateRange] = useState({ startDate: defaultDate, endDate: defaultDate });
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [glucoseMetrics, setGlucoseMetrics] = useState({ min: 0, max: 0, avg: 0 });
  const [insulinMetrics, setInsulinMetrics] = useState({ min: 0, max: 0, avg: 0 });

  const isOneDay = dateRange.startDate === dateRange.endDate;

  // Load CSV once
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await loadCSVFromAssets('extended_30day_data.csv');
        setRawData(data);
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
      // Hourly buckets for glucose/insulin
      for (let h = 0; h < 24; h++) {
        const bucketStart = new Date(`${dateRange.startDate}T${String(h).padStart(2,'0')}:00:00`);
        const bucketEnd = new Date(bucketStart);
        bucketEnd.setMinutes(59, 59, 999);

        const inHour = rawData.filter(item => {
          const t = new Date(item.timestamp);
          return t >= bucketStart && t <= bucketEnd;
        });
        
        const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const g = parseFloat(avg(inHour.map(i => i.glucose)).toFixed(2));
        const ins = parseFloat(avg(inHour.map(i => i.insulin)).toFixed(2));

        buckets.push({ timestamp: bucketStart.toISOString(), glucose: g, insulin: ins });
        
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
    { label: 'Last 7 Days', start: '2025-03-01', end: '2025-03-07' },
    { label: 'Last 14 Days', start: '2025-03-01', end: '2025-03-15' },
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
          <TouchableOpacity style={[styles.circlePlaceholder, isOneDay ? styles.activeCircle : null]} onPress={navigate('/glucose')}>
            <Text style={styles.circleText}>GL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circlePlaceholder} onPress={navigate('/calories')}>
            <Text style={styles.circleText}>Cal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.circlePlaceholder} onPress={navigate('/exercise')}>
            <Text style={styles.circleText}>Ex</Text>
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
    minHeight: 400, 
    borderRadius: 10, 
    overflow: 'hidden', 
    backgroundColor: '#F9F6FF', 
    marginBottom: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 10
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
});