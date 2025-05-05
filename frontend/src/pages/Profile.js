import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editContactId, setEditContactId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: ""
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/auth/profile", {
          headers: { Authorization: token }
        });
        setUser(res.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: "", relationship: "", phone: "", email: "" });
    setEditContactId(null);
    setShowAddContact(false);
  };

  // Add new emergency contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5001/api/emergency/emergency-contact",
        formData,
        { headers: { Authorization: token } }
      );
      
      setUser({ ...user, emergencyContacts: res.data.contacts });
      toast.success("Emergency contact added successfully");
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding contact");
    }
  };

  // Update emergency contact
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5001/api/emergency/emergency-contact/${editContactId}`,
        formData,
        { headers: { Authorization: token } }
      );
      
      setUser({ ...user, emergencyContacts: res.data.contacts });
      toast.success("Emergency contact updated successfully");
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error updating contact");
    }
  };

  // Delete emergency contact
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5001/api/emergency/emergency-contact/${contactId}`,
        { headers: { Authorization: token } }
      );
      
      setUser({ ...user, emergencyContacts: res.data.contacts });
      toast.success("Emergency contact deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error deleting contact");
    }
  };

  // Set contact data for editing
  const handleEditClick = (contact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || ""
    });
    setEditContactId(contact._id);
    setShowAddContact(true);
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container py-5">
      <div className="row">
        {/* User Profile Information */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Profile Information</h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: "100px", height: "100px" }}>
                  <span className="h1 text-primary">{user?.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted">Name</label>
                <div className="h5">{user?.name}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted">Email</label>
                <div className="h5">{user?.email}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted">Member Since</label>
                <div className="h5">{new Date(user?.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Emergency Contacts</h4>
              <button
                className="btn btn-light btn-sm"
                onClick={() => {
                  resetForm();
                  setShowAddContact(!showAddContact);
                }}
              >
                {showAddContact ? "Cancel" : "+ Add Contact"}
              </button>
            </div>
            <div className="card-body">
              {/* Add/Edit Contact Form */}
              {showAddContact && (
                <div className="card mb-4 border-primary">
                  <div className="card-body">
                    <h5 className="card-title">{editContactId ? "Edit Contact" : "Add New Contact"}</h5>
                    <form onSubmit={editContactId ? handleUpdateContact : handleAddContact}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Name*</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Relationship*</label>
                          <input
                            type="text"
                            className="form-control"
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Phone*</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email (Optional)</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {editContactId ? "Update Contact" : "Add Contact"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Emergency Contacts List */}
              {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
                <div className="list-group">
                  {user.emergencyContacts.map((contact) => (
                    <div key={contact._id} className="list-group-item list-group-item-action flex-column align-items-start">
                      <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="mb-1">{contact.name}</h5>
                        <div>
                          <button
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => handleEditClick(contact)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteContact(contact._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="mb-1">
                        <strong>Relationship:</strong> {contact.relationship}
                      </p>
                      <p className="mb-1">
                        <strong>Phone:</strong> {contact.phone}
                      </p>
                      {contact.email && (
                        <p className="mb-0">
                          <strong>Email:</strong> {contact.email}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  No emergency contacts found. Please add a contact using the button above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;