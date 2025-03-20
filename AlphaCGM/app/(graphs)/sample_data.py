import pandas as pd
import numpy as np

# 1. Define the time range (30 full days)
start_date = pd.to_datetime("2025-03-01 00:00:00")  # Adjust as needed
# Calculate the number of 5-minute intervals in 30 days
num_periods = (30 * 24 * 60) // 5
date_range = pd.date_range(start=start_date, periods=num_periods, freq='5min')

# 2. Create a DataFrame with the timestamp
df = pd.DataFrame({'Timestamp': date_range})

# 3. Simulate Glucose values with a daily cycle and noise
minutes_in_day = df['Timestamp'].dt.hour * 60 + df['Timestamp'].dt.minute
df['Glucose'] = 100 + 15 * np.sin(2 * np.pi * minutes_in_day / 1440) + np.random.normal(0, 5, size=len(df))

# 4. Simulate Calories Consumed with meal periods
def simulate_calories_consumed(ts):
    total_minutes = ts.hour * 60 + ts.minute
    # Breakfast window: 7:30-8:30 (450-510 minutes)
    if 450 <= total_minutes < 510:
        return np.random.uniform(4, 6)  # ~5 calories per 5min slot
    # Lunch window: 12:00-13:00 (720-780 minutes)
    elif 720 <= total_minutes < 780:
        return np.random.uniform(9, 13)  # ~11 calories per slot
    # Dinner window: 18:30-19:30 (1110-1170 minutes)
    elif 1110 <= total_minutes < 1170:
        return np.random.uniform(15, 19)  # ~17 calories per slot
    else:
        return np.random.uniform(0, 1)  # Minimal consumption otherwise

df['CaloriesConsumed'] = df['Timestamp'].apply(simulate_calories_consumed)

# 5. Simulate Calories Burnt with a baseline and workout boost
def simulate_calories_burnt(ts):
    total_minutes = ts.hour * 60 + ts.minute
    base = 8.7  # baseline burn per 5min interval
    # Extra burn during a morning workout (6:00-7:00 AM; 360-420 minutes)
    if 360 <= total_minutes < 420:
        return base + np.random.uniform(5, 10)
    else:
        return base + np.random.uniform(-1, 1)  # slight variation

df['CaloriesBurnt'] = df['Timestamp'].apply(simulate_calories_burnt)

# Optionally, export the DataFrame to a CSV for use in Tableau
df.to_csv("extended_30day_data.csv", index=False)
