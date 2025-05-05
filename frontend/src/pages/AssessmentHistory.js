import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner, Container } from 'react-bootstrap';
import AssessmentTable from './AssessmentTable';

const AssessmentHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/assessments',{
            headers:
            {
                Authorization:token
            }
        });
        setAssessments(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch assessment data. Please try again later.');
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error!</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>Mental Health Assessment History</h2>
        <p className="text-muted">View your past PHQ-9 and GAD-7 assessment results</p>
      </div>
      
      {assessments.length === 0 ? (
        <Alert variant="warning">
          <Alert.Heading>No Assessments Found</Alert.Heading>
          <p>
            You haven't taken any assessments yet. Complete an assessment to see your results here.
          </p>
        </Alert>
      ) : (
        <AssessmentTable assessments={assessments} />
      )}
    </Container>
  );
};

export default AssessmentHistory;