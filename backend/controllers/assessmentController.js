const Assessment = require('../models/Assessment');
const { spawn } = require('child_process');
const path = require('path');

exports.createAssessment = async (req, res) => {
  try {
    console.log("Request received:", req.body);
    
    const { phq9Responses, gad7Responses, age, gender } = req.body;
    
    // Validate input
    console.log("Validating input");
    if (!phq9Responses || !gad7Responses || !age || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    if (phq9Responses.length !== 9) {
      return res.status(400).json({ message: 'PHQ-9 must have exactly 9 responses' });
    }
    
    if (gad7Responses.length !== 7) {
      return res.status(400).json({ message: 'GAD-7 must have exactly 7 responses' });
    }

    console.log("Starting Python prediction");
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml_model/mlPredictor.py'),
      JSON.stringify({
        phq9_responses: phq9Responses,
        gad7_responses: gad7Responses,
        age: age,
        gender: gender
      })
    ]);

    let pythonData = '';
    let pythonError = '';

    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
      console.log("Python stdout:", data.toString());
    });

    // Collect any errors
    pythonProcess.stderr.on('data', (data) => {
      pythonError += data.toString();
      console.error("Python stderr:", data.toString());
    });

    // Set a timeout in case Python hangs
    const pythonTimeout = setTimeout(() => {
      pythonProcess.kill();
      return res.status(500).json({ 
        message: 'Python process timeout', 
        error: 'The prediction took too long to complete'
      });
    }, 10000); // 10 seconds timeout

    // When Python process completes
    pythonProcess.on('close', async (code) => {
      clearTimeout(pythonTimeout); // Clear the timeout
      
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(`Python error: ${pythonError}`);
        
        // If Python script fails, fall back to a rule-based prediction
        console.log("Falling back to rule-based prediction");
        const fallbackPrediction = generateFallbackPrediction(phq9Responses, gad7Responses);
        
        // Create new assessment with fallback prediction
        const newAssessment = new Assessment({
          userId: req.user.id,
          phq9Responses,
          gad7Responses,
          age,
          gender,
          depressionSeverity: fallbackPrediction["Depression Severity"],
          anxietySeverity: fallbackPrediction["Anxiety Severity"]
        });

        // Save to database
        const savedAssessment = await newAssessment.save();
        
        // Return response with fallback prediction
        return res.status(201).json({
          message: 'Assessment created with fallback prediction (ML model unavailable)',
          assessment: savedAssessment,
          prediction: fallbackPrediction,
          warning: 'Using fallback algorithm due to ML service error: ' + pythonError
        });
      }
      
      try {
        // Parse prediction results
        console.log("Python process completed successfully");
        const prediction = JSON.parse(pythonData);
        
        // Create new assessment record
        const newAssessment = new Assessment({
          userId: req.user.id,
          phq9Responses,
          gad7Responses,
          age,
          gender,
          depressionSeverity: prediction["Depression Severity"],
          anxietySeverity: prediction["Anxiety Severity"]
        });

        // Save to database
        const savedAssessment = await newAssessment.save();
        
        // Return response
        res.status(201).json({
          message: 'Assessment created successfully',
          assessment: savedAssessment,
          prediction
        });
      } catch (parseError) {
        console.error('Error parsing prediction results:', parseError);
        res.status(500).json({ 
          message: 'Error processing prediction results',
          error: parseError.message,
          rawOutput: pythonData
        });
      }
    });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fallback function to generate predictions without ML
function generateFallbackPrediction(phq9Responses, gad7Responses) {
  // Sum up PHQ-9 scores
  const phq9Sum = phq9Responses.reduce((sum, score) => sum + score, 0);
  
  // Sum up GAD-7 scores
  const gad7Sum = gad7Responses.reduce((sum, score) => sum + score, 0);
  
  // Determine depression severity based on PHQ-9 score
  let depressionSeverity;
  if (phq9Sum <= 4) {
    depressionSeverity = "Minimal";
  } else if (phq9Sum <= 9) {
    depressionSeverity = "Mild";
  } else if (phq9Sum <= 14) {
    depressionSeverity = "Moderate";
  } else if (phq9Sum <= 19) {
    depressionSeverity = "Moderately Severe";
  } else {
    depressionSeverity = "Severe";
  }
  
  // Determine anxiety severity based on GAD-7 score
  let anxietySeverity;
  if (gad7Sum <= 4) {
    anxietySeverity = "Minimal";
  } else if (gad7Sum <= 9) {
    anxietySeverity = "Mild";
  } else if (gad7Sum <= 14) {
    anxietySeverity = "Moderate";
  } else {
    anxietySeverity = "Severe";
  }
  
  return {
    "Depression Severity": depressionSeverity,
    "Anxiety Severity": anxietySeverity
  };
}

// Keep your existing controller methods
exports.getUserAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    // Check if the assessment belongs to the requesting user
    if (assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to assessment' });
    }
    
    res.status(200).json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};