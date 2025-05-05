import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';

const CrisisSupport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { alert, dominantEmotion, journalId } = location.state || {};
  
  const [aiSupport, setAiSupport] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [error, setError] = useState(null);
  
  // Get emergency level from the alert or default to 'moderate'
  const emergencyLevel = alert?.level || 'moderate';
  
  // Get token for API calls
  const token = localStorage.getItem("token");
  
  // Fetch AI-generated coping strategies on component mount
  useEffect(() => {
    if (!journalId) {
      setError("Missing journal information");
      setIsLoadingAI(false);
      return;
    }
    
    fetchAISupport();
  }, [journalId]);
  
  const fetchAISupport = async () => {
    try {
      setIsLoadingAI(true);
      
      const response = await axios.get(`http://localhost:5001/api/journals/support/${journalId}`, {
        headers: {
          'Authorization': token
        }
      });
      
      setAiSupport(response.data.supportContent);
    } catch (err) {
      console.error("Failed to fetch AI support:", err);
      setError("Unable to load personalized support content. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  // Helper function to get color based on emotion
  const getEmotionColor = (emotion) => {
    const emotionColors = {
      sadness: '#6c757d', // gray-blue
      fear: '#fd7e14',    // orange
      anger: '#dc3545',   // red
      joy: '#28a745',     // green
      love: '#e83e8c',    // pink
      surprise: '#17a2b8', // teal
      unknown: '#6c757d'  // gray
    };
    return emotionColors[emotion] || '#6c757d';
  };
  
  // Handle return to journal
  const handleBackToJournal = () => {
    navigate('/journals');
  };

  const suggestCounselor = () => {
    navigate('/resources/nearby-doctors')
  }
  
  // Get crisis alert variant
  const getCrisisAlertVariant = (level) => {
    switch (level) {
      case 'emergency':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'concern':
        return 'info';
      default:
        return 'light';
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col lg={10} className="mx-auto">
          {/* Back to journal button */}
          <div className="mb-3">
            <Button variant="outline-secondary" onClick={handleBackToJournal}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Journal
            </Button>
          </div>
          
          {/* Crisis Alert Message */}
          <Alert 
            variant={getCrisisAlertVariant(emergencyLevel)} 
            className="mb-4 border"
          >
            <Alert.Heading>
              {emergencyLevel === 'emergency' ? (
                <>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  We're Here For You
                </>
              ) : (
                <>
                  <i className="bi bi-exclamation-circle me-2"></i>
                  We Notice You're Going Through a Tough Time
                </>
              )}
            </Alert.Heading>
            <p className="mb-0">
              {emergencyLevel === 'emergency' ? 
                "Based on what you've written, we're concerned about your wellbeing right now." : 
                "We've noticed some challenging emotions in your writing."}
            </p>
            
            {alert?.contactNotified && (
              <p className="mt-2">
                <i className="bi bi-telephone-outbound me-1"></i>
                Your emergency contact has been notified to check in with you.
              </p>
            )}
            
            {alert?.resources && alert.resources.length > 0 && (
              <div className="mt-3">
                <p className="fw-bold mb-2">Resources available now:</p>
                <ListGroup>
                  {alert.resources.map((resource, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <span>{resource.name}</span>
                      <span className="badge bg-primary rounded-pill">{resource.contact}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </Alert>
          
          <Row>
            <Col md={6}>
              {/* Breathing Exercise Component */}
              <Card className="mb-4 shadow-sm border-top border-primary">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-lungs me-2"></i>
                    Guided Breathing Exercise
                  </h5>
                </Card.Header>
                <Card.Body className="text-center py-4">
                  <div className="breathing-circle mx-auto mb-3" style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: getEmotionColor(dominantEmotion),
                    animation: 'breathing 6s ease-in-out infinite'
                  }}></div>
                  <p className="mb-0 fw-bold">Breathe in as the circle expands</p>
                  <p className="mb-3">Breathe out as it contracts</p>
                  <p className="text-muted">Continue for 2-3 minutes, focusing only on your breath.</p>
                  
                  <style jsx>{`
                    @keyframes breathing {
                      0%, 100% { transform: scale(0.8); opacity: 0.7; }
                      50% { transform: scale(1.2); opacity: 1; }
                    }
                  `}</style>
                </Card.Body>
                <Card.Footer className="text-center">
                  <p className="mb-0 small text-muted">Controlled breathing helps activate your parasympathetic nervous system, reducing stress and anxiety.</p>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={6}>
              {/* Resources based on emotion */}
              <Card className="mb-4 shadow-sm" style={{ borderLeft: `4px solid ${getEmotionColor(dominantEmotion)}` }}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-heart-pulse me-2"></i>
                    Immediate Coping Strategies
                  </h5>
                  {dominantEmotion && (
                    <span className="badge" style={{ backgroundColor: getEmotionColor(dominantEmotion), color: '#fff' }}>
                      {dominantEmotion === 'unknown' ? 'Mixed Feelings' : dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}
                    </span>
                  )}
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h6>5-4-3-2-1 Grounding</h6>
                    <p className="mb-0 text-muted">Identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.</p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h6>Body Scan Relaxation</h6>
                    <p className="mb-0 text-muted">Starting at your toes, focus on each part of your body, noticing any tension and letting it go as you move upward.</p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <h6>Cognitive Reframing</h6>
                    <p className="mb-0 text-muted">Ask yourself: Is there another way to look at this situation? What would I tell a friend who felt this way?</p>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          
          {/* AI-generated personalized support */}
          <Card className="shadow-sm mb-4">
            <Card.Header as="h5" className="bg-light">
              <i className="bi bi-stars me-2"></i>
              Personalized Support
            </Card.Header>
            <Card.Body>
              {isLoadingAI ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary" />
                  <p className="mt-3">Generating personalized support strategies for you...</p>
                </div>
              ) : error ? (
                <Alert variant="warning">
                  {error}
                </Alert>
              ) : aiSupport ? (
                <div dangerouslySetInnerHTML={{ __html: aiSupport }} />
              ) : (
                <Alert variant="info">
                  Unable to load personalized support at this time.
                </Alert>
              )}
            </Card.Body>
            <Card.Footer>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">These suggestions are tailored to your specific situation.</span>
                <Button variant="outline-primary" size="sm" onClick={fetchAISupport} disabled={isLoadingAI}>
                  {isLoadingAI ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                      Loading...
                    </>
                  ) : (
                    <>Refresh Suggestions</>
                  )}
                </Button>
              </div>
            </Card.Footer>
          </Card>
          
          {/* Action buttons */}
          <div className="d-flex justify-content-between mb-5">
            <Button variant="outline-secondary" onClick={handleBackToJournal}>
              <i className="bi bi-arrow-left me-2"></i>
              Return to Journal
            </Button>
            <Button variant="success" onClick={suggestCounselor}>
              <i className="bi bi-chat-dots me-2"></i>
              Talk to a Counselor
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CrisisSupport;