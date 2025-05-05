const SelfAssessment = require("../models/SelfAssessment");
const path = require("path");
const { spawn } = require("child_process");

// Adjust to your Python path
const pythonExecutable = "C:\\Users\\prana\\anaconda3\\python.exe"; 



const runMLModel = (userInputs) => {
  return new Promise((resolve, reject) => {
    const scriptPath = "C:\\Users\\prana\\OneDrive\\Documents\\Material\\PP2\\Mindcare\\ml_model\\scripts\\mlPredictor.py";

    // Check if userInputs is undefined or empty
    if (!userInputs || Object.keys(userInputs).length === 0) {
      reject("Error: Invalid or empty input data.");
      return;
    }

    const pythonProcess = spawn(pythonExecutable, [scriptPath]);

    let result = "";
    let errorMsg = "";

    // Send JSON input to Python via stdin
    const inputString = JSON.stringify(userInputs);
    pythonProcess.stdin.write(inputString);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorMsg += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(`ML Model Error: ${errorMsg}`);
      }
    });
  });
};



exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT
    const { answers } = req.body;

    // Validate that answers are provided
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ status: "error", message: "Invalid or empty answers data." });
    }

    // Run ML Model
    const prediction = await runMLModel(answers);

    // Save to MongoDB
    const newAssessment = new SelfAssessment({ userId, answers, prediction });
    await newAssessment.save();

    res.status(200).json({ status: "success", prediction, message: "Assessment completed successfully!" });
  } catch (error) {
    console.error("Assessment Error:", error);
    res.status(500).json({ status: "error", message: "Failed to process assessment" });
  }
};
