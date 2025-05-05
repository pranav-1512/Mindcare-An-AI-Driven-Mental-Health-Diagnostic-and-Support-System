import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const severityColors = {
  "Minimal": "text-success",
  "Mild": "text-primary",
  "Moderate": "text-warning",
  "Severe": "text-danger"
};
const AssessmentResults = () => {
    const token = localStorage.getItem("token")
    const location = useLocation();
    const result = location.state?.result || {};
    console.log('Result in AssessmentResults:', result.prediction);

    const depressionSeverity = result.prediction["Depression Severity"];
    const anxietySeverity = result.prediction["Anxiety Severity"];

    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                setLoading(true); // Start loading
                const { data } = await axios.post("http://localhost:5001/api/plan/generate-plan", {
                    depressionSeverity,
                    anxietySeverity
                },
                { headers: { Authorization: token } }
            );
            console.log('plan',data)
                setPlanData(data);
            } catch (error) {
                console.error("Error fetching plan:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchPlan();
    }, [depressionSeverity, anxietySeverity]);
    console.log('dep sev',depressionSeverity)
    console.log('dep sev',anxietySeverity)

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-lg text-center">
                <h2>Assessment Results</h2>
                <p>Your mental health assessment results are as follows:</p>

                <h4 className={severityColors[depressionSeverity]}>
                    Depression: {depressionSeverity}
                </h4>
                <h4 className={severityColors[anxietySeverity]}>
                    Anxiety: {anxietySeverity}
                </h4>
            </div>

            {/* Show loader while fetching the plan */}
            {loading ? (
                <div className="text-center mt-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only"></span>
                    </div>
                    <p>Generating your personalized plan...</p>
                </div>
            ) : (
                planData && (
                    <div className="card p-4 shadow-lg mt-4">
                        <h2>Personalized Mental Health Plan</h2>

                        <h3>Personalized Plan</h3>
                        <p>{planData.personalized_plan}</p>

                        <h3>Daily Goals</h3>
                        <ul>
                            {planData.daily_goals.map((goal, index) => (
                                <li key={index}>{goal}</li>
                            ))}
                        </ul>

                        <h3>Coping Strategies</h3>
                        <ul>
                            {planData.coping_strategies.map((strategy, index) => (
                                <li key={index}>{strategy}</li>
                            ))}
                        </ul>
                    </div>
                )
            )}
        </div>
    );
};

export default AssessmentResults;
