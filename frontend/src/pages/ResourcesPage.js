// components/ResourcesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBook, FaPhone, FaMedkit, FaHeartbeat, FaBrain, FaLightbulb, FaMapMarkerAlt } from 'react-icons/fa';
import './ResourcesPage.css';

const ResourcesPage = () => {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/resources');
        setResources(response.data.resources);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch resources. Please try again later.');
        setLoading(false);
        console.error('Error fetching resources:', err);
      }
    };

    fetchResources();
  }, []);

  const handleFindDoctors = () => {
    navigate('/resources/nearby-doctors');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'anxiety':
        return <FaBrain />;
      case 'depression':
        return <FaHeartbeat />;
      case 'stress':
        return <FaLightbulb />;
      case 'helplines':
        return <FaPhone />;
      default:
        return <FaMedkit />;
    }
  };

  const formatPhoneNumber = (url) => {
    if (url && url.startsWith('tel:')) {
      return url.substring(4);
    }
    return url;
  };

  return (
    <div className="resources-page">
      <header className="header">
        <div className="header-content">
          <h1>Mental Health Resources</h1>
          <p>Find support, information, and help for your mental wellbeing</p>
        </div>
      </header>

      <section className="find-doctor-banner">
        <div className="banner-content">
          <h2>Need Professional Help?</h2>
          <p>Find mental health professionals near your location</p>
          <button 
            className="find-doctor-btn" 
            onClick={handleFindDoctors}
          >
            <FaMapMarkerAlt /> Find Doctors Nearby
          </button>
        </div>
      </section>

      <section className="resources-container">
        <div className="category-tabs">
          {resources && Object.keys(resources).map((category) => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="resources-list">
          {resources && resources[activeCategory]?.map((resource, index) => (
            <div className="resource-card" key={index}>
              <div className="resource-icon">
                {getCategoryIcon(activeCategory)}
              </div>
              <div className="resource-content">
                <h3>{resource.name}</h3>
                <p>{resource.description}</p>
                {resource.url && resource.url.startsWith('tel:') ? (
                  <a href={resource.url} className="resource-link phone-link">
                    <FaPhone /> {formatPhoneNumber(resource.url)}
                  </a>
                ) : (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                    <FaBook /> Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {resources && resources.recent_articles && (
        <section className="recent-articles">
          <h2>Recent Mental Health Articles</h2>
          <div className="articles-grid">
            {resources.recent_articles.map((article, index) => (
              <div className="article-card" key={index}>
                <h3>{article.name}</h3>
                <p className="article-source">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</p>
                <p className="article-description">{article.description.substring(0, 150)}...</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                  Read More
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <p>© 2025 Mental Health Resources. If you're in crisis, please call a helpline immediately.</p>
      </footer>
    </div>
  );
};

export default ResourcesPage;