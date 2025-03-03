import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function secondview() {
  // Navigation handlers
  const handleNavigateToView1 = () => {
    // For now, just log since View 1 isn't implemented
    console.log('Navigate to View 1');
  };
  
  const handleNavigateToView2 = () => {
    // Navigate to secondview
    router.push('/secondview');
  };
  
  const handleNavigateToView3 = () => {
    // For now, just log since View 3 isn't implemented
    console.log('Navigate to View 3');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GL Level</Text>
        <Text style={styles.dateRange}>February 1st - March 2nd</Text>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>[Line Chart Placeholder]</Text>
      </View>

      {/* Tabs (Today, 1W, 1M, etc.) */}
      <View style={styles.tabContainer}>
        <Text style={[styles.tabItem, styles.activeTab]}>Today</Text>
        <Text style={styles.tabItem}>1W</Text>
        <Text style={styles.tabItem}>1M</Text>
        <Text style={styles.tabItem}>3M</Text>
        <Text style={styles.tabItem}>6M</Text>
        <Text style={styles.tabItem}>1Y</Text>
      </View>

      {/* Glucose & Insulin Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>Glucose</Text>
          <Text style={styles.metricValue}>High: XX</Text>
          <Text style={styles.metricValue}>Low: XX</Text>
          <Text style={styles.metricValue}>Average: XX</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>Insulin</Text>
          <Text style={styles.metricValue}>High: XX</Text>
          <Text style={styles.metricValue}>Low: XX</Text>
          <Text style={styles.metricValue}>Average: XX</Text>
        </View>
      </View>

      {/* Circular Placeholders - Now TouchableOpacity */}
      <View style={styles.circlesContainer}>
        <TouchableOpacity 
          style={styles.circlePlaceholder}
          onPress={handleNavigateToView1}
          activeOpacity={0.7}
        >
          <Text style={styles.circleText}>View 1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.circlePlaceholder}
          onPress={handleNavigateToView2}
          activeOpacity={0.7}
        >
          <Text style={styles.circleText}>View 2</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.circlePlaceholder}
          onPress={handleNavigateToView3}
          activeOpacity={0.7}
        >
          <Text style={styles.circleText}>View 3</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 50, // or use SafeAreaView for iOS
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
    height: 120,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPlaceholder: {
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabItem: {
    fontSize: 14,
    color: '#999',
  },
  activeTab: {
    color: '#7D4ED4',
    fontWeight: 'bold',
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
  circleText: {
    fontSize: 12,
    color: '#7D4ED4',
  },
});
