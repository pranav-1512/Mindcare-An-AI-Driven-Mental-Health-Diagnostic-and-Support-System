# import sys
# import json
# import joblib

# # Load Model
# model_path = "C:\\Users\\prana\\OneDrive\\Documents\\Material\\PP2\\Mindcare\\ml_model\\emotion_classifier.pkl"
# emotion_classifier = joblib.load(model_path)

# def analyze_mood(text):
#     print(f"Received input: {text}")  # Debugging
#     if not text or not isinstance(text, str):  
#         return {"error": "Invalid input text"}

#     try:
#         prediction = emotion_classifier.predict([text])
#         print(f"Model output: {prediction}")  
#         return {"mood": prediction[0]}
#     except Exception as e:
#         print(f"Error in prediction: {e}")
#         return {"error": str(e)}

# if __name__ == "__main__":
#     try:
#         # Read input from stdin **line-by-line** instead of `read()`
#         raw_data = sys.stdin.readline().strip()  
        
#         print(f"Raw input received: {raw_data}")  # Debugging

#         if not raw_data:  # Handle empty input
#             raise ValueError("No input received")

#         input_data = json.loads(raw_data)  # Parse JSON safely
#         text = input_data.get("text", "")

#         if not text:
#             raise ValueError("No text field provided in JSON")

#         result = analyze_mood(text)
#         print(json.dumps(result))  # Send output
#     except Exception as e:
#         print(f"Python Error: {e}")
#         print(json.dumps({"error": str(e)}))


# import sys
# import json
# from transformers import pipeline

# # Load emotion classifier
# classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=6)

# def analyze_mood(text):
#     predictions = classifier(text)

#     # Ensure predictions are returned correctly
#     if not predictions or len(predictions) == 0:
#         raise ValueError("No predictions received from model.")

#     return predictions[0]  # Extract top emotions

# if __name__ == "__main__":
#     try:
#         # Read JSON input from stdin
#         raw_input = sys.stdin.read().strip()
#         if not raw_input:
#             raise ValueError("No input received.")

#         data = json.loads(raw_input)
#         text = data.get("text", "").strip()

#         if not text:
#             raise ValueError("Empty text input received.")

#         # Get sentiment analysis
#         mood_predictions = analyze_mood(text)

#         # Output JSON result
#         print(json.dumps({"mood": mood_predictions}, ensure_ascii=False))

#     except Exception as e:
#         print(json.dumps({"error": f"Error in Python script: {str(e)}"}, ensure_ascii=False))



# import sys
# import json
# from transformers import pipeline

# # Load emotion classifier
# classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=6)

# def analyze_mood(text):
#     try:
#         # Ensure text is not empty
#         if not text or not text.strip():
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Perform classification
#         predictions = classifier(text)
        
#         # Ensure predictions are not empty
#         if not predictions or len(predictions) == 0:
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Return the first (top) set of predictions
#         return predictions[0]
#     except Exception as e:
#         # Log the error for debugging
#         sys.stderr.write(f"Error in mood analysis: {str(e)}\n")
#         return [{"label": "neutral", "score": 1.0}]

# if __name__ == "__main__":
#     try:
#         # Read JSON input from stdin
#         raw_input = sys.stdin.read().strip()
#         if not raw_input:
#             raise ValueError("No input received.")

#         data = json.loads(raw_input)
#         text = data.get("text", "").strip()

#         # Get sentiment analysis
#         mood_predictions = analyze_mood(text)

#         # Output JSON result
#         print(json.dumps({"mood": mood_predictions}, ensure_ascii=False))

#     except Exception as e:
#         # Improved error handling
#         error_message = f"Error in Python script: {str(e)}"
#         sys.stderr.write(error_message + "\n")
#         print(json.dumps({"error": error_message}, ensure_ascii=False))


# import sys
# import json
# import warnings
# import logging
# from transformers import pipeline

# # Suppress specific warnings
# warnings.filterwarnings("ignore", category=UserWarning)
# logging.getLogger("transformers").setLevel(logging.ERROR)

# # Load emotion classifier
# try:
#     classifier = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=6)
# except Exception as init_error:
#     sys.stderr.write(f"Model initialization error: {str(init_error)}\n")
#     sys.exit(1)

