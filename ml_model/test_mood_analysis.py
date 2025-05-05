import sys
import subprocess
import json

def test_mood_analysis():
    # Test texts
    test_texts = [
        "Today was a wonderful day! I accomplished all my tasks and felt very productive.",
        "I'm feeling really anxious about the upcoming deadline.",
        "I feel sad and lonely today, nothing seems to be going right.",
        "I'm excited about the new project and can't wait to get started!"
    ]

    # Path to your mood_analysis.py script
    script_path = './mood_analysis.py'

    # Test each text
    for text in test_texts:
        print(f"\nTesting text: {text}")
        try:
            # Run the Python script with the text as an argument
            result = subprocess.run(
                ['python', script_path, text], 
                capture_output=True, 
                text=True, 
                check=True
            )
            
            # Parse the JSON output
            analysis = json.loads(result.stdout)
            
            print("Analysis Results:")
            print(json.dumps(analysis, indent=2))
            
            # Validate basic structure
            assert 'dominant_emotion' in analysis, "Missing dominant emotion"
            assert 'timestamp' in analysis, "Missing timestamp"
            
            # Check emotion scores
            for emotion, score in analysis.items():
                if emotion not in ['dominant_emotion', 'timestamp']:
                    assert 0 <= score <= 1, f"Invalid score for {emotion}"
        
        except subprocess.CalledProcessError as e:
            print(f"Error running script: {e}")
            print(f"stderr: {e.stderr}")
        except json.JSONDecodeError:
            print("Failed to parse JSON output")
        except AssertionError as e:
            print(f"Validation error: {e}")

if __name__ == "__main__":
    test_mood_analysis()


# import sys
# import subprocess
# import json
# import os
# import traceback

# def test_mood_analysis():
#     # Test texts
#     test_texts = [
#         "Today was a wonderful day! I accomplished all my tasks and felt very productive.",
#         "I'm feeling really anxious about the upcoming deadline.",
#         "I feel sad and lonely today, nothing seems to be going right.",
#         "I'm excited about the new project and can't wait to get started!"
#     ]

#     # Path to your mood_analysis.py script
#     script_path = os.path.join(os.path.dirname(__file__), 'mood_analysis.py')

#     # Test each text
#     for text in test_texts:
#         print(f"\nTesting text: {text}")
#         try:
#             # Run the Python script with the text as an argument
#             result = subprocess.run(
#                 ['python', script_path, text], 
#                 capture_output=True, 
#                 text=True, 
#                 check=True
#             )
            
#             # Parse the JSON output
#             analysis = json.loads(result.stdout)
            
#             print("Analysis Results:")
#             print(json.dumps(analysis, indent=2))
            
#             # Validate basic structure
#             assert 'dominant_emotion' in analysis, "Missing dominant emotion"
#             assert 'timestamp' in analysis, "Missing timestamp"
            
#             # Check emotion scores
#             for emotion, score in analysis.items():
#                 if emotion not in ['dominant_emotion', 'timestamp']:
#                     assert 0 <= score <= 1, f"Invalid score for {emotion}"
            
#             print("Analysis passed successfully!")
        
#         except subprocess.CalledProcessError as e:
#             print(f"Error running script: {e}")
#             print(f"stderr: {e.stderr}")
#         except json.JSONDecodeError:
#             print("Failed to parse JSON output")
#         except AssertionError as e:
#             print(f"Validation error: {e}")
#         except Exception as e:
#             print(f"Unexpected error: {e}")
#             traceback.print_exc()

# def save_model():
#     """
#     Save the emotion classifier model
#     """
#     try:
#         # Get the directory of the current script
#         script_dir = os.path.dirname(__file__)
#         script_path = os.path.join(script_dir, 'mood_analysis.py')
        
#         # Run the mood_analysis.py script with 'save' argument
#         result = subprocess.run(
#             ['python', script_path, 'save'], 
#             capture_output=True, 
#             text=True, 
#             check=True
#         )
#         print("Model saving output:")
#         print(result.stdout)
        
#         if result.stderr:
#             print("Error output:")
#             print(result.stderr)
#     except subprocess.CalledProcessError as e:
#         print(f"Error saving model: {e}")
#         print(f"stderr: {e.stderr}")
#         traceback.print_exc()

# if __name__ == "__main__":
#     # Save the model first
#     save_model()
    
#     # Run tests
#     test_mood_analysis()