import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { loadCSVFromAssets, filterDataByDateRange, calculateStats } from '../../scripts/csvParser';

export default function MealPlansView() {
  // State for glucose data
  const [glucoseData, setGlucoseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [glucoseLevel, setGlucoseLevel] = useState('normal'); // 'low', 'normal', 'high'
  const [glucoseValue, setGlucoseValue] = useState(0);

  // Load glucose data on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load glucose data from CSV file
        const data = await loadCSVFromAssets('extended_30day_data.csv');
        setGlucoseData(data);
        
        // Get the most recent glucose reading
        const sortedData = [...data].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        if (sortedData.length > 0) {
          const latestGlucose = sortedData[1].glucose; // 1 instead of 0 because the last row is the predicted value
          setGlucoseValue(latestGlucose);
          
          // Determine glucose level category
          if (latestGlucose < 70) {
            setGlucoseLevel('low');
          } else if (latestGlucose > 180) {
            setGlucoseLevel('high');
          } else {
            setGlucoseLevel('normal');
          }
        }
      } catch (error) {
        console.error("Error loading glucose data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Meal plan recommendations based on glucose level
  const getMealPlans = () => {
    switch (glucoseLevel) {
      case 'low':
        return [
          {
            title: 'Quick Glucose Boost',
            description: 'For immediate glucose increase',
            meals: [
              { name: 'Fruit juice (4 oz)', carbs: '15g', protein: '0g', fat: '0g' },
              { name: 'Honey (1 tbsp)', carbs: '17g', protein: '0g', fat: '0g' },
              { name: 'Glucose tablets', carbs: '15g', protein: '0g', fat: '0g' }
            ],
            tips: 'Follow with a balanced meal containing protein and complex carbs to maintain stable glucose levels.'
          },
          {
            title: 'Balanced Recovery Meal',
            description: 'For after treating low glucose',
            meals: [
              { name: 'Whole grain toast with peanut butter', carbs: '30g', protein: '10g', fat: '16g' },
              { name: 'Greek yogurt with berries', carbs: '25g', protein: '15g', fat: '5g' },
              { name: 'Oatmeal with nuts and fruit', carbs: '45g', protein: '8g', fat: '10g' }
            ],
            tips: 'Eat within 30 minutes of treating low glucose to prevent another drop.'
          }
        ];
      
      case 'high':
        return [
          {
            title: 'Low Carb Options',
            description: 'To help lower glucose levels',
            meals: [
              { name: 'Grilled chicken with vegetables', carbs: '10g', protein: '35g', fat: '12g' },
              { name: 'Salmon with leafy green salad', carbs: '8g', protein: '30g', fat: '15g' },
              { name: 'Tofu stir-fry with non-starchy vegetables', carbs: '12g', protein: '20g', fat: '14g' }
            ],
            tips: 'Focus on protein and non-starchy vegetables. Consider light exercise after eating to help lower glucose.'
          },
          {
            title: 'Hydration Focus',
            description: 'To help flush excess glucose',
            meals: [
              { name: 'Cucumber and lemon infused water', carbs: '0g', protein: '0g', fat: '0g' },
              { name: 'Herbal tea (unsweetened)', carbs: '0g', protein: '0g', fat: '0g' },
              { name: 'Clear vegetable broth', carbs: '2g', protein: '1g', fat: '0g' }
            ],
            tips: 'Drink plenty of water to help your kidneys flush out excess glucose.'
          }
        ];
      
      default: // normal
        return [
          {
            title: 'Balanced Meals',
            description: 'To maintain stable glucose levels',
            meals: [
              { name: 'Quinoa bowl with vegetables and chicken', carbs: '45g', protein: '30g', fat: '10g' },
              { name: 'Mediterranean salad with olive oil dressing', carbs: '30g', protein: '15g', fat: '20g' },
              { name: 'Lentil soup with whole grain bread', carbs: '50g', protein: '20g', fat: '8g' }
            ],
            tips: 'Aim for a balance of complex carbs, lean protein, and healthy fats at each meal.'
          },
          {
            title: 'Healthy Snack Options',
            description: 'For between meals',
            meals: [
              { name: 'Apple with almond butter', carbs: '15g', protein: '4g', fat: '9g' },
              { name: 'Hummus with vegetable sticks', carbs: '10g', protein: '5g', fat: '6g' },
              { name: 'Greek yogurt with berries', carbs: '15g', protein: '15g', fat: '0g' }
            ],
            tips: 'Snack mindfully and choose options with protein and fiber to maintain stable glucose levels.'
          }
        ];
    }
  };

  // Function to refresh data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Load glucose data from CSV file
      const data = await loadCSVFromAssets('extended_30day_data.csv');
      setGlucoseData(data);
      
      // Get the most recent glucose reading
      const sortedData = [...data].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      if (sortedData.length > 0) {
        const latestGlucose = sortedData[1].glucose; // 1 instead of 0 because the last row is the predicted value
        setGlucoseValue(latestGlucose);
        
        // Determine glucose level category
        if (latestGlucose < 70) {
          setGlucoseLevel('low');
        } else if (latestGlucose > 180) {
          setGlucoseLevel('high');
        } else {
          setGlucoseLevel('normal');
        }
      }
    } catch (error) {
      console.error("Error loading glucose data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const navigate = path => () => {
    if (path === '/meal-plans') {
      // If navigating to the current page, refresh the data
      refreshData();
    } else {
      // Otherwise, navigate to the specified path
      router.push(path);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meal Recommendations</Text>
        </View>

        {/* Glucose Status */}
        <View style={[styles.statusContainer, 
          glucoseLevel === 'low' ? styles.lowStatus : 
          glucoseLevel === 'high' ? styles.highStatus : 
          styles.normalStatus
        ]}>
          <Text style={styles.statusTitle}>Current Glucose Status</Text>
          <Text style={styles.statusValue}>{glucoseValue} mg/dL</Text>
          <Text style={styles.statusLabel}>
            {glucoseLevel === 'low' ? 'LOW - Consider quick-acting carbs' : 
             glucoseLevel === 'high' ? 'HIGH - Consider low-carb options' : 
             'NORMAL - Maintain balanced intake'}
          </Text>
        </View>

        {/* Meal Plans */}
        {isLoading ? (
          <Text style={styles.loadingText}>Loading meal recommendations...</Text>
        ) : (
          <View style={styles.mealPlansContainer}>
            {getMealPlans().map((plan, index) => (
              <View key={index} style={styles.mealPlanCard}>
                <Text style={styles.mealPlanTitle}>{plan.title}</Text>
                <Text style={styles.mealPlanDescription}>{plan.description}</Text>
                
                <View style={styles.mealsContainer}>
                  {plan.meals.map((meal, mealIndex) => (
                    <View key={mealIndex} style={styles.mealItem}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <View style={styles.macrosContainer}>
                        <Text style={styles.macroItem}>Carbs: {meal.carbs}</Text>
                        <Text style={styles.macroItem}>Protein: {meal.protein}</Text>
                        <Text style={styles.macroItem}>Fat: {meal.fat}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>Tips:</Text>
                  <Text style={styles.tipsText}>{plan.tips}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.circlesContainer}>
          <TouchableOpacity 
            style={styles.circlePlaceholder}
            onPress={navigate('/glucose')}
          >
            <Text style={styles.circleText}>GL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.circlePlaceholder, styles.activeCircle]}
            onPress={navigate('/meal-plans')}
          >
            <Text style={styles.circleText}>Meal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.circlePlaceholder}
            onPress={navigate('/log-entries')}
          >
            <Text style={styles.circleText}>Log</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  statusContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  lowStatus: {
    backgroundColor: '#FFEBEE', // Light red
  },
  normalStatus: {
    backgroundColor: '#E8F5E9', // Light green
  },
  highStatus: {
    backgroundColor: '#FFF3E0', // Light orange
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  mealPlansContainer: {
    marginBottom: 20,
  },
  mealPlanCard: {
    backgroundColor: '#F9F6FF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  mealPlanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7D4ED4',
    marginBottom: 5,
  },
  mealPlanDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  mealsContainer: {
    marginBottom: 15,
  },
  mealItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    fontSize: 12,
    color: '#666',
  },
  tipsContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  tipsText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
  },
  circlePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
