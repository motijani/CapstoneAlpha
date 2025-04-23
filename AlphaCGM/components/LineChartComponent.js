// src/components/LineChartComponent.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-chart-kit';

const LineChartComponent = ({ 
  data, 
  title, 
  xAxis = 'timestamp', 
  yAxis = 'value',
  color = '#7D4ED4',
  secondaryDataKey,
  secondaryColor = '#4EAEDC',
  barData = [],
  barColor = '#FFA500',
  formatXLabel = (value) => {
    const date = new Date(value);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  },
  chartHeight = 350,
  isOneDay = true
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [0],
          color: () => color,
          strokeWidth: 2
        }]
      };
    }

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => {
      return new Date(a[xAxis]) - new Date(b[xAxis]);
    });

    // Format labels based on date range (hours for one day, dates for multiple days)
    const labels = sortedData.map(item => {
      const date = new Date(item[xAxis]);
      if (isOneDay) {
        // For a single day, show hours and minutes
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // For multiple days, show month/day
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    });

    // If we have too many data points, reduce the number of labels
    const finalLabels = labels.length > 8 
      ? labels.filter((_, i) => i % Math.ceil(labels.length / 8) === 0) 
      : labels;
    
    // Create the primary dataset
    const chartDatasets = [{
      data: sortedData.map(item => item[yAxis]),
      color: () => color,
      strokeWidth: 2
    }];

    // Add secondary dataset if needed
    if (secondaryDataKey) {
      chartDatasets.push({
        data: sortedData.map(item => item[secondaryDataKey]),
        color: () => secondaryColor,
        strokeWidth: 2
      });
    }

    return {
      labels: finalLabels,
      datasets: chartDatasets
    };
  }, [data, xAxis, yAxis, color, secondaryDataKey, secondaryColor, isOneDay]);

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    if (!barData || barData.length === 0 || !isOneDay) {
      return null;
    }

    // Generate labels for hours (assuming 24 bars for a day)
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    
    // Make sure we have a value for each hour (0-23)
    const normalizedBarData = Array.from({ length: 24 }, (_, i) => {
      return barData[i] || 0;
    });

    return {
      labels: labels.filter((_, i) => i % 3 === 0), // Show every 3 hours to avoid crowding
      datasets: [
        {
          data: normalizedBarData,
          color: (opacity = 1) => barColor,
        }
      ]
    };
  }, [barData, barColor, isOneDay]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height: chartHeight }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 32} // 16 padding on each side
        height={chartHeight}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(125, 78, 212, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
          style: {
            borderRadius: 10
          },
        }}
        bezier
        style={styles.chart}
      />
      
      {/* Only show bar chart for Today view */}
      {isOneDay && barChartData && barData.length > 0 && (
        <View style={styles.barChartContainer}>
          <Text style={styles.barChartTitle}>Calories Consumed vs Burnt</Text>
          <BarChart
            data={barChartData}
            width={Dimensions.get('window').width - 32}
            height={180}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#F9F6FF',
              backgroundGradientFrom: '#F9F6FF',
              backgroundGradientTo: '#F9F6FF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
              barPercentage: 0.7,
            }}
            style={styles.barChart}
            showValuesOnTopOfBars={true}
          />
        </View>
      )}
    </View>
  );
};

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
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
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
    marginBottom: 10
  }
});

export default LineChartComponent;