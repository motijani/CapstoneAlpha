import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function glucoseView() {
  //Our initial starting date for reference
  const [currentDate, setCurrentDate] = useState('2015-06-06 16:50:00'); // Default date in ISO format
  const vizRef = useRef(null);
  
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

  // Function to generate HTML with the current date filter
  const generateTableauHtml = (dateFilter) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script type="module" src="https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        tableau-viz { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
     <tableau-viz 
      id="tableauViz"
      src="https://public.tableau.com/views/Sample1_17394932043110/Sheet1"
      device="default"
      toolbar="hidden"
      hide-tabs
      hide-title
      hide-caption
      hide-legend
      hide-tooltips
      hide-ui
      hide-field-labels
    >
      <viz-filter field="Time" value="${dateFilter}" />
    </tableau-viz>

      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const viz = document.getElementById('tableauViz');
          
          viz.addEventListener('firstinteractive', function() {
            console.log('Viz is interactive and loaded with date: ${dateFilter}');
          });
        });
      </script>
    </body>
    </html>
    `;
  };

  // Get the current HTML with filters, for updating the tabs
  const [tableauEmbedHTML, setTableauEmbedHTML] = useState(generateTableauHtml(currentDate));

  // Function to update the date filter
  const updateDateFilter = (newDate) => {
    setCurrentDate(newDate);
    if (Platform.OS === 'web' && vizRef.current) {
      const dateFilter = vizRef.current.querySelector('viz-filter[field="Time"]');
      if (dateFilter) {
        dateFilter.setAttribute('value', newDate);
      }
    } else {
      // For mobile, regenerate the HTML and update the WebView
      setTableauEmbedHTML(generateTableauHtml(newDate));
    }
  };

  // Web version with dynamic filter
  const WebTableauEmbed = () => {
    useEffect(() => {
      // Effect to handle any web-specific initialization
    }, []);

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <tableau-viz
          ref={vizRef}
          id="tableauViz"
          src="https://public.tableau.com/views/Sample1_17394932043110/Sheet1"
          device="default"
          toolbar="hidden"
          hide-tabs
          hide-title
          hide-caption
          hide-legend
          hide-tooltips
          hide-ui
          hide-field-labels
        >
          <viz-filter field="Time" value={currentDate}></viz-filter>
        </tableau-viz>
      </div>
    );
  };

  // Render chart based on platform
  const renderChart = () => {
    if (Platform.OS === 'web') {
      return <WebTableauEmbed />;
    } else {
      return (
        <WebView
          key={currentDate} // This forces a re-render when the date changes
          originWhitelist={['*']}
          source={{ html: tableauEmbedHTML }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      );
    }
  };

  //Way to easily format date for easy understanding
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sample data set, wil be modified later to show range from now - till
  const dateSamples = [
    { label: 'Start', value: '2015-06-06 16:50:00' },  // Original start date
    { label: 'Jun 7', value: '2015-06-07 10:00:00' },
    { label: 'Jun 15', value: '2015-06-15 12:00:00' },
    { label: 'Jul 1', value: '2015-07-01 08:00:00' },
    { label: 'Aug 1', value: '2015-08-01 14:30:00' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with current date */}
      <View style={styles.header}>
        <Text style={styles.title}>GL Level</Text>
        <Text style={styles.dateRange}>{formatDate(currentDate)}</Text>
      </View>

      {/* Chart Container */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {/* Date selection tabs */}
      <View style={styles.tabContainer}>
        {dateSamples.map((date) => (
          <TouchableOpacity 
            key={date.value} 
            onPress={() => updateDateFilter(date.value)}
          >
            <Text style={[
              styles.tabItem, 
              currentDate === date.value ? styles.activeTab : null
            ]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
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

      {/* Navigation Buttons */}
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
    paddingTop: Platform.OS === 'web' ? 20 : 50,
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
    height: 350,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
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
  circleText: {
    fontSize: 12,
    color: '#7D4ED4',
  },
});