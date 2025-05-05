# import sys
# import json
# import joblib
# import numpy as np
# import pandas as pd
# import os

# # Get absolute path of the model
# MODEL_PATH = os.path.join(os.path.dirname(__file__), "depression_severity_model.pkl")

# # Load the model
# model = joblib.load(MODEL_PATH)

# def predict(input_data):
#     # Get the feature names from the trained model
#     feature_names = model.feature_names_in_
    
#     # Convert input JSON string to a Python list
#     input_array = np.array(json.loads(input_data)).reshape(1, -1)
    
#     # Ensure the number of inputs matches the model's expected features
#     if len(input_array[0]) != len(feature_names):
#         raise ValueError(f"Expected {len(feature_names)} features, but got {len(input_array[0])}")

#     # Convert to DataFrame with correct column names
#     input_df = pd.DataFrame(input_array, columns=feature_names)
    
#     # Debugging: Print feature names
#     print("Model expects features:", feature_names)
    
#     return model.predict(input_df)[0]

# if __name__ == '__main__':
#     input_data = sys.argv[1]
#     print(predict(input_data))



# import sys
# import json
# import joblib
# import numpy as np
# import pandas as pd
# import os

# # Get absolute path of the model
# MODEL_PATH = os.path.join(os.path.dirname(__file__), "depression_severity_model.pkl")

# # Load the model dictionary (contains both model and features)
# with open(MODEL_PATH, 'rb') as file:
#     model_data = joblib.load(file)

# model = model_data['model']  # Extract the trained model
# feature_names = model_data['features']  # Extract the feature names

# def predict(input_data):
#     """
#     Predict depression severity from input JSON data.
#     """
#     try:
#         # Convert input JSON string to a Python dictionary
#         input_dict = json.loads(input_data)

#         # Ensure only the required features are present
#         input_dict = {key: [input_dict.get(key, 0)] for key in feature_names}

#         # Convert to DataFrame with correct column order
#         input_df = pd.DataFrame(input_dict)[feature_names]

#         # Make prediction
#         prediction = model.predict(input_df)[0]

#         # Severity labels
#         severity_labels = ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe']
#         predicted_label = severity_labels[prediction]

#         return predicted_label

#     except Exception as e:
#         return f"Error: {str(e)}"

# if __name__ == '__main__':
#     if len(sys.argv) > 1:
#         input_data = sys.argv[1]
#     else:
#         with open("input.json", "r") as file:
#             input_data = file.read()
#     print(predict(input_data))


# import sys
# import json
# import joblib
# import numpy as np
# import pandas as pd
# import os

# # Get absolute path of the model
# MODEL_PATH = os.path.join(os.path.dirname(__file__), "depression_severity_model.pkl")

# # Load the model dictionary (contains both model and features)
# with open(MODEL_PATH, 'rb') as file:
#     model_data = joblib.load(file)

# model = model_data['model']  # Extract the trained model
# feature_names = model_data['features']  # Extract the feature names

# def predict(input_data):
#     """
#     Predict depression severity from input JSON data.
#     """
#     try:
#         # Convert input JSON string to Python list
#         input_list = json.loads(input_data)

#         # Convert list to dictionary with feature names as keys
#         if isinstance(input_list, list):  
#             input_dict = {feature_names[i]: [input_list[i]] for i in range(len(feature_names))}

#         # Convert to DataFrame with correct column order
#         input_df = pd.DataFrame(input_dict)[feature_names]

#         # Make prediction
#         prediction = model.predict(input_df)[0]

#         # Severity labels
#         severity_labels = ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe']
#         predicted_label = severity_labels[prediction]

#         return predicted_label

#     except Exception as e:
#         return f"Error: {str(e)}"

# if __name__ == '__main__':
#     # Read JSON input from stdin
#     input_data = sys.stdin.read().strip()
#     print(predict(input_data))


# NEW
# import sys
# import json
# import joblib
# import numpy as np
# import pandas as pd
# import os

# # Get absolute path of the model
# MODEL_PATH = os.path.join(os.path.dirname(__file__), "depression_severity_model.pkl")

# # Load the model dictionary (contains both model and features)
# with open(MODEL_PATH, 'rb') as file:
#     model_data = joblib.load(file)

# model = model_data['model']  # Extract the trained model
# feature_names = model_data['features']  # Extract the feature names

# def predict(input_data):
#     """
#     Predict depression severity from input JSON data.
#     """
#     try:
#         # Convert input JSON string to dictionary
#         input_dict = json.loads(input_data)

#         # Debug: Print received input
#         print(f"Received input: {input_dict}", flush=True)

#         # Validate that all required features are present
#         missing_features = [feature for feature in feature_names if feature not in input_dict]
#         if missing_features:
#             return f"Error: Missing features {missing_features}"

#         # Convert to DataFrame with correct column order
#         input_df = pd.DataFrame([input_dict])[feature_names]

#         # Make prediction
#         prediction = model.predict(input_df)[0]

#         # Severity labels
#         severity_labels = ['Minimal', 'Mild', 'Moderate', 'Moderately Severe', 'Severe']
#         predicted_label = severity_labels[prediction]

#         return predicted_label

#     except Exception as e:
#         return f"Error: {str(e)}"

# if __name__ == '__main__':
#     # Read JSON input from stdin
#     input_data = sys.stdin.read().strip()
#     print(predict(input_data))




# import pickle
# import numpy as np

# # Load models
# with open("depression_model.pkl", "rb") as f:
#     depression_model = pickle.load(f)

# with open("anxiety_model.pkl", "rb") as f:
#     anxiety_model = pickle.load(f)

# with open("scaler.pkl", "rb") as f:
#     scaler = pickle.load(f)

# def predict_severity(data):
#     """ Predicts depression and anxiety severity based on PHQ-9 and GAD-7 scores """
    
#     features = np.array(data).reshape(1, -1)
#     features = scaler.transform(features)
    
#     dep_pred = depression_model.predict(features)[0]
#     anx_pred = anxiety_model.predict(features)[0]

#     severity_levels = ["Minimal", "Mild", "Moderate", "Severe"]

#     return {
#         "depression_severity": severity_levels[dep_pred],
#         "anxiety_severity": severity_levels[anx_pred],
#     }

# # Example Input
# user_data = [12, 1, 3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]  # Age, gender, PHQ-9, GAD-7 responses
# print(predict_severity(user_data))


# Google Colab 
# import pandas as pd
# import numpy as np
# import joblib
# from sklearn.preprocessing import LabelEncoder

# def predict_mental_health(phq9_responses, gad7_responses, age, gender):
#     """
#     Predicts depression and anxiety severity based on PHQ-9 and GAD-7 responses.

#     :param phq9_responses: List of 9 integer responses (0-3 scale).
#     :param gad7_responses: List of 7 integer responses (0-3 scale).
#     :param age: Integer age.
#     :param gender: String ('Male', 'Female', 'Other').
#     :return: Predicted Depression and Anxiety Severity.
#     """
#     if len(phq9_responses) != 9 or len(gad7_responses) != 7:
#         raise ValueError("Invalid input. Provide 9 PHQ-9 responses and 7 GAD-7 responses.")

#     # Load Models
#     clf_depression = joblib.load("phq9_model.pkl")
#     clf_anxiety = joblib.load("gad7_model.pkl")
#     label_encoder = joblib.load("gender_encoder.pkl")

#     # Encode Gender
#     gender_encoded = label_encoder.transform([gender])[0]

#     # Create Input DataFrame
#     input_data = pd.DataFrame([phq9_responses + gad7_responses + [age, gender_encoded]],
#                               columns=[f'PHQ9_Q{i+1}' for i in range(9)] +
#                                       [f'GAD7_Q{i+1}' for i in range(7)] +
#                                       ['Age', 'Gender'])

#     # Make Predictions
#     depression_prediction = clf_depression.predict(input_data)[0]
#     anxiety_prediction = clf_anxiety.predict(input_data)[0]

#     return {
#         "Depression Severity": depression_prediction,
#         "Anxiety Severity": anxiety_prediction
#     }

# # Example Usage
# user_phq9_responses = [0,0,0,0,0,0,0,0,0]  # Sample PHQ-9 responses
# user_gad7_responses = [0,0,0,0,0,0,0]  # Sample GAD-7 responses
# user_age = 25
# user_gender = "Male"

# prediction = predict_mental_health(user_phq9_responses, user_gad7_responses, user_age, user_gender)
# print(prediction)




#!/usr/bin/env python
# ml/mlPredictor.py


# Working
# import sys
# import os
# import json
# import pandas as pd
# import numpy as np
# import joblib
# from sklearn.preprocessing import LabelEncoder

# def predict_mental_health(phq9_responses, gad7_responses, age, gender):
#     """
#     Predicts depression and anxiety severity based on PHQ-9 and GAD-7 responses.

#     :param phq9_responses: List of 9 integer responses (0-3 scale).
#     :param gad7_responses: List of 7 integer responses (0-3 scale).
#     :param age: Integer age.
#     :param gender: String ('Male', 'Female', 'Other').
#     :return: Predicted Depression and Anxiety Severity.
#     """
#     if len(phq9_responses) != 9 or len(gad7_responses) != 7:
#         raise ValueError("Invalid input. Provide 9 PHQ-9 responses and 7 GAD-7 responses.")

#     # Load Models
#     # clf_depression = joblib.load("phq9_model.pkl")
#     # clf_anxiety = joblib.load("gad7_model.pkl")
#     # label_encoder = joblib.load("gender_encoder.pkl")


#     # Get the directory where the script is located
#     script_dir = os.path.dirname(os.path.abspath(__file__))

#     # Load models using the script directory as base
#     clf_depression = joblib.load(os.path.join(script_dir, "phq9_model.pkl"))
#     clf_anxiety = joblib.load(os.path.join(script_dir, "gad7_model.pkl"))
#     label_encoder = joblib.load(os.path.join(script_dir, "gender_encoder.pkl"))

#     # Encode Gender
#     gender_encoded = label_encoder.transform([gender])[0]

#     # Create Input DataFrame
#     input_data = pd.DataFrame([phq9_responses + gad7_responses + [age, gender_encoded]],
#                               columns=[f'PHQ9_Q{i+1}' for i in range(9)] +
#                                       [f'GAD7_Q{i+1}' for i in range(7)] +
#                                       ['Age', 'Gender'])

#     # Make Predictions
#     depression_prediction = clf_depression.predict(input_data)[0]
#     anxiety_prediction = clf_anxiety.predict(input_data)[0]

#     return {
#         "Depression Severity": depression_prediction,
#         "Anxiety Severity": anxiety_prediction
#     }

# # Main execution for Node.js bridge
# if __name__ == "__main__":
#     # Get input from Node.js
#     input_data = json.loads(sys.argv[1])
    
#     # Extract parameters
#     phq9_responses = input_data["phq9_responses"]
#     gad7_responses = input_data["gad7_responses"]
#     age = input_data["age"]
#     gender = input_data["gender"]
    
#     # Make prediction
#     try:
#         prediction = predict_mental_health(phq9_responses, gad7_responses, age, gender)
#         # Return result to Node.js
#         print(json.dumps(prediction))
#     except Exception as e:
#         print(json.dumps({"error": str(e)}))
#         sys.exit(1)




#!/usr/bin/env python
# ml_model/mlPredictor.py

import sys
import json
import os

# Function to generate prediction based on response scores
def predict_mental_health(phq9_responses, gad7_responses, age, gender):
    """
    Predicts depression and anxiety severity based on PHQ-9 and GAD-7 responses.
    This is a simplified version that doesn't require ML models.
    
    :param phq9_responses: List of 9 integer responses (0-3 scale).
    :param gad7_responses: List of 7 integer responses (0-3 scale).
    :param age: Integer age.
    :param gender: String ('Male', 'Female', 'Other').
    :return: Predicted Depression and Anxiety Severity.
    """
    if len(phq9_responses) != 9 or len(gad7_responses) != 7:
        raise ValueError("Invalid input. Provide 9 PHQ-9 responses and 7 GAD-7 responses.")

    # Calculate sum scores
    phq9_sum = sum(phq9_responses)
    gad7_sum = sum(gad7_responses)
    
    # Determine depression severity based on PHQ-9 score
    if phq9_sum <= 4:
        depression_severity = "Minimal"
    elif phq9_sum <= 9:
        depression_severity = "Mild"
    elif phq9_sum <= 14:
        depression_severity = "Moderate"
    # elif phq9_sum <= 19:
    #     depression_severity = "Moderately Severe"
    else:
        depression_severity = "Severe"
    
    # Determine anxiety severity based on GAD-7 score
    if gad7_sum <= 4:
        anxiety_severity = "Minimal"
    elif gad7_sum <= 9:
        anxiety_severity = "Mild"
    elif gad7_sum <= 14:
        anxiety_severity = "Moderate"
    else:
        anxiety_severity = "Severe"
    
    return {
        "Depression Severity": depression_severity,
        "Anxiety Severity": anxiety_severity
    }

# Main execution for Node.js bridge
if __name__ == "__main__":
    try:
        # Get input from Node.js
        input_data = json.loads(sys.argv[1])
        
        # Print a debug message to stderr
        print(f"Input received: {input_data}", file=sys.stderr)
        
        # Extract parameters
        phq9_responses = input_data["phq9_responses"]
        gad7_responses = input_data["gad7_responses"]
        age = input_data["age"]
        gender = input_data["gender"]
        
        # Make prediction
        prediction = predict_mental_health(phq9_responses, gad7_responses, age, gender)
        
        # Return result to Node.js
        print(json.dumps(prediction))
        
    except Exception as e:
        # Print error to stderr for debugging
        print(f"Error in Python script: {str(e)}", file=sys.stderr)
        
        # Return error message as JSON
        print(json.dumps({"error": str(e)}))
        
        # Exit with error code
        sys.exit(1)