# def analyze_mood(text):
#     try:
#         # Ensure text is not empty
#         if not text or not text.strip():
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Temporarily redirect stderr to capture any warnings
#         import io
#         import contextlib

#         # Capture any stderr output
#         f = io.StringIO()
#         with contextlib.redirect_stderr(f):
#             # Perform classification
#             predictions = classifier(text)
        
#         # Check if any stderr output occurred
#         stderr_output = f.getvalue().strip()
#         if stderr_output:
#             sys.stderr.write(f"Model warning: {stderr_output}\n")
        
#         # Ensure predictions are not empty
#         if not predictions or len(predictions) == 0:
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Return the first (top) set of predictions
#         return predictions[0]
#     except Exception as e:
#         # Log the error for debugging
#         sys.stderr.write(f"Error in mood analysis: {str(e)}\n")
#         return [{"label": "neutral", "score": 1.0}]

# if __name__ == "__main__":
#     try:
#         # Read JSON input from stdin
#         raw_input = sys.stdin.read().strip()
#         if not raw_input:
#             raise ValueError("No input received.")

#         data = json.loads(raw_input)
#         text = data.get("text", "").strip()

#         # Get sentiment analysis
#         mood_predictions = analyze_mood(text)

#         # Output JSON result
#         print(json.dumps({"mood": mood_predictions}, ensure_ascii=False))

#     except Exception as e:
#         # Improved error handling
#         error_message = f"Error in Python script: {str(e)}"
#         sys.stderr.write(error_message + "\n")
#         print(json.dumps({"error": error_message}, ensure_ascii=False))


# import sys
# import json
# import joblib
# import numpy as np
# from transformers import pipeline

# def load_model(model_path):
#     """
#     Load the saved model from a .pkl file
#     """
#     try:
#         classifier = joblib.load(model_path)
#         return classifier
#     except Exception as e:
#         sys.stderr.write(f"Error loading model: {str(e)}\n")
#         # Fallback to pipeline if model loading fails
#         return pipeline("text-classification", 
#                         model="bhadresh-savani/distilbert-base-uncased-emotion", 
#                         top_k=6)

# def analyze_mood(classifier, text):
#     try:
#         # Ensure text is not empty
#         if not text or not text.strip():
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Perform classification
#         try:
#             # If it's a joblib-loaded pipeline or transformers pipeline
#             predictions = classifier(text)[0]
#         except TypeError:
#             # If it's a custom model that needs different processing
#             predictions = classifier(text)
        
#         # Ensure predictions are not empty
#         if not predictions or len(predictions) == 0:
#             return [{"label": "neutral", "score": 1.0}]
        
#         # Normalize scores if needed
#         if isinstance(predictions[0], dict):
#             # If already in dict format with label and score
#             return sorted(predictions, key=lambda x: x['score'], reverse=True)
#         else:
#             # If in numpy or other format, convert to list of dicts
#             emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
#             predictions = [
#                 {"label": label, "score": float(score)} 
#                 for label, score in zip(emotion_labels, predictions)
#             ]
#             return sorted(predictions, key=lambda x: x['score'], reverse=True)
    
#     except Exception as e:
#         # Log the error for debugging
#         sys.stderr.write(f"Error in mood analysis: {str(e)}\n")
#         return [{"label": "neutral", "score": 1.0}]

# if __name__ == "__main__":
#     try:
#         # Load the model
#         model_path = './emotion_classifier.pkl'
#         classifier = load_model(model_path)
        
#         # Read JSON input from stdin
#         raw_input = sys.stdin.read().strip()
#         if not raw_input:
#             raise ValueError("No input received.")

#         data = json.loads(raw_input)
#         text = data.get("text", "").strip()

#         # Get sentiment analysis
#         mood_predictions = analyze_mood(classifier, text)

#         # Output JSON result
#         print(json.dumps({"mood": mood_predictions}, ensure_ascii=False))

#     except Exception as e:
#         # Improved error handling
#         error_message = f"Error in Python script: {str(e)}"
#         sys.stderr.write(error_message + "\n")
#         print(json.dumps({"error": error_message}, ensure_ascii=False))




# WORKING (BEFORE SOS)

# import sys
# import json
# import os
# import numpy as np
# from transformers import pipeline
# from functools import lru_cache

# # Global model to prevent repeated loading
# EMOTION_CLASSIFIER = None

