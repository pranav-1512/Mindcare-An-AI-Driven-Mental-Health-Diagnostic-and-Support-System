import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

// Emotion color mapping for consistency across visualizations
const EMOTION_COLORS = {
  joy: '#FFCD56',      // yellow
  sadness: '#6C8EBF',  // blue
  anger: '#FF6384',    // red
  fear: '#9966FF',     // purple
  surprise: '#4BC0C0', // teal
  love: '#FF9F80'      // coral
};

// Trend indicator icons
const TREND_ICONS = {
  increasing: '↗️',
  decreasing: '↘️',
  stable: '→'
};

const MoodProgressDashboard = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        // Can Also go for analysis-history
        const response = await axios.get('http://localhost:5001/api/journals/progress',{
            headers: {
                'Authorization': token
            }
        }
        );
        setProgressData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  // Format dates for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Prepare emotion change data for the timeline
  const prepareEmotionChangeData = (emotionChanges) => {
    if (!emotionChanges) return [];
    
    return emotionChanges.map(change => ({
      date: formatDate(change.date),
      timestamp: new Date(change.date).getTime(),
      from: change.from,
      to: change.to,
      fromColor: EMOTION_COLORS[change.from],
      toColor: EMOTION_COLORS[change.to]
    })).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare emotion counts for pie chart
  const prepareEmotionCountData = (emotionCounts) => {
    if (!emotionCounts) return [];
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion,
      value: count,
      color: EMOTION_COLORS[emotion]
    }));
  };

  // Prepare score trends for line chart
  const prepareScoreTrendData = (scoreTrends, emotionChanges) => {
    if (!scoreTrends || !emotionChanges) return [];
    
    // Create an array of all dates from emotion changes
    const allDates = emotionChanges.map(change => new Date(change.date).getTime());
    
    // Sort dates chronologically
    allDates.sort((a, b) => a - b);
    
    // For each emotion, create data points for the line chart
    const emotionData = {};
    
    Object.entries(scoreTrends).forEach(([emotion, data]) => {
      emotionData[emotion] = [
        { date: formatDate(new Date(allDates[0])), value: data.start }
      ];
      
      // Add intermediate points if available
      for (let i = 1; i < allDates.length - 1; i++) {
        // This is simplified - in a real app, you'd interpolate or use actual values
        emotionData[emotion].push({
          date: formatDate(new Date(allDates[i])),
          value: (data.start + data.end) / 2
        });
      }
      
      emotionData[emotion].push({
        date: formatDate(new Date(allDates[allDates.length - 1])),
        value: data.end
      });
    });
    
    // Combine all emotion data into a single array for the chart
    const result = [];
    const dates = [...new Set(Object.values(emotionData).flat().map(item => item.date))];
    
    dates.forEach(date => {
      const dataPoint = { date };
      
      Object.entries(emotionData).forEach(([emotion, data]) => {
        const point = data.find(p => p.date === date);
        if (point) {
          dataPoint[emotion] = point.value;
        }
      });
      
      result.push(dataPoint);
    });
    
    return result;
  };

  // Prepare trend data for horizontal bar chart
  const prepareTrendBarData = (scoreTrends) => {
    if (!scoreTrends) return [];
    
    return Object.entries(scoreTrends).map(([emotion, data]) => ({
      name: emotion,
      change: parseFloat((data.change * 100).toFixed(1)),
      trend: data.trend,
      color: EMOTION_COLORS[emotion]
    })).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
          {/* <span>Loading...</span> */}
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!progressData) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          No progress data available yet. Add more journal entries to see your emotional trends.
        </Alert>
      </Container>
    );
  }

  const { 
    timeframe, 
    entriesAnalyzed, 
    trends, 
    insights 
  } = progressData;

  const emotionChangeData = prepareEmotionChangeData(trends.emotionChanges);
  const emotionCountData = prepareEmotionCountData(trends.emotionCounts);
  const scoreTrendData = prepareScoreTrendData(trends.scoreTrends, trends.emotionChanges);
  const trendBarData = prepareTrendBarData(trends.scoreTrends);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Mood Journal Progress</h2>
      <p className="text-muted text-center mb-4">
        Analyzing {entriesAnalyzed} entries from {formatDate(timeframe.start)} to {formatDate(timeframe.end)}
      </p>

      {/* AI Insights Section */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Insights</h4>
        </Card.Header>
        <Card.Body>
          <div style={{ whiteSpace: 'pre-line' }}>
            {insights.content}
          </div>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        {/* Overall Trend Card */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Overall Mood Trend</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <h3 className="display-4 text-center mb-3">
                {trends.overallTrend === 'improving' ? '😊' : 
                 trends.overallTrend === 'declining' ? '😔' : '😐'}
              </h3>
              <h4 className="text-center text-capitalize">
                {trends.overallTrend}
                <Badge 
                  bg={trends.overallTrend === 'improving' ? 'success' : 
                      trends.overallTrend === 'declining' ? 'danger' : 'secondary'}
                  className="ms-2"
                >
                  {trends.overallTrend === 'improving' ? '↗️' : 
                   trends.overallTrend === 'declining' ? '↘️' : '→'}
                </Badge>
              </h4>
              <p className="text-center mt-3">
                Dominant emotion: <span className="fw-bold" style={{ color: EMOTION_COLORS[trends.dominantEmotion] }}>
                  {trends.dominantEmotion}
                </span>
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* Emotion Distribution Pie Chart */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Emotion Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={emotionCountData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {emotionCountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Emotion Changes Timeline */}
        <Col md={12} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Mood Shifts</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                {emotionChangeData.map((change, index) => (
                  <div className="timeline-item d-flex mb-3" key={index}>
                    <div className="timeline-date me-3">
                      <small>{change.date}</small>
                    </div>
                    <div className="timeline-content d-flex align-items-center">
                      <Badge 
                        style={{ backgroundColor: change.fromColor }}
                        className="me-2"
                      >
                        {change.from}
                      </Badge>
                      <span className="mx-2">→</span>
                      <Badge 
                        style={{ backgroundColor: change.toColor }}
                      >
                        {change.to}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Emotion Score Trends Line Chart */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Emotion Intensity Over Time</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={scoreTrendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(EMOTION_COLORS).map(emotion => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_COLORS[emotion]}
                    activeDot={{ r: 8 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      {/* Emotion Score Changes Bar Chart */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Emotion Changes (%) Over Period</h5>
        </Card.Header>
        <Card.Body>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={trendBarData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#000' }}
                />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Bar 
                  dataKey="change" 
                  background={{ fill: '#eee' }}
                >
                  {trendBarData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Bar>
                {/* Trend indicators */}
                {/* <text
                  x={100}
                  y={20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-trend-legend"
                >
                  {Object.entries(TREND_ICONS).map(([trend, icon], i) => (
                    <tspan key={trend} x="100" dy={i === 0 ? 0 : 20}>
                      {icon} {trend}
                    </tspan>
                  ))}
                </text> */}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 d-flex flex-wrap justify-content-center">
            {trendBarData.map((item, index) => (
              <div key={index} className="mx-3 mb-2 d-flex align-items-center">
                <span style={{ color: item.color }} className="fw-bold me-2">{item.name}</span>
                <span>{TREND_ICONS[item.trend]}</span>
                <span className="ms-1">{item.change > 0 ? '+' : ''}{item.change}%</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MoodProgressDashboard;