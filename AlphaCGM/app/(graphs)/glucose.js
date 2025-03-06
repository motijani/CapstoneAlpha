import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function gluscoseView() {
  // Navigation handlers
  const handleNavigateToView1 = () => {
    router.push('/glucose')
  };

  const handleNavigateToView2 = () => {
    // Navigate to secondview
    router.push('/calories');
  };
  
  const handleNavigateToView3 = () => {
    router.push('/exercise')
  };

  const tableauEmbedHTML = `
  <div class='tableauPlaceholder' id='viz1741218063289' style='position: relative'>
    <noscript>
      <a href='#'>
        <img alt='Sheet 1' src='https://public.tableau.com/static/images/Sa/Sample1_17394932043110/Sheet1/1_rss.png' style='border: none' />
      </a>
    </noscript>
    <object class='tableauViz' style='display:none;'>
      <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
      <param name='embed_code_version' value='3' />
      <param name='site_root' value='' />
      <param name='name' value='Sample1_17394932043110/Sheet1' />
      <param name='tabs' value='no' />
      <param name='toolbar' value='yes' />
      <param name='static_image' value='https://public.tableau.com/static/images/Sa/Sample1_17394932043110/Sheet1/1.png' />
      <param name='animate_transition' value='yes' />
      <param name='display_static_image' value='yes' />
      <param name='display_spinner' value='yes' />
      <param name='display_overlay' value='yes' />
      <param name='display_count' value='yes' />
      <param name='language' value='en-US' />
      <param name='filter' value='publish=yes' />
    </object>
  </div>
  <script type='text/javascript'>
    var divElement = document.getElementById('viz1741218063289');
    var vizElement = divElement.getElementsByTagName('object')[0];
    vizElement.style.width='100%';
    vizElement.style.height=(divElement.offsetWidth*0.75)+'px';
    var scriptElement = document.createElement('script');
    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    vizElement.parentNode.insertBefore(scriptElement, vizElement);
  </script>
`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GL Level</Text>
        <Text style={styles.dateRange}>February 1st - March 2nd</Text>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: tableauEmbedHTML }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
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
    overflow: 'hidden', // ensure WebView respects container boundaries
    backgroundColor: '#F0F0F0',
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
