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
