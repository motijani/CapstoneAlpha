// src/components/LineChartComponent.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-chart-kit';
import { getCurrentAndPredictedData } from '../scripts/csvParser'; // Keep this import

const LineChartComponent = ({
  data,
  title,
  xAxis = 'timestamp',
  yAxis = 'value',
  color = '#7D4ED4', // Primary color (Historical Glucose - Purple)
  secondaryDataKey, // Key for secondary line (Insulin)
  secondaryColor = '#4EAEDC', // Secondary color (Insulin - Blue)
  predictionColor = '#51ff00', // Prediction color (Full Glucose Line - Green)
  barData = [],
  chartHeight = 350,
  isOneDay = true,
  limitDataPoints = 0 // Number of data points to limit to (0 = no limit)
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        labels: [],
        datasets: [{ data: [0], color: () => color, strokeWidth: 2 }]
      };
    }

    // First sort the data chronologically
    const fullSortedData = [...data].sort((a, b) => new Date(a[xAxis]) - new Date(b[xAxis]));
    
    // Get prediction information from the ORIGINAL data, not the limited data
    const { predictedData } = getCurrentAndPredictedData(fullSortedData);
    const hasPrediction = isOneDay && predictedData;
    
    // Debug: Log the original data length
    console.log(`Original data length: ${fullSortedData.length}`);
    console.log(`Limiting to ${limitDataPoints} points`);
    
    // Apply data point limiting if specified
    let limitedFullSortedData = [...fullSortedData];
    
    // Only apply limiting if we have more points than the limit AND the limit is greater than 0
    if (limitDataPoints > 0 && fullSortedData.length > limitDataPoints) {
      if (hasPrediction) {
        // If we have a prediction point, keep it and take the previous N-1 points
        const lastPoint = fullSortedData[fullSortedData.length - 1]; // Prediction point
        const previousPoints = fullSortedData.slice(-limitDataPoints - 1, -1); // Previous N points
        limitedFullSortedData = [...previousPoints, lastPoint];
      } else {
        // No prediction point, just take the last N points
        limitedFullSortedData = fullSortedData.slice(-limitDataPoints);
      }
      
      // Debug: Log the limited data
      console.log(`Limited data: ${limitedFullSortedData.length} points`);
    } else {
      // If we have fewer points than the limit, use all available points
      console.log(`Using all available data points: ${limitedFullSortedData.length}`);
    }
    
    const historicalPlotData = hasPrediction ? limitedFullSortedData.slice(0, -1) : [...limitedFullSortedData];

    let labels = [];
    let finalLabels = [];
    // Use the limited data for labels when limiting is applied
    const labelDataSource = hasPrediction ? limitedFullSortedData : historicalPlotData;

    if (labelDataSource.length > 0) {
        labels = labelDataSource.map((item) => {
          const date = new Date(item[xAxis]);
          if (isOneDay) {
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }
        });

        // When limiting data points, show all labels
        if (limitDataPoints > 0) {
          // Show all labels when limiting data points
          finalLabels = [...labels];
          console.log(`Using all labels: ${finalLabels.length}`);
        } else {
          // For one-day view, only show labels every 2 hours (0:00, 2:00, 4:00, etc.)
          if (isOneDay) {
            finalLabels = labels.filter((label, index) => {
              const date = new Date(labelDataSource[index][xAxis]);
              // Only include labels for even hours and minutes are 00
              return date.getHours() % 2 === 0 && date.getMinutes() === 0;
            });
            
            // If we don't have any labels that match our criteria, fall back to showing some labels
            if (finalLabels.length === 0) {
              const numLabelsToShow = 8; // Target number of labels
              const step = labels.length > numLabelsToShow ? Math.ceil(labels.length / numLabelsToShow) : 1;
              finalLabels = labels.filter((_, i) => i % step === 0);
            }
          } else {
            // For multi-day view, keep the original logic
            const numLabelsToShow = 8; // Target number of labels
            const step = labels.length > numLabelsToShow ? Math.ceil(labels.length / numLabelsToShow) : 1;
            finalLabels = labels.filter((_, i) => i % step === 0);
          }
        }

        // Ensure last label is included if predicting and it wasn't picked by filter step
        if (hasPrediction && labels.length > 0 && !finalLabels.includes(labels[labels.length - 1])) {
             finalLabels.push(labels[labels.length - 1]);
        }


        // Add "24:00" label if needed for isOneDay view
        if (isOneDay) {
            const lastDataPointDate = new Date(fullSortedData[fullSortedData.length - 1][xAxis]);
            if (lastDataPointDate.getHours() < 23 || (lastDataPointDate.getHours() === 23 && lastDataPointDate.getMinutes() < 59)) {
                if (finalLabels[finalLabels.length - 1] !== "24:00") {
                   const lastOriginalLabel = labels[labels.length - 1];
                   if (lastOriginalLabel !== "23:59" && lastOriginalLabel !== "0:00") {
                       finalLabels.push("24:00");
                   }
                }
            }
        }
    } else {
        finalLabels = [];
    }

    let chartDatasets = [];
    // Use the limited data for plotting
    const glucoseFull = limitedFullSortedData.map(item => item[yAxis]);
    const glucoseHistorical = historicalPlotData.map(item => item[yAxis]);
    let insulinHistorical = [];
    if (secondaryDataKey) {
        insulinHistorical = historicalPlotData.map(item => item[secondaryDataKey]);
    }

    // Check if padding is needed based on the *original* labels length vs finalLabels
    const needsPadding = finalLabels.length > labels.length;

    if (needsPadding) {
        glucoseFull.push(null);
        glucoseHistorical.push(null);
        if (secondaryDataKey) {
            insulinHistorical.push(null);
        }
    }

    // Log the data we're about to use for the chart
    console.log("Glucose data points:", glucoseFull.length);
    console.log("Glucose values:", glucoseFull);
    if (secondaryDataKey) {
      console.log("Insulin data points:", insulinHistorical.length);
    }
    
    // Create a single dataset for glucose with the prediction point styled differently
    chartDatasets.push({
      data: glucoseFull,
      color: (opacity = 1) => color,
      strokeWidth: 2,
      propsForDots: {
        r: (dataPoint, dataPointIndex) => {
          // Make the last point slightly larger
          return dataPointIndex === glucoseFull.length - 1 ? "6" : "4";
        },
        fill: (dataPoint, dataPointIndex) => {
          // Always use prediction color for the last point
          return dataPointIndex === glucoseFull.length - 1 ? predictionColor : color;
        },
        stroke: (dataPoint, dataPointIndex) => {
          // Always use prediction color for the last point
          return dataPointIndex === glucoseFull.length - 1 ? predictionColor : color;
        }
      }
    });
    
    if (secondaryDataKey) { // Dataset for Insulin (Blue)
      chartDatasets.push({
        data: insulinHistorical,
        color: (opacity = 1) => secondaryColor,
        strokeWidth: 2,
        propsForDots: { r: "4", fill: secondaryColor, stroke: secondaryColor }
      });
    }

    return {
      labels: finalLabels,
      datasets: chartDatasets
    };
  }, [data, xAxis, yAxis, color, secondaryDataKey, secondaryColor, predictionColor, isOneDay, limitDataPoints]);

   const barChartData = useMemo(() => {
     if (!barData || barData.length === 0 || !isOneDay) {
       return null;
     }
     const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
     const normalizedBarData = Array.from({ length: 24 }, (_, i) => barData[i] || 0);
     return {
       labels: labels.filter((_, i) => i % 3 === 0),
       datasets: [{ data: normalizedBarData, color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})` }]
     };
   }, [barData, isOneDay]);

  if (!chartData || !chartData.datasets || chartData.datasets.length === 0 || chartData.labels.length === 0) {
      return (
          <View style={[styles.container, { height: chartHeight }]}>
              <Text style={styles.noDataText}>No data available for selected period</Text>
          </View>
      );
  }

  const mainChartConfig = {
      backgroundColor: '#FFFFFF',
      backgroundGradientFrom: '#FFFFFF',
      backgroundGradientTo: '#FFFFFF',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
      style: { borderRadius: 10 },
      // Remove propsForDots from here to prevent overriding the dataset's propsForDots
      propsForLabels: { fontSize: 10 },
      yLabelsOffset: 5,
      xAxisLabel: 'Time',
      yAxisLabel: 'Value',
      yAxisInterval: 1, // Show all data points
      formatYLabel: (yValue) => yValue.toString(),
      formatXLabel: (xValue) => xValue.toString()
    };

   const barChartSpecificConfig = {
      backgroundColor: '#F9F6FF',
      backgroundGradientFrom: '#F9F6FF',
      backgroundGradientTo: '#F9F6FF',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
      barPercentage: 0.7,
      propsForLabels: { fontSize: 10 }
    };

  return (
    <View style={styles.container}>
      {/* Debug info to show data points */}
      <View style={{ marginBottom: 10, padding: 5, backgroundColor: '#f0f0f0', borderRadius: 5, width: '100%' }}>
        <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
          Displaying {chartData.datasets[0].data.length} data points
        </Text>
      </View>
      
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 20}
        height={chartHeight}
        chartConfig={mainChartConfig}
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        fromZero={false}
        segments={5}
        bezier={false}
        withDots={true}
        withShadow={false}
        dotSize={6}
      />

      {/* Bar Chart Section */}
      {isOneDay && barChartData && barChartData.datasets && barChartData.datasets[0].data.length > 0 && (
        <View style={styles.barChartContainer}>
          <Text style={styles.barChartTitle}>Calories Consumed vs Burnt</Text>
          <BarChart
            data={barChartData}
            width={Dimensions.get('window').width - 32}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={barChartSpecificConfig}
            style={styles.barChart}
            verticalLabelRotation={0}
            showValuesOnTopOfBars={true}
            fromZero={true}
          />
        </View>
      )}
    </View>
  );
};

// Styles - Removed paddingLeft and paddingRight from styles.chart
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  chart: {
    marginTop: 10,
    borderRadius: 10,
    // paddingRight: 30, // Removed
    // paddingLeft: 15 // Removed
    // Add margin if needed to separate from other elements
    // marginRight: 10,
    // marginLeft: 5
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },
  barChartContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10
  },
  barChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#FFA500',
  },
  barChart: {
    borderRadius: 10,
    marginBottom: 10,
  }
});

export default LineChartComponent;
