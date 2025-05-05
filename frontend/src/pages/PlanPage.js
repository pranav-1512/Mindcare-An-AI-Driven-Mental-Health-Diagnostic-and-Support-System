import { useState, useEffect } from "react";
import axios from "axios";

const PlanPage = ({ depressionSeverity, anxietySeverity }) => {
    const [planData, setPlanData] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const { data } = await axios.post("http://localhost:5001/api/plan/generate-plan", {
                    depressionSeverity,
                    anxietySeverity
                });
                setPlanData(data);
            } catch (error) {
                console.error("Error fetching plan:", error);
            }
        };
        fetchPlan();
    }, [depressionSeverity, anxietySeverity]);

    return (
        <div className="container mt-5">
            <h2>Personalized Mental Health Plan</h2>
            {planData ? (
                <>
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
                </>
            ) : (
                <p>Generating your personalized plan...</p>
            )}
        </div>
    );
};

export default PlanPage;
