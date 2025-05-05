import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, MinusCircle, Clock, BarChart2, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import './AnalysisComparision.css'
// /* Additional styles follow similar pattern */

const AnalysisComparison = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/journals/compare',
            {
                headers:{
                    Authorization:token
                }
            }
        );
        setComparisonData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching comparison data:', err);
        setError(err.message || 'Failed to fetch comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, []);

  // Helper function to get the appropriate trend icon
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'improving':
        return <ArrowUpCircle style={{color: '#10b981'}} />;
      case 'declining':
        return <ArrowDownCircle style={{color: '#ef4444'}} />;
      default:
        return <MinusCircle style={{color: '#3b82f6'}} />;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colors = {
      improving: {backgroundColor: '#dcfce7', color: '#166534'},
      declining: {backgroundColor: '#fee2e2', color: '#b91c1c'},
      stable: {backgroundColor: '#dbeafe', color: '#1e40af'}
    };
    
    return colors[status] || {backgroundColor: '#f3f4f6', color: '#374151'};
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Inline styles for components
  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      maxWidth: '64rem',
      margin: '0 auto'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    subheading: {
      color: '#4b5563',
      marginBottom: '1.5rem'
    },
    summaryCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    flexRow: {
      display: 'flex',
      alignItems: 'center'
    },
    spacer: {
      marginLeft: '0.5rem',
      marginRight: '0.5rem'
    },
    label: {
      color: '#4b5563',
      fontWeight: 500,
      marginLeft: '0.5rem'
    },
    value: {
      color: '#1f2937'
    },
    statusBadge: (status) => ({
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: getStatusColor(status).backgroundColor,
      color: getStatusColor(status).color
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      gap: '1.5rem',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
      }
    },
    card: {
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      border: '1px solid #e5e7eb'
    },
    cardCurrent: {
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      border: '1px solid #bfdbfe'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '1rem'
    },
    cardTitleCurrent: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1e40af',
      marginBottom: '1rem'
    },
    dataRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    dataLabel: {
      color: '#4b5563'
    },
    dataLabelCurrent: {
      color: '#3b82f6'
    },
    dataValue: {
      color: '#1f2937',
      textAlign: 'right'
    },
    dataValueCurrent: {
      color: '#1e40af',
      textAlign: 'right'
    },
    emotionsSection: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem'
    },
    emotionsTitle: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    noDataMessage: {
      textAlign: 'center',
      padding: '1.5rem 0',
      color: '#6b7280'
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{...styles.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem'}}>
        <Loader style={{color: '#3b82f6', marginBottom: '1rem', animation: 'spin 1s linear infinite'}} size={32} />
        <p style={{color: '#4b5563'}}>Loading comparison data...</p>
      </div>
    );
  }

  // Error state
  if (error || !comparisonData) {
    return (
      <div style={{...styles.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem'}}>
        <AlertCircle style={{color: '#ef4444', marginBottom: '1rem'}} size={32} />
        <p style={{color: '#ef4444', fontWeight: 500, marginBottom: '0.5rem'}}>Failed to load comparison data</p>
        <p style={{color: '#4b5563', fontSize: '0.875rem', textAlign: 'center'}}>{error || "No data available"}</p>
      </div>
    );
  }

  // Ensure timeDifference.text exists and is a string
  const timeDifferenceText = comparisonData.changes.timeDifference && 
    typeof comparisonData.changes.timeDifference === 'object' ? 
    comparisonData.changes.timeDifference.text || 'Not available' : 
    String(comparisonData.changes.timeDifference || 'Not available');

  return (
    <div style={styles.container} className="comparison-container">
      <div style={{marginBottom: '1.5rem'}}>
        <h1 style={styles.heading} className="heading">Analysis Comparison</h1>
        <p style={styles.subheading} className="subheading">
          Comparing your most recent emotional analysis with the previous one
        </p>
      </div>

      {/* Summary Card */}
      <div style={styles.summaryCard} className="summary-card">
        <div style={styles.flexRow}>
          <Clock style={{color: '#6b7280'}} />
          <span style={styles.label}>Time between analyses:</span>
          <span style={{...styles.value, ...styles.spacer}}>{timeDifferenceText}</span>
        </div>
        <div style={styles.flexRow}>
          <TrendingUp style={{color: '#6b7280'}} />
          <span style={styles.label}>Overall change:</span>
          <span style={styles.statusBadge(comparisonData.changes.overallChange)}>
            {comparisonData.changes.overallChange.charAt(0).toUpperCase() + comparisonData.changes.overallChange.slice(1)}
          </span>
        </div>
      </div>

      {/* Comparison Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
        gap: '1.5rem'
      }}>
        {/* Previous Analysis Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Previous Analysis</h2>
          <div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Timeframe:</span>
              <div style={styles.dataValue}>
                <div>{formatDate(comparisonData.previous.timeframe.start)}</div>
                <div>to {formatDate(comparisonData.previous.timeframe.end)}</div>
              </div>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Dominant Emotion:</span>
              <span style={{...styles.dataValue, textTransform: 'capitalize', fontWeight: 500}}>{comparisonData.previous.dominantEmotion}</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Overall Trend:</span>
              <div style={{...styles.flexRow, justifyContent: 'flex-end'}}>
                {getTrendIcon(comparisonData.previous.overallTrend)}
                <span style={{...styles.dataValue, textTransform: 'capitalize', fontWeight: 500, marginLeft: '0.5rem'}}>{comparisonData.previous.overallTrend}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Analysis Card */}
        <div style={styles.cardCurrent}>
          <h2 style={styles.cardTitleCurrent}>Current Analysis</h2>
          <div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabelCurrent}>Timeframe:</span>
              <div style={styles.dataValueCurrent}>
                <div>{formatDate(comparisonData.current.timeframe.start)}</div>
                <div>to {formatDate(comparisonData.current.timeframe.end)}</div>
              </div>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabelCurrent}>Dominant Emotion:</span>
              <span style={{...styles.dataValueCurrent, textTransform: 'capitalize', fontWeight: 500}}>{comparisonData.current.dominantEmotion}</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabelCurrent}>Overall Trend:</span>
              <div style={{...styles.flexRow, justifyContent: 'flex-end'}}>
                {getTrendIcon(comparisonData.current.overallTrend)}
                <span style={{...styles.dataValueCurrent, textTransform: 'capitalize', fontWeight: 500, marginLeft: '0.5rem'}}>{comparisonData.current.overallTrend}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Changes Visualization */}
      <div style={styles.emotionsSection}>
        <div style={styles.emotionsTitle}>
          <BarChart2 style={{color: '#374151', marginRight: '0.5rem'}} />
          <h2 style={{fontSize: '1.125rem', fontWeight: 600, color: '#1f2937'}}>Emotional Shifts</h2>
        </div>
        {comparisonData.changes.emotionalShift && 
         comparisonData.changes.emotionalShift.emotions && 
         Object.keys(comparisonData.changes.emotionalShift.emotions).length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
            gap: '1rem'
          }}>
            {Object.entries(comparisonData.changes.emotionalShift.emotions).map(([emotion, changeValue]) => {
              // Handle if changeValue is an object or primitive
              const changeDisplay = typeof changeValue === 'object' 
                ? (changeValue.change !== undefined ? `${changeValue.change > 0 ? '+' : ''}${changeValue.change}%` : 'N/A')
                : `${changeValue > 0 ? '+' : ''}${changeValue}%`;
                
              // Determine color based on change value
              const changeNumber = typeof changeValue === 'object' 
                ? (changeValue.change !== undefined ? changeValue.change : 0)
                : (typeof changeValue === 'number' ? changeValue : 0);
              
              const changeColor = changeNumber > 0 ? '#059669' : changeNumber < 0 ? '#dc2626' : '#4b5563';
              
              return (
                <div key={emotion} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{textTransform: 'capitalize', color: '#374151'}}>{emotion}:</span>
                  <div style={styles.flexRow}>
                    <span style={{ color: changeColor }}>
                      {changeDisplay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noDataMessage}>
            No significant emotional shifts detected
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisComparison;