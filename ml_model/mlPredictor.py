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
