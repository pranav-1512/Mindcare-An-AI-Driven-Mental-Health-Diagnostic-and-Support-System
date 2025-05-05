// components/NearbyDoctorsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPhoneAlt, FaMapMarkerAlt, FaClinicMedical, FaWalking } from 'react-icons/fa';
import './NearbyDoctorsPage.css';

const NearbyDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFindDoctors = () => {
    setLocationLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('pos',position)
          try {
            setLoading(true);
            const response = await axios.get(
              `http://localhost:5001/api/resources/nearby-doctors?lat=${latitude}&lng=${longitude}`
            );
            setDoctors(response.data.doctors);
            setLoading(false);
            setLocationLoading(false);
          } catch (err) {
            setError('Failed to fetch nearby doctors. Please try again.');
            setLoading(false);
            setLocationLoading(false);
            console.error('Error fetching doctors:', err);
          }
        },
        (error) => {
          setLocationLoading(false);
          setError('Location access denied. Please enable location services and try again.');
          console.error('Error getting location:', error);
        }
      );
    } else {
      setLocationLoading(false);
      setError('Geolocation is not supported by your browser.');
    }
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  const formatPhoneNumber = (phone) => {
    if (phone === "Phone not available") {
      return null;
    }
    return phone;
  };

  return (
    <div className="doctors-page">
      <header className="doctors-header">
        <button className="back-button" onClick={() => navigate('/resources')}>
          <FaArrowLeft /> Back to Resources
        </button>
        <h1>Find Mental Health Professionals Near You</h1>
      </header>

      <div className="location-container">
        {!doctors.length && !loading && !locationLoading && (
          <div className="get-location-card">
            <div className="get-location-content">
              <h2>Find Doctors Near Your Location</h2>
              <p>Click the button below to use your current location to find mental health professionals nearby</p>
              <button 
                className="find-location-btn" 
                onClick={handleFindDoctors}
                disabled={locationLoading}
              >
                {locationLoading ? 'Getting Location...' : 'Use My Location'}
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
        )}

        {locationLoading && (
          <div className="loading-location">
            <div className="spinner"></div>
            <p>Getting your location...</p>
          </div>
        )}

        {loading && (
          <div className="loading-doctors">
            <div className="spinner"></div>
            <p>Searching for doctors near you...</p>
          </div>
        )}

        {doctors.length > 0 && (
          <div className="doctors-results">
            <h2>Mental Health Professionals Near You</h2>
            <p className="results-count">{doctors.length} professionals found</p>
            
            <div className="doctors-list">
              {doctors.map((doctor, index) => (
                <div className="doctor-card" key={index}>
                  <div className="doctor-specialty-tag">
                    {doctor.searchTerm.charAt(0).toUpperCase() + doctor.searchTerm.slice(1)}
                  </div>
                  <h3 className="doctor-title">{doctor.title}</h3>
                  <div className="doctor-detail">
                    <FaMapMarkerAlt className="doctor-icon" />
                    <p>{doctor.address}</p>
                  </div>
                  <div className="doctor-detail">
                    <FaWalking className="doctor-icon" />
                    <p>Distance: {formatDistance(doctor.distance)}</p>
                  </div>
                  <div className="doctor-detail">
                    <FaClinicMedical className="doctor-icon" />
                    <p>{doctor.categories.join(', ')}</p>
                  </div>
                  {formatPhoneNumber(doctor.phone) && (
                    <a 
                      href={`tel:${formatPhoneNumber(doctor.phone)}`} 
                      className="doctor-phone-btn"
                    >
                      <FaPhoneAlt /> Call Now
                    </a>
                  )}
                  <a 
                    href={`https://maps.google.com/?q=${doctor.coordinates.lat},${doctor.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doctor-directions-btn"
                  >
                    <FaMapMarkerAlt /> Get Directions
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="doctors-footer">
        <p>© 2025 Mental Health Resources. All data is provided for informational purposes only.</p>
      </footer>
    </div>
  );
};

export default NearbyDoctorsPage;