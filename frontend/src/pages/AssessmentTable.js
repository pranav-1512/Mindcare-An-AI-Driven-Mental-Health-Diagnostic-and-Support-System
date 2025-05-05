import React, { useState } from 'react';
import { Modal, Button, Badge, Table } from 'react-bootstrap';

const AssessmentTable = ({ assessments }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [modalType, setModalType] = useState(null); // 'phq9' or 'gad7'
  const [showModal, setShowModal] = useState(false);

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
    "Being so restless that it's hard to sit still?",
    "Becoming easily annoyed or irritable?",
    "Feeling afraid as if something awful might happen?"
  ];

  const options = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
  ];

  const handleOpenModal = (assessment, type) => {
    setSelectedAssessment(assessment);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAssessment(null);
    setModalType(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Convert to IST (UTC+5:30)
    const options = { 
      timeZone: 'Asia/Kolkata',
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-IN', options);
  };

  const getSeverityVariant = (severity) => {
    switch (severity.toLowerCase()) {
      case 'minimal': return 'success';
      case 'mild': return 'info';
      case 'moderate': return 'warning';
      case 'severe': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <div className="table-responsive">
        <Table striped hover bordered className="shadow-sm">
          <thead className="bg-light">
            <tr>
              <th>Date & Time</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Depression</th>
              <th>PHQ-9</th>
              <th>Anxiety</th>
              <th>GAD-7</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment._id}>
                <td>{formatDate(assessment.createdAt)}</td>
                <td>{assessment.age}</td>
                <td>{assessment.gender}</td>
                <td>
                  <Badge bg={getSeverityVariant(assessment.depressionSeverity)}>
                    {assessment.depressionSeverity}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleOpenModal(assessment, 'phq9')}
                  >
                    View Responses
                  </Button>
                </td>
                <td>
                  <Badge bg={getSeverityVariant(assessment.anxietySeverity)}>
                    {assessment.anxietySeverity}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleOpenModal(assessment, 'gad7')}
                  >
                    View Responses
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Response Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'phq9' ? 'PHQ-9 Depression Assessment' : 'GAD-7 Anxiety Assessment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAssessment && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <small className="text-muted">
                    Taken on: {formatDate(selectedAssessment.createdAt)}
                  </small>
                </div>
                <Badge bg={getSeverityVariant(
                  modalType === 'phq9' 
                    ? selectedAssessment.depressionSeverity 
                    : selectedAssessment.anxietySeverity
                )}>
                  Severity: {
                    modalType === 'phq9' 
                      ? selectedAssessment.depressionSeverity 
                      : selectedAssessment.anxietySeverity
                  }
                </Badge>
              </div>

              <div className="mt-4">
                {(modalType === 'phq9' ? phq9Questions : gad7Questions).map((question, index) => {
                  const responses = modalType === 'phq9' 
                    ? selectedAssessment.phq9Responses 
                    : selectedAssessment.gad7Responses;
                  
                  const response = options[responses[index]];
                  const responseVariant = 
                    response.value === 0 ? 'success' : 
                    response.value === 1 ? 'info' : 
                    response.value === 2 ? 'warning' : 'danger';
                  
                  return (
                    <div key={index} className="card mb-3">
                      <div className="card-body">
                        <div className="d-flex">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3"
                            style={{ width: '28px', height: '28px', minWidth: '28px' }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h6 className="card-title mb-3">{question}</h6>
                            <Badge bg={responseVariant}>
                              {response.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssessmentTable;