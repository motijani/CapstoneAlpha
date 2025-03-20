import React, { useEffect, useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function GlucoseView() {
  // Default to a single day for detailed 5-minute intervals
  const [dateRange, setDateRange] = useState({
    startDate: '2025-03-01',
    endDate: '2025-03-01'
  });
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

  const [glucoseMetrics, setGlucoseMetrics] = useState({
    glucoseAvg: 'XX',
    glucoseMin: 'XX',
    glucoseMax: 'XX'
  });

  // Helper: if filtering a single day, append full day time stamps.
  const formatDateTime12Hour = (dateStr, isStart) => {
    const timeStr = isStart ? '00:00:00' : '23:59:59';
    const dateTime = new Date(`${dateStr}T${timeStr}`);
    return dateTime.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };
  
  const getDateTimeRange = (startDate, endDate) => {
    if (startDate === endDate) {
      return {
        start: formatDateTime12Hour(startDate, true),
        end: formatDateTime12Hour(endDate, false)
      };
    }
    return { start: startDate, end: endDate };
  };

  // Generate HTML with both parameter updates and data retrieval code.
  const generateTableauHtml = (startDate, endDate) => {
    const { start, end } = getDateTimeRange(startDate, endDate);
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script type="text/javascript" src="https://public.tableau.com/javascripts/api/tableau-2.min.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        #vizContainer { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="vizContainer"></div>
      
      <script>
        let viz = null;
        
        // Initialize the visualization
        function initViz() {
          const containerDiv = document.getElementById("vizContainer");
          const url = "https://public.tableau.com/views/Sample1_17394932043110/Sheet1";
          
          const options = {
            hideTabs: true,
            hideToolbar: true,
            width: "100%",
            height: "100%",
            disableAnimation: true,
            onFirstInteractive: function() {
              console.log("Viz is interactive and loaded");
              const workbook = viz.getWorkbook();
              workbook.changeParameterValueAsync("Start Date", "${start}")
                .then(() => workbook.changeParameterValueAsync("End Date", "${end}"))
                .then(function() {
                  const sheet = workbook.getActiveSheet();
                  let activeSheet = sheet;
                  if (sheet.getSheetType() === 'dashboard') {
                    const worksheets = sheet.getWorksheets();
                    if (worksheets.length > 0) {
                      activeSheet = worksheets[0];
                    }
                  }
                  return activeSheet.zoomAsync("fitdata").then(() => activeSheet.getDataAsync());
                })
                .catch(function(err) {
                  console.error("Error updating parameters, zoom, or retrieving data:", err);
                });
            }
          };
          
          viz = new tableau.Viz(containerDiv, url, options);
        }
        
        // Function to update parameters (and then re-retrieve data)
        function applyDateFilter(startDate, endDate) {
          if (!viz) return;
          const workbook = viz.getWorkbook();
          workbook.changeParameterValueAsync("Start Date", startDate)
            .then(() => workbook.changeParameterValueAsync("End Date", endDate))
            .then(function() {
              const sheet = workbook.getActiveSheet();
              let activeSheet = sheet;
              if (sheet.getSheetType() === 'dashboard') {
                const worksheets = sheet.getWorksheets();
                if (worksheets.length > 0) {
                  activeSheet = worksheets[0];
                }
              }
              return activeSheet.zoomAsync("fitdata").then(() => activeSheet.getDataAsync());
            })
        }
        
        // Check if the Tableau API is loaded and available
        function checkTableauAndInitialize() {
          if (window.tableau && typeof window.tableau.Viz === 'function') {
            initViz();
          } else {
            console.log("Waiting for Tableau API to be available...");
            setTimeout(checkTableauAndInitialize, 100);
          }
        }
        
        document.addEventListener("DOMContentLoaded", function() {
          checkTableauAndInitialize();
        });
        
        // Listen for messages from React Native to update the parameters
        window.addEventListener('message', function(event) {
          const data = JSON.parse(event.data);
          if (data.type === 'updateDateRange') {
            const startDate = data.startDate === data.endDate ? data.startDate + 'T00:00:00' : data.startDate;
            const endDate = data.startDate === data.endDate ? data.endDate + 'T23:59:59' : data.endDate;
            applyDateFilter(startDate, endDate);
          }
        });
      </script>
    </body>
    </html>
    `;
  };

  // Initial HTML with date range
  const [tableauEmbedHTML, setTableauEmbedHTML] = useState(
    generateTableauHtml(dateRange.startDate, dateRange.endDate)
  );

  // Function to update the date range parameter
  const updateDateRangeFilter = (newStartDate, newEndDate) => {
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
    
    // For mobile, regenerate the HTML and send an update message if possible.
    if (Platform.OS !== 'web') {
      setTableauEmbedHTML(generateTableauHtml(newStartDate, newEndDate));
      if (vizRef.current) {
        vizRef.current.injectJavaScript(`
          window.postMessage(JSON.stringify({
            type: 'updateDateRange',
            startDate: '${newStartDate}',
            endDate: '${newEndDate}'
          }), '*');
          true;
        `);
      }
    } else {
      // For web: update existing viz by changing the parameter values
      if (window.viz) {
        const { start, end } = getDateTimeRange(newStartDate, newEndDate);
        const workbook = window.viz.getWorkbook();
        workbook.changeParameterValueAsync("Start Date", start)
          .then(() => workbook.changeParameterValueAsync("End Date", end))
          .then(() => {
            const sheet = workbook.getActiveSheet();
            let activeSheet = sheet;
            if (sheet.getSheetType() === 'dashboard') {
              const worksheets = sheet.getWorksheets();
              if (worksheets.length > 0) {
                activeSheet = worksheets[0];
              }
            }
            return activeSheet.zoomAsync("fitdata").then(() => activeSheet.getDataAsync());
          })
      }
    }
  };

  // Optimized WebView component with better scrolling configuration
  const OptimizedWebView = memo(({ htmlSource }) => {
    return (
      <View style={styles.webViewContainer}>
        <WebView
          ref={vizRef}
          originWhitelist={['*']}
          source={{ html: htmlSource }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={true}
          // Ensure hardware acceleration is enabled on Android
          androidHardwareAccelerationDisabled={false}
          // Allow nested scrolling for smoother interactions
          nestedScrollEnabled={true}
          onMessage={(event) => {
            console.log("Message from WebView:", event.nativeEvent.data);
            try {
              const msgData = JSON.parse(event.nativeEvent.data);
              if (msgData.type === 'glucoseData') {
                setGlucoseMetrics({
                  glucoseAvg: msgData.glucoseAvg,
                  glucoseMin: msgData.glucoseMin,
                  glucoseMax: msgData.glucoseMax
                });
              }
            } catch (e) {
              console.error("Error parsing message:", e);
            }
          }}
          // Prevent unnecessary re-renders during scroll events
          scrollEventThrottle={16}
        />
      </View>
    );
  });

  // Web version using the Tableau JavaScript API directly
  const WebTableauEmbed = () => {
    useEffect(() => {
      const loadTableauAPI = () => {
        return new Promise((resolve, reject) => {
          if (window.tableau && typeof window.tableau.Viz === 'function') {
            return resolve(window.tableau);
          }
          const script = document.createElement('script');
          script.src = 'https://public.tableau.com/javascripts/api/tableau-2.min.js';
          script.async = true;
          script.onload = () => {
            // Increase delay to allow the API to fully initialize
            setTimeout(() => {
              if (window.tableau && typeof window.tableau.Viz === 'function') {
                resolve(window.tableau);
              } else {
                reject(new Error('Tableau API failed to initialize after load'));
              }
            }, 1000); // increased delay from 200ms to 1000ms
          };
          script.onerror = () => reject(new Error('Failed to load Tableau API script'));
          document.body.appendChild(script);
        });
      };
  
      loadTableauAPI()
        .then(() => {
          function initializeViz() {
            const containerDiv = document.getElementById("vizContainer");
            if (!containerDiv) {
              console.error("Container div not found");
              return;
            }
            const url = "https://public.tableau.com/views/Sample1_17394932043110/Sheet1";
            const { start, end } = getDateTimeRange(dateRange.startDate, dateRange.endDate);
            const options = {
              hideTabs: true,
              hideToolbar: true,
              width: "100%",
              height: "100%",
              onFirstInteractive: function() {
                console.log("Viz is interactive and loaded");
                const workbook = window.viz.getWorkbook();
                workbook.changeParameterValueAsync("Start Date", start)
                  .then(() => workbook.changeParameterValueAsync("End Date", end))
                  .then(function() {
                    const sheet = workbook.getActiveSheet();
                    let activeSheet = sheet;
                    if (sheet.getSheetType() === 'dashboard') {
                      const worksheets = sheet.getWorksheets();
                      if (worksheets.length > 0) {
                        activeSheet = worksheets[0];
                      }
                    }
                    return activeSheet.zoomAsync("fitdata").then(() => activeSheet.getDataAsync());
                  });
              }
            };
            try {
              window.viz = new window.tableau.Viz(containerDiv, url, options);
            } catch (err) {
              console.error("Error creating viz:", err);
            }
          }
          initializeViz();
        })
        .catch((err) => {
          console.error(err);
          // Optionally, render a fallback UI or message for the user here.
        });
  
      return () => {
        if (window.viz) {
          try {
            window.viz.dispose();
          } catch (err) {
            console.error("Error disposing viz:", err);
          }
        }
      };
    }, [dateRange]);
  
    return (
      <div id="vizContainer" style={{ width: '100%', height: '100%', border: '1px solid #eee' }}></div>
    );
  };
  
  

  // Render chart based on platform
  const renderChart = () => {
    if (Platform.OS === 'web') {
      return <WebTableauEmbed />;
    } else {
      return <OptimizedWebView htmlSource={tableauEmbedHTML} />;
    }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with current date range */}
      <View style={styles.header}>
        <Text style={styles.title}>GL Level</Text>
        <Text style={styles.dateRange}>{formatDateRange()}</Text>
      </View>

      {/* Chart Container */}
      <View style={styles.chartContainer}>
        {renderChart()}
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

      {/* Glucose & Insulin Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>Glucose</Text>
          <Text style={styles.metricValue}>High: {glucoseMetrics.glucoseMax}</Text>
          <Text style={styles.metricValue}>Low: {glucoseMetrics.glucoseMin}</Text>
          <Text style={styles.metricValue}>Average: {glucoseMetrics.glucoseAvg}</Text>
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
          style={[styles.circlePlaceholder, styles.activeCircle]}
          onPress={handleNavigateToView1}
          activeOpacity={0.7}
        >
          <Text style={styles.circleText}>Glucose</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.circlePlaceholder}
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
    height: 550,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  // New container for the optimized WebView
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