# def initialize_model():
#     """
#     Initialize the emotion classification model efficiently
#     """
#     global EMOTION_CLASSIFIER
#     if EMOTION_CLASSIFIER is None:
#         EMOTION_CLASSIFIER = pipeline(
#             "text-classification", 
#             model="bhadresh-savani/distilbert-base-uncased-emotion", 
#             top_k=6,
#             # Add these parameters to improve performance
#             device=-1,  # Use CPU to avoid CUDA initialization overhead
#             batch_size=1  # Optimize for single text processing
#         )
#     return EMOTION_CLASSIFIER

# def analyze_emotions(text):
#     """
#     Enhanced emotion analysis with keyword-based scoring
#     """
#     keywords = {
#         'grief': ['grief', 'loss', 'miss', 'pain', 'sadness', 'empty', 'hard'],
#         'love': ['love', 'warmth', 'safe', 'wisdom', 'memory', 'proud', 'grateful'],
#         'growth': ['transform', 'potential', 'hope', 'strength', 'capable', 'reflection', 'compassion'],
#         'anxiety': ['struggling', 'overwhelming', 'pressure', 'anxiety', 'stress', 'fear', 'difficult']
#     }
    
#     # Custom keyword scoring
#     emotion_scores = {
#         'sadness': sum(text.lower().count(word) for word in keywords['grief']) * 0.3,
#         'love': sum(text.lower().count(word) for word in keywords['love']) * 0.2,
#         'joy': sum(text.lower().count(word) for word in keywords['growth']) * 0.3,
#         'fear': sum(text.lower().count(word) for word in keywords['anxiety']) * 0.2
#     }
    
#     return emotion_scores

# def advanced_mood_analysis(text):
#     """
#     Advanced mood analysis combining model prediction and keyword analysis
#     """
#     # Initialize model
#     classifier = initialize_model()
    
#     # Get model predictions
#     try:
#         model_predictions = classifier(text)[0]
#     except Exception as e:
#         sys.stderr.write(f"Model prediction error: {e}\n")
#         model_predictions = [{"label": "neutral", "score": 1.0}]
    
#     # Get keyword-based scores
#     keyword_scores = analyze_emotions(text)
    
#     # Blend model predictions with keyword scores
#     final_emotions = {}
#     for pred in model_predictions:
#         label = pred['label']
#         model_score = pred['score']
        
#         # Adjust score with keyword analysis
#         keyword_boost = keyword_scores.get(label, 0)
#         final_score = model_score + keyword_boost
        
#         final_emotions[label] = final_score
    
#     # Sort and format results
#     sorted_emotions = sorted(
#         [{"label": label, "score": score} for label, score in final_emotions.items()], 
#         key=lambda x: x['score'], 
#         reverse=True
#     )
    
#     return sorted_emotions

# if __name__ == "__main__":
#     try:
#         # Read input
#         raw_input = sys.stdin.read().strip()
#         data = json.loads(raw_input)
#         text = data.get("text", "").strip()
        
#         # Perform mood analysis
#         mood_predictions = advanced_mood_analysis(text)
        
#         # Output results
#         print(json.dumps({"mood": mood_predictions}, ensure_ascii=False))
    
#     except Exception as e:
#         error_message = f"Error in mood analysis: {str(e)}"
#         sys.stderr.write(error_message + "\n")
#         print(json.dumps({"error": error_message}, ensure_ascii=False))




# TRIAL (AFTER SOS)
import sys
import json
import os
import numpy as np
from transformers import pipeline
from functools import lru_cache

# Global model to prevent repeated loading
EMOTION_CLASSIFIER = None

# Define critical mental health keywords and phrases
CRITICAL_INDICATORS = [
    # Suicidal ideation
    "want to die", "end my life", "kill myself", "suicide", "better off dead", 
    "no reason to live", "can't go on", "take my own life", "end it all",
    # Severe depression
    "hopeless", "worthless", "burden to everyone", "no future", "everyone would be better without me",
    "cannot bear this pain", "nothing matters anymore", "trapped", "no way out",
    # Self-harm
    "cut myself", "harm myself", "hurt myself", "self-harm", "inflict pain"
]

