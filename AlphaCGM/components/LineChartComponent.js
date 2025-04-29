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
  isOneDay = true
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        labels: [],
        datasets: [{ data: [0], color: () => color, strokeWidth: 2 }]
      };
    }

    const { predictedData } = getCurrentAndPredictedData(data);
    const hasPrediction = isOneDay && predictedData;
    const fullSortedData = [...data].sort((a, b) => new Date(a[xAxis]) - new Date(b[xAxis]));
    const historicalPlotData = hasPrediction ? fullSortedData.slice(0, -1) : [...fullSortedData];

    let labels = [];
    let finalLabels = [];
    const labelDataSource = hasPrediction ? fullSortedData : historicalPlotData;

    if (labelDataSource.length > 0) {
        labels = labelDataSource.map((item) => {
          const date = new Date(item[xAxis]);
          if (isOneDay) {
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }
        });

        // Reduce labels, trying to keep first and last if predicting
        const numLabelsToShow = 8; // Target number of labels
        const step = labels.length > numLabelsToShow ? Math.ceil(labels.length / numLabelsToShow) : 1;
        finalLabels = labels.filter((_, i) => i % step === 0);

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
    const glucoseFull = fullSortedData.map(item => item[yAxis]);
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

    chartDatasets.push({ // Dataset 1: Full Glucose Line (Green)
      data: glucoseFull,
      color: (opacity = 1) => predictionColor,
      strokeWidth: 2,
      propsForDots: { r: "4", fill: predictionColor, stroke: predictionColor }
    });
    chartDatasets.push({ // Dataset 2: Historical Glucose (Purple)
      data: glucoseHistorical,
      color: (opacity = 1) => color,
      strokeWidth: 2,
      propsForDots: { r: "4", fill: color, stroke: color }
    });
    if (secondaryDataKey) { // Dataset 3: Historical Insulin (Blue)
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
  }, [data, xAxis, yAxis, color, secondaryDataKey, secondaryColor, predictionColor, isOneDay]);

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
      propsForDots: { r: "4", strokeWidth: "2", stroke: "#FFFFFF" },
      propsForLabels: { fontSize: 10 },
      // ADDED yLabelsOffset to shift Y-axis labels right
      yLabelsOffset: 5, // Adjust this value as needed (positive shifts right)
      // xLabelsOffset: -5 // Keep X labels slightly shifted up if needed
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
      <LineChart
        data={chartData}
        // Adjusted width slightly to compensate for potential offset shift
        width={Dimensions.get('window').width - 20}
        height={chartHeight}
        chartConfig={mainChartConfig}
        bezier
        style={styles.chart} // Removed padding from style
        withInnerLines={true}
        withOuterLines={true}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        fromZero={false}
        segments={5}
        withDots={true}
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
