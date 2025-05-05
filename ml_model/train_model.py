# import os
# import pandas as pd
# import numpy as np
# import pickle
# from sklearn.model_selection import train_test_split
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.preprocessing import StandardScaler

# # Generating synthetic data
# np.random.seed(42)

# num_samples = 1000
# data = {
#     "age": np.random.randint(18, 60, num_samples),
#     "gender": np.random.choice([0, 1], num_samples),  # 0: Female, 1: Male
#     "phq1": np.random.randint(0, 3, num_samples),
#     "phq2": np.random.randint(0, 3, num_samples),
#     "phq3": np.random.randint(0, 3, num_samples),
#     "phq4": np.random.randint(0, 3, num_samples),
#     "phq5": np.random.randint(0, 3, num_samples),
#     "phq6": np.random.randint(0, 3, num_samples),
#     "phq7": np.random.randint(0, 3, num_samples),
#     "phq8": np.random.randint(0, 3, num_samples),
#     "phq9": np.random.randint(0, 3, num_samples),
#     "gad1": np.random.randint(0, 3, num_samples),
#     "gad2": np.random.randint(0, 3, num_samples),
#     "gad3": np.random.randint(0, 3, num_samples),
#     "gad4": np.random.randint(0, 3, num_samples),
#     "gad5": np.random.randint(0, 3, num_samples),
#     "gad6": np.random.randint(0, 3, num_samples),
#     "gad7": np.random.randint(0, 3, num_samples),
# }

# df = pd.DataFrame(data)

# # Define severity levels based on PHQ-9 and GAD-7 scores
# df["phq_score"] = df[[f"phq{i}" for i in range(1, 10)]].sum(axis=1)
# df["gad_score"] = df[[f"gad{i}" for i in range(1, 8)]].sum(axis=1)

# def categorize_severity(score, thresholds):
#     if score <= thresholds[0]:
#         return "Minimal"
#     elif score <= thresholds[1]:
#         return "Mild"
#     elif score <= thresholds[2]:
#         return "Moderate"
#     else:
#         return "Severe"

# df["depression_severity"] = df["phq_score"].apply(lambda x: categorize_severity(x, [4, 9, 14]))
# df["anxiety_severity"] = df["gad_score"].apply(lambda x: categorize_severity(x, [4, 9, 14]))

# # Encode severity levels
# severity_mapping = {"Minimal": 0, "Mild": 1, "Moderate": 2, "Severe": 3}
# df["depression_severity"] = df["depression_severity"].map(severity_mapping)
# df["anxiety_severity"] = df["anxiety_severity"].map(severity_mapping)

# # Define features and labels
# X = df.drop(columns=["phq_score", "gad_score", "depression_severity", "anxiety_severity"])
# y_depression = df["depression_severity"]
# y_anxiety = df["anxiety_severity"]

# # Train-test split
# X_train, X_test, y_train_dep, y_test_dep = train_test_split(X, y_depression, test_size=0.2, random_state=42)
# X_train, X_test, y_train_anx, y_test_anx = train_test_split(X, y_anxiety, test_size=0.2, random_state=42)

# # Standardization
# scaler = StandardScaler()
# X_train = scaler.fit_transform(X_train)
# X_test = scaler.transform(X_test)

# # Train models
# model_dep = RandomForestClassifier(n_estimators=100, random_state=42)
# model_anx = RandomForestClassifier(n_estimators=100, random_state=42)

# model_dep.fit(X_train, y_train_dep)
# model_anx.fit(X_train, y_train_anx)



# # Save models and scaler
# with open(os.path.join("depression_model.pkl"), "wb") as f:
#     pickle.dump(model_dep, f)

# with open(os.path.join("anxiety_model.pkl"), "wb") as f:
#     pickle.dump(model_anx, f)

# with open(os.path.join("scaler.pkl"), "wb") as f:
#     pickle.dump(scaler, f)

# print("Models and scaler saved successfully!")




import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# Set seed for reproducibility
np.random.seed(42)

# Number of samples
num_samples = 1000

# Simulating PHQ-9 responses (each question scored 0-3)
phq9_scores = np.random.randint(0, 4, size=(num_samples, 9))

# Simulating GAD-7 responses (each question scored 0-3)
gad7_scores = np.random.randint(0, 4, size=(num_samples, 7))

# Simulating Age (18 - 65 years old)
ages = np.random.randint(18, 66, size=(num_samples, 1))

# Simulating Gender (Male/Female/Other)
genders = np.random.choice(['Male', 'Female', 'Other'], size=num_samples)

# PHQ-9 Total Score Calculation
phq9_total_scores = phq9_scores.sum(axis=1)

# GAD-7 Total Score Calculation
gad7_total_scores = gad7_scores.sum(axis=1)

# Categorizing Depression Severity Based on PHQ-9
def classify_depression(score):
    if score <= 4:
        return "None"
    elif score <= 9:
        return "Mild"
    elif score <= 14:
        return "Moderate"
    else:
        return "Severe"

# Categorizing Anxiety Severity Based on GAD-7
def classify_anxiety(score):
    if score <= 4:
        return "None"
    elif score <= 9:
        return "Mild"
    elif score <= 14:
        return "Moderate"
    else:
        return "Severe"

# Assigning Severity Labels
depression_labels = np.array([classify_depression(score) for score in phq9_total_scores])
anxiety_labels = np.array([classify_anxiety(score) for score in gad7_total_scores])

# Creating DataFrame
df = pd.DataFrame(phq9_scores, columns=[f'PHQ9_Q{i+1}' for i in range(9)])
df = df.join(pd.DataFrame(gad7_scores, columns=[f'GAD7_Q{i+1}' for i in range(7)]))
df['Age'] = ages
df['Gender'] = genders
df['Depression_Severity'] = depression_labels
df['Anxiety_Severity'] = anxiety_labels

# Encode Gender (Male=0, Female=1, Other=2)
label_encoder = LabelEncoder()
df['Gender'] = label_encoder.fit_transform(df['Gender'])

# Splitting Features and Labels
X = df.drop(columns=['Depression_Severity', 'Anxiety_Severity'])
y_depression = df['Depression_Severity']
y_anxiety = df['Anxiety_Severity']

# Splitting Data for Depression Model
X_train_dep, X_test_dep, y_train_dep, y_test_dep = train_test_split(X, y_depression, test_size=0.2, stratify=y_depression, random_state=42)

# Splitting Data for Anxiety Model
X_train_anx, X_test_anx, y_train_anx, y_test_anx = train_test_split(X, y_anxiety, test_size=0.2, stratify=y_anxiety, random_state=42)

# Training Depression Model
clf_depression = RandomForestClassifier(n_estimators=100, random_state=42)
clf_depression.fit(X_train_dep, y_train_dep)

# Training Anxiety Model
clf_anxiety = RandomForestClassifier(n_estimators=100, random_state=42)
clf_anxiety.fit(X_train_anx, y_train_anx)

# Predictions and Evaluation
y_pred_dep = clf_depression.predict(X_test_dep)
y_pred_anx = clf_anxiety.predict(X_test_anx)

# Model Performance
print("Depression Model Accuracy:", accuracy_score(y_test_dep, y_pred_dep))
print(classification_report(y_test_dep, y_pred_dep))

print("Anxiety Model Accuracy:", accuracy_score(y_test_anx, y_pred_anx))
print(classification_report(y_test_anx, y_pred_anx))

# Save Models
joblib.dump(clf_depression, "phq9_model.pkl")
joblib.dump(clf_anxiety, "gad7_model.pkl")
joblib.dump(label_encoder, "gender_encoder.pkl")  # Save gender encoder
