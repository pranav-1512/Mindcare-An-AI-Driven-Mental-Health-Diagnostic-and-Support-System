import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "", relationship: "", phone: "", email: "" }
  ]);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const navigate = useNavigate();

  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][field] = value;
    setEmergencyContacts(updatedContacts);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: "", relationship: "", phone: "", email: "" }
    ]);
  };

  const removeEmergencyContact = (index) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts.splice(index, 1);
    setEmergencyContacts(updatedContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out any empty emergency contacts
    const filteredContacts = emergencyContacts.filter(
      contact => contact.name && contact.relationship && contact.phone
    );
    
    try {
      await axios.post("http://localhost:5001/api/auth/register", {
        name,
        email,
        password,
        emergencyContacts: filteredContacts
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="col-md-8 mx-auto card p-4 shadow-lg">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h4>Emergency Contacts</h4>
              <button 
                type="button" 
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowEmergencyForm(!showEmergencyForm)}
              >
                {showEmergencyForm ? "Hide" : "Add"} Emergency Contacts
              </button>
            </div>
          </div>

          {showEmergencyForm && (
            <div className="mb-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="card mb-3 p-3 border-secondary">
                  <div className="d-flex justify-content-between mb-2">
                    <h5>Contact #{index + 1}</h5>
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeEmergencyContact(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Relationship</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contact.relationship}
                        onChange={(e) => handleEmergencyContactChange(index, "relationship", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, "phone", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        value={contact.email}
                        onChange={(e) => handleEmergencyContactChange(index, "email", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-success w-100 mb-3"
                onClick={addEmergencyContact}
              >
                + Add Another Contact
              </button>
            </div>
          )}

          <button className="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;