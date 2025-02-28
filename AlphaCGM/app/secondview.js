import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function SecondView() {
  // Navigation handler to go back
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Date Range */}
      <Text style={styles.dateRange}>February 1st - March 2nd</Text>

      {/* Circular Indicators */}
      <View style={styles.circlesContainer}>
        <View style={styles.circle}>
          <Text style={styles.circleValue}>xxx</Text>
          <Text style={styles.circleUnit}>mg/dL</Text>
        </View>
        
        <View style={styles.circle}>
          <Text style={styles.circleValue}>xx</Text>
          <Text style={styles.circleUnit}>U</Text>
        </View>
      </View>

      {/* Tabs (Today, 1W, 1M, etc.) */}
      <View style={styles.tabContainer}>
        <Text style={[styles.tabItem, styles.activeTab]}>Today</Text>
        <Text style={styles.tabItem}>1W</Text>
        <Text style={styles.tabItem}>1M</Text>
        <Text style={styles.tabItem}>3M</Text>
        <Text style={styles.tabItem}>6m</Text>
        <Text style={styles.tabItem}>1Y</Text>
      </View>

      {/* Stats List */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stat 1:</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stat 2:</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stat 3:</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stat 4:</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Stat 5:</Text>
          <Text style={styles.statValue}>-</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  dateRange: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E6E6FA', // Light lavender color
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  circleUnit: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 30,
  },
  tabItem: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 5,
  },
  activeTab: {
    color: '#333',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    color: '#666',
  }
});
