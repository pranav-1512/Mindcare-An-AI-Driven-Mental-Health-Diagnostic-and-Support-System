import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MoodJournal = () => {
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5001/api/journals/entry', {
        text: journalText
      }, {
        headers: {
          'Authorization': token
        }
      });

      console.log("res", response.data);
      const { entry, alert } = response.data;
      
      // If crisis detected, redirect to support page with data
      if (alert && (alert.level === 'emergency' || alert.level === 'warning')) {
        // Pass necessary data via navigation state
        navigate('/crisis-support', { 
          state: { 
            alert, 
            dominantEmotion: entry.dominantEmotion,
            journalId: entry._id 
          } 
        });
        return;
      }
      
      // For non-crisis entries, show success and reset
      setSubmitSuccess(true);
      setJournalText(''); // Clear the text area
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {submitSuccess && (
            <Alert variant="success" className="mb-3">
              Journal saved successfully!
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-primary text-white">
              <i className="bi bi-journal-text me-2"></i>
              My Mood Journal
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>How are you feeling today?</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write your thoughts and feelings here..."
                    disabled={isSubmitting}
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting || !journalText.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving and analyzing your journal...
                      </>
                    ) : (
                      'Save Journal Entry'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MoodJournal;