import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// PHQ-9 and GAD-7 Questions
const phq9Questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself - or that you are a failure?",
  "Trouble concentrating on things, such as reading?",
  "Moving or speaking so slowly that others noticed?",
  "Thoughts that you would be better off dead or hurting yourself?"
];

const gad7Questions = [
  "Feeling nervous, anxious, or on edge?",
  "Not being able to stop or control worrying?",
  "Worrying too much about different things?",
  "Trouble relaxing?",
  "Being so restless that it’s hard to sit still?",
  "Becoming easily annoyed or irritable?",
  "Feeling afraid as if something awful might happen?"
];

// Options for responses
const options = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

const SelfAssessment = () => {
  const [phq9Responses, setPhq9Responses] = useState(Array(9).fill(0));
  const [gad7Responses, setGad7Responses] = useState(Array(7).fill(0));
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Handle response change
  const handleChange = (index, value, type) => {
    if (type === "phq9") {
      const updatedResponses = [...phq9Responses];
      updatedResponses[index] = value;
      setPhq9Responses(updatedResponses);
    } else {
      const updatedResponses = [...gad7Responses];
      updatedResponses[index] = value;
      setGad7Responses(updatedResponses);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/assessments/create",
        { phq9Responses, gad7Responses,age,gender },
        { headers: { Authorization: token } }
      );
      console.log("data",data)

      // Redirect to results page with assessment data
      navigate("/assessment-results", { state: { result: data } });
    } catch (error) {
      console.error("Error submitting assessment:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg">
        <h2 className="text-center">Mental Health Self-Assessment</h2>
        <p className="text-muted text-center">Please answer the following questions:</p>
        <div className="mb-3">
           <label>Age:</label>
           <input type="number" className="form-control" value={age} onChange={(e) => setAge(e.target.value)} required />
         </div>
         <div className="mb-3">
           <label>Gender:</label>
           <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
             <option>Male</option>
             <option>Female</option>
             <option>Other</option>
           </select>
         </div>

        {/* PHQ-9 Questions */}
        <h4 className="mt-4">PHQ-9 (Depression) Questions:</h4>
        {phq9Questions.map((question, index) => (
          <div key={index} className="mb-3">
            <p>{index + 1}. {question}</p>
            {options.map((option) => (
              <label key={option.value} className="mx-2">
                <input
                  type="radio"
                  name={`phq9-${index}`}
                  value={option.value}
                  checked={phq9Responses[index] === option.value}
                  onChange={() => handleChange(index, option.value, "phq9")}
                /> {option.label}
              </label>
            ))}
          </div>
        ))}

        {/* GAD-7 Questions */}
        <h4 className="mt-4">GAD-7 (Anxiety) Questions:</h4>
        {gad7Questions.map((question, index) => (
          <div key={index} className="mb-3">
            <p>{index + 1}. {question}</p>
            {options.map((option) => (
              <label key={option.value} className="mx-2">
                <input
                  type="radio"
                  name={`gad7-${index}`}
                  value={option.value}
                  checked={gad7Responses[index] === option.value}
                  onChange={() => handleChange(index, option.value, "gad7")}
                /> {option.label}
              </label>
            ))}
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessment;
