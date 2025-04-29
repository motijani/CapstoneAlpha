import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { router } from 'expo-router';

// Sample food database
const foodDatabase = [
  { id: '1', name: 'Apple', calories: 95, carbs: 25, protein: 0.5, fat: 0.3 },
  { id: '2', name: 'Banana', calories: 105, carbs: 27, protein: 1.3, fat: 0.4 },
  { id: '3', name: 'Chicken Breast', calories: 165, carbs: 0, protein: 31, fat: 3.6 },
  { id: '4', name: 'Salmon', calories: 206, carbs: 0, protein: 22, fat: 13 },
  { id: '5', name: 'Brown Rice (1 cup)', calories: 216, carbs: 45, protein: 5, fat: 1.8 },
  { id: '6', name: 'Oats (1 cup)', calories: 307, carbs: 55, protein: 11, fat: 5 },
  { id: '7', name: 'Broccoli (1 cup)', calories: 55, carbs: 11, protein: 3.7, fat: 0.6 },
  { id: '8', name: 'Spinach (1 cup)', calories: 7, carbs: 1.1, protein: 0.9, fat: 0.1 },
  { id: '9', name: 'Almonds (1 oz)', calories: 164, carbs: 6, protein: 6, fat: 14 },
  { id: '10', name: 'Greek Yogurt (1 cup)', calories: 130, carbs: 9, protein: 22, fat: 0 },
];

// Sample exercise database
const exerciseDatabase = [
  { id: '1', name: 'Walking (30 min)', caloriesBurned: 120 },
  { id: '2', name: 'Running (30 min)', caloriesBurned: 280 },
  { id: '3', name: 'Cycling (30 min)', caloriesBurned: 260 },
  { id: '4', name: 'Swimming (30 min)', caloriesBurned: 240 },
  { id: '5', name: 'Weight Training (30 min)', caloriesBurned: 180 },
  { id: '6', name: 'Yoga (30 min)', caloriesBurned: 120 },
  { id: '7', name: 'HIIT (30 min)', caloriesBurned: 300 },
  { id: '8', name: 'Dancing (30 min)', caloriesBurned: 200 },
];

