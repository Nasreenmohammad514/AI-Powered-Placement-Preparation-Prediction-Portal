"""
Train Placement Prediction Model
Run: python train_model.py
Saves trained model to model.pkl
"""

import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
import joblib

# ── 1. Load or generate dataset ──────────────────────────────────────────────
if not os.path.exists('placement_data.csv'):
    print("Dataset not found. Generating...")
    import generate_dataset   # runs the script

df = pd.read_csv('placement_data.csv')
print(f"Dataset loaded: {df.shape[0]} rows")
print(df.head())

FEATURES = ['cgpa', 'skills_count', 'internship_count',
            'project_count', 'certification_count', 'aptitude_score']
TARGET   = 'placed'

X = df[FEATURES]
y = df[TARGET]

# ── 2. Train / test split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")

# ── 3. Compare models ─────────────────────────────────────────────────────────
models = {
    'Logistic Regression': Pipeline([
        ('scaler', StandardScaler()),
        ('clf', LogisticRegression(random_state=42))
    ]),
    'Random Forest':     RandomForestClassifier(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
}

print("\n── Model Comparison ─────────────────────────────")
best_name, best_model, best_score = None, None, 0

for name, model in models.items():
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
    mean_cv   = cv_scores.mean()
    print(f"{name:25s} | CV AUC: {mean_cv:.4f} ± {cv_scores.std():.4f}")
    if mean_cv > best_score:
        best_score, best_name, best_model = mean_cv, name, model

print(f"\n✅ Best model: {best_name} (AUC {best_score:.4f})")

# ── 4. Train best model ───────────────────────────────────────────────────────
best_model.fit(X_train, y_train)
y_pred = best_model.predict(X_test)
y_prob = best_model.predict_proba(X_test)[:, 1]

print("\n── Test Set Results ─────────────────────────────")
print(f"Accuracy : {accuracy_score(y_test, y_pred):.4f}")
print(f"ROC-AUC  : {roc_auc_score(y_test, y_prob):.4f}")
print(classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))

# Feature importances
if hasattr(best_model, 'feature_importances_'):
    print("\n── Feature Importances ──────────────────────────")
    for feat, imp in sorted(zip(FEATURES, best_model.feature_importances_), key=lambda x: -x[1]):
        print(f"  {feat:25s}: {imp:.4f}")

# ── 5. Save ───────────────────────────────────────────────────────────────────
joblib.dump(best_model, 'model.pkl')
joblib.dump(FEATURES,   'features.pkl')
print("\n✅ model.pkl saved")
print("✅ features.pkl saved")
print("\nNow run: python app.py")