def initialize_model():
    """
    Initialize the emotion classification model efficiently
    """
    global EMOTION_CLASSIFIER
    if EMOTION_CLASSIFIER is None:
        EMOTION_CLASSIFIER = pipeline(
            "text-classification", 
            model="bhadresh-savani/distilbert-base-uncased-emotion", 
            top_k=6,
            # Add these parameters to improve performance
            device=-1,  # Use CPU to avoid CUDA initialization overhead
            batch_size=1  # Optimize for single text processing
        )
    return EMOTION_CLASSIFIER

def analyze_emotions(text):
    """
    Enhanced emotion analysis with keyword-based scoring
    """
    keywords = {
        'grief': ['grief', 'loss', 'miss', 'pain', 'sadness', 'empty', 'hard'],
        'love': ['love', 'warmth', 'safe', 'wisdom', 'memory', 'proud', 'grateful'],
        'growth': ['transform', 'potential', 'hope', 'strength', 'capable', 'reflection', 'compassion'],
        'anxiety': ['struggling', 'overwhelming', 'pressure', 'anxiety', 'stress', 'fear', 'difficult']
    }
    
    # Custom keyword scoring
    emotion_scores = {
        'sadness': sum(text.lower().count(word) for word in keywords['grief']) * 0.3,
        'love': sum(text.lower().count(word) for word in keywords['love']) * 0.2,
        'joy': sum(text.lower().count(word) for word in keywords['growth']) * 0.3,
        'fear': sum(text.lower().count(word) for word in keywords['anxiety']) * 0.2
    }
    
    return emotion_scores

def detect_crisis_indicators(text):
    """
    Detect critical mental health indicators in text
    Returns a dictionary with crisis assessment
    """
    text_lower = text.lower()
    
    # Check for critical phrases
    critical_matches = [phrase for phrase in CRITICAL_INDICATORS if phrase in text_lower]
    
    # Assess overall severity based on:
    # 1. Number of critical phrases matched
    # 2. Intensity of language (multiple instances of same phrase)
    severity_score = len(critical_matches)
    
    # Add score for repeated instances (indicates stronger intent)
    for phrase in critical_matches:
        count = text_lower.count(phrase)
        if count > 1:
            severity_score += (count - 1) * 0.5
    
    # Calculate overall risk level
    crisis_detected = severity_score >= 1
    emergency_level = "high" if severity_score >= 2 else "moderate" if severity_score >= 1 else "low"
    
    return {
        "crisis_detected": crisis_detected,
        "emergency_level": emergency_level,
        "severity_score": severity_score,
        "indicators_found": critical_matches
    }

def advanced_mood_analysis(text):
    """
    Advanced mood analysis combining model prediction and keyword analysis
    """
    # Initialize model
    classifier = initialize_model()
    
    # Get model predictions
    try:
        model_predictions = classifier(text)[0]
    except Exception as e:
        sys.stderr.write(f"Model prediction error: {e}\n")
        model_predictions = [{"label": "neutral", "score": 1.0}]
    
    # Get keyword-based scores
    keyword_scores = analyze_emotions(text)
    
    # Blend model predictions with keyword scores
    final_emotions = {}
    for pred in model_predictions:
        label = pred['label']
        model_score = pred['score']
        
        # Adjust score with keyword analysis
        keyword_boost = keyword_scores.get(label, 0)
        final_score = model_score + keyword_boost
        
        final_emotions[label] = final_score
    
    # Sort and format results
    sorted_emotions = sorted(
        [{"label": label, "score": score} for label, score in final_emotions.items()], 
        key=lambda x: x['score'], 
        reverse=True
    )
    
    # Add crisis detection
    crisis_assessment = detect_crisis_indicators(text)
    
    return sorted_emotions, crisis_assessment

if __name__ == "__main__":
    try:
        # Read input
        raw_input = sys.stdin.read().strip()
        data = json.loads(raw_input)
        text = data.get("text", "").strip()
        
        # Perform mood analysis and crisis detection
        mood_predictions, crisis_assessment = advanced_mood_analysis(text)
        
        # Output results with crisis information
        result = {
            "mood": mood_predictions,
            "crisis_assessment": crisis_assessment
        }
        
        print(json.dumps(result, ensure_ascii=False))
    
    except Exception as e:
        error_message = f"Error in mood analysis: {str(e)}"
        sys.stderr.write(error_message + "\n")
        print(json.dumps({"error": error_message}, ensure_ascii=False))