export default function LogEntriesView() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('food'); // 'food', 'exercise', 'glucose'
  
  // State for search
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // State for log entries
  const [foodEntries, setFoodEntries] = useState([]);
  const [exerciseEntries, setExerciseEntries] = useState([]);
  const [glucoseEntries, setGlucoseEntries] = useState([]);
  
  // State for glucose input
  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseNotes, setGlucoseNotes] = useState('');
  
  // Handle search
  useEffect(() => {
    if (searchText.length > 0) {
      if (activeTab === 'food') {
        const results = foodDatabase.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(results);
      } else if (activeTab === 'exercise') {
        const results = exerciseDatabase.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(results);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchText, activeTab]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchText('');
    setSearchResults([]);
  };
  
  // Add food entry
  const addFoodEntry = (food) => {
    const newEntry = {
      ...food,
      timestamp: new Date().toISOString(),
      id: `food-${Date.now()}`
    };
    setFoodEntries([newEntry, ...foodEntries]);
    setSearchText('');
    setSearchResults([]);
  };
  
  // Add exercise entry
  const addExerciseEntry = (exercise) => {
    const newEntry = {
      ...exercise,
      timestamp: new Date().toISOString(),
      id: `exercise-${Date.now()}`
    };
    setExerciseEntries([newEntry, ...exerciseEntries]);
    setSearchText('');
    setSearchResults([]);
  };
  
  // Add glucose entry
  const addGlucoseEntry = () => {
    if (glucoseValue && !isNaN(parseFloat(glucoseValue))) {
      const newEntry = {
        value: parseFloat(glucoseValue),
        notes: glucoseNotes,
        timestamp: new Date().toISOString(),
        id: `glucose-${Date.now()}`
      };
      setGlucoseEntries([newEntry, ...glucoseEntries]);
      setGlucoseValue('');
      setGlucoseNotes('');
    }
  };
  
  // Delete entry
  const deleteEntry = (id, type) => {
    if (type === 'food') {
      setFoodEntries(foodEntries.filter(entry => entry.id !== id));
    } else if (type === 'exercise') {
      setExerciseEntries(exerciseEntries.filter(entry => entry.id !== id));
    } else if (type === 'glucose') {
      setGlucoseEntries(glucoseEntries.filter(entry => entry.id !== id));
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Navigation handlers
  const navigate = path => () => router.push(path);
  
  // Render food entry
  const renderFoodEntry = ({ item }) => (
    <View style={styles.logEntry}>
      <View style={styles.logEntryContent}>
        <Text style={styles.logEntryTitle}>{item.name}</Text>
        <Text style={styles.logEntryDetail}>Calories: {item.calories} | Carbs: {item.carbs}g | Protein: {item.protein}g | Fat: {item.fat}g</Text>
        <Text style={styles.logEntryTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteEntry(item.id, 'food')}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render exercise entry
  const renderExerciseEntry = ({ item }) => (
    <View style={styles.logEntry}>
      <View style={styles.logEntryContent}>
        <Text style={styles.logEntryTitle}>{item.name}</Text>
        <Text style={styles.logEntryDetail}>Calories Burned: {item.caloriesBurned}</Text>
        <Text style={styles.logEntryTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteEntry(item.id, 'exercise')}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render glucose entry
  const renderGlucoseEntry = ({ item }) => (
    <View style={styles.logEntry}>
      <View style={styles.logEntryContent}>
        <Text style={styles.logEntryTitle}>{item.value} mg/dL</Text>
        {item.notes ? <Text style={styles.logEntryDetail}>{item.notes}</Text> : null}
        <Text style={styles.logEntryTimestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteEntry(item.id, 'glucose')}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render search result
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResult}
      onPress={() => activeTab === 'food' ? addFoodEntry(item) : addExerciseEntry(item)}
    >
      <Text style={styles.searchResultTitle}>{item.name}</Text>
      {activeTab === 'food' ? (
        <Text style={styles.searchResultDetail}>
          Calories: {item.calories} | Carbs: {item.carbs}g
        </Text>
      ) : (
        <Text style={styles.searchResultDetail}>
          Calories Burned: {item.caloriesBurned}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log Entries</Text>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'food' && styles.activeTab]}
              onPress={() => handleTabChange('food')}
            >
              <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>Food</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'exercise' && styles.activeTab]}
              onPress={() => handleTabChange('exercise')}
            >
              <Text style={[styles.tabText, activeTab === 'exercise' && styles.activeTabText]}>Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'glucose' && styles.activeTab]}
              onPress={() => handleTabChange('glucose')}
            >
              <Text style={[styles.tabText, activeTab === 'glucose' && styles.activeTabText]}>Glucose</Text>
            </TouchableOpacity>
          </View>
          
          {/* Food & Exercise Search */}
          {(activeTab === 'food' || activeTab === 'exercise') && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search for ${activeTab}...`}
                value={searchText}
                onChangeText={setSearchText}
              />
              
              {searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={item => item.id}
                    style={styles.searchResultsList}
                  />
                </View>
              )}
            </View>
          )}
          
          {/* Glucose Input */}
          {activeTab === 'glucose' && (
            <View style={styles.glucoseInputContainer}>
              <View style={styles.glucoseInputRow}>
                <TextInput
                  style={styles.glucoseValueInput}
                  placeholder="Glucose value (mg/dL)"
                  value={glucoseValue}
                  onChangeText={setGlucoseValue}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={addGlucoseEntry}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="Notes (optional)"
                value={glucoseNotes}
                onChangeText={setGlucoseNotes}
                multiline
              />
            </View>
          )}
          
          {/* Log Entries */}
          <View style={styles.logEntriesContainer}>
            <Text style={styles.sectionTitle}>Today's {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Log</Text>
            
            {activeTab === 'food' && (
              foodEntries.length > 0 ? (
                <FlatList
                  data={foodEntries}
                  renderItem={renderFoodEntry}
                  keyExtractor={item => item.id}
                  style={styles.entriesList}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyListText}>No food entries logged today.</Text>
              )
            )}
            
            {activeTab === 'exercise' && (
              exerciseEntries.length > 0 ? (
                <FlatList
                  data={exerciseEntries}
                  renderItem={renderExerciseEntry}
                  keyExtractor={item => item.id}
                  style={styles.entriesList}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyListText}>No exercise entries logged today.</Text>
              )
            )}
            
            {activeTab === 'glucose' && (
              glucoseEntries.length > 0 ? (
                <FlatList
                  data={glucoseEntries}
                  renderItem={renderGlucoseEntry}
                  keyExtractor={item => item.id}
                  style={styles.entriesList}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.emptyListText}>No glucose entries logged today.</Text>
              )
            )}
          </View>
          
          {/* Navigation Buttons */}
          <View style={styles.circlesContainer}>
            <TouchableOpacity 
              style={styles.circlePlaceholder}
              onPress={navigate('/glucose')}
            >
              <Text style={styles.circleText}>GL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.circlePlaceholder}
              onPress={navigate('/meal-plans')}
            >
              <Text style={styles.circleText}>Meal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.circlePlaceholder, styles.activeCircle]}
              onPress={navigate('/log-entries')}
            >
              <Text style={styles.circleText}>Log</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#F3F3F3',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#7D4ED4',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  searchResultsContainer: {
    marginTop: 10,
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FFFFFF',
  },
  searchResultsList: {
    padding: 5,
  },
  searchResult: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  glucoseInputContainer: {
    marginBottom: 20,
  },
  glucoseInputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  glucoseValueInput: {
    flex: 1,
    height: 40,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    height: 80,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#7D4ED4',
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logEntriesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  entriesList: {
    flex: 1,
  },
  logEntry: {
    flexDirection: 'row',
    backgroundColor: '#F9F6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  logEntryContent: {
    flex: 1,
  },
  logEntryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logEntryDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logEntryTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  emptyListText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
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
