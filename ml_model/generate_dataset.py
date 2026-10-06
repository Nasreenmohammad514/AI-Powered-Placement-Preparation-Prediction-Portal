"""
Generate Synthetic Placement Dataset
Run: python generate_dataset.py
Creates placement_data.csv with 500 rows
"""

import numpy as np
import pandas as pd

np.random.seed(42)
N = 500

cgpa             = np.round(np.random.uniform(5.0, 10.0, N), 2)
skills_count     = np.random.randint(1, 12, N)
internship_count = np.random.randint(0, 4, N)
project_count    = np.random.randint(0, 6, N)
certification_count = np.random.randint(0, 5, N)
aptitude_score   = np.round(np.random.uniform(20, 100, N), 1)

# Build DataFrame first so column names match exactly
df = pd.DataFrame({
    'cgpa':                 cgpa,
    'skills_count':         skills_count,
    'internship_count':     internship_count,
    'project_count':        project_count,
    'certification_count':  certification_count,
    'aptitude_score':       aptitude_score,
})

# Use correct column names that match the DataFrame
def calc_prob(row):
    score = 0
    score += (row['cgpa'] - 5) / 5 * 35
    score += min(row['skills_count'] / 10, 1) * 25
    score += min(row['internship_count'] / 3, 1) * 15
    score += min(row['project_count'] / 5, 1) * 10
    score += min(row['certification_count'] / 4, 1) * 5
    score += (row['aptitude_score'] - 20) / 80 * 10
    noise = np.random.uniform(-10, 10)
    return min(max(score + noise, 0), 100)

df['raw_prob'] = df.apply(calc_prob, axis=1)
df['placed']   = (df['raw_prob'] >= 50).astype(int)
df.drop('raw_prob', axis=1, inplace=True)

df.to_csv('placement_data.csv', index=False)
print(f"✅ Dataset created: placement_data.csv ({N} rows)")
print(f"   Placed: {df['placed'].sum()} | Not placed: {(df['placed']==0).sum()}")
print(df.head())
