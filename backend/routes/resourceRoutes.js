const express = require('express');
const router = express.Router();
const axios = require('axios');

// HERE API credentials
const HERE_API_KEY = "LxIvy1XY7QmoFB5Xiyw44APKebsS9KrC6s_BRH35PGI";

// Mental health resources by category (static fallback data)
const staticResources = {
  anxiety: [
    { name: "Anxiety and Depression Association of India", url: "https://adaindia.org", description: "Resources for anxiety disorders and depression" },
    { name: "The Mindfulness App", url: "https://themindfulnessapp.com", description: "Guided meditation for anxiety relief" },
    { name: "NIMHANS Digital Academy", url: "https://nimhansdigitalacademy.in", description: "Educational resources on mental health" }
  ],
  depression: [
    { name: "Indian Psychiatric Society", url: "https://indianpsychiatricsociety.org", description: "Resources for depression and other mental health conditions" },
    { name: "TISS iCall", url: "https://icallhelpline.org", description: "Psychosocial helpline providing counseling" },
    { name: "The Live Love Laugh Foundation", url: "https://thelivelovelaughfoundation.org", description: "Foundation focused on depression awareness" }
  ],
  stress: [
    { name: "The Art of Living", url: "https://artofliving.org", description: "Breathing techniques and meditation for stress" },
    { name: "Headspace", url: "https://headspace.com", description: "Meditation and mindfulness for stress management" },
    { name: "Practo Mind", url: "https://practo.com/mind", description: "Online counseling and stress management resources" }
  ],
  general: [
    { name: "ManoSamvaad", url: "https://manosamvaad.com", description: "Mental health community and resources in Hindi and English" },
    { name: "NIMHANS Helpline", url: "tel:080-26995000", description: "National mental health helpline" },
    { name: "Sangath", url: "https://sangath.in", description: "NGO providing mental health services across India" },
    { name: "YourDost", url: "https://yourdost.com", description: "Online counseling and emotional wellness platform" },
    { name: "Mann Mela", url: "https://mannmela.in", description: "Digital museum of mental health stories in India" }
  ],
  helplines: [
    { name: "NIMHANS Toll-Free Helpline", url: "tel:1800-599-0019", description: "24/7 mental health helpline" },
    { name: "Vandrevala Foundation", url: "tel:9999-666-555", description: "24/7 helpline for distress, emotional crisis and suicide prevention" },
    { name: "Sneha Foundation India", url: "tel:91-44-2464-0050", description: "Suicide prevention helpline" },
    { name: "Arpita Suicide Prevention Helpline", url: "tel:080-23655557", description: "Bangalore-based suicide prevention helpline" }
  ]
};

/**
 * Function to geocode a city name to coordinates using HERE API
 * @param {string} cityName - Name of the city
 * @param {string} country - Country code (default: 'IND' for India)
 * @returns {Promise<{lat: number, lng: number}>} - Coordinates object
 */
async function geocodeCity(cityName, country = 'IND') {
  try {
    const endpoint = 'https://geocode.search.hereapi.com/v1/geocode';
    const params = {
      q: `${cityName}, ${country}`,
      apiKey: HERE_API_KEY
    };

    const response = await axios.get(endpoint, { params });
    
    if (response.status === 200 && response.data.items && response.data.items.length > 0) {
      const location = response.data.items[0].position;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(`Failed to geocode city "${cityName}": ${error.message}`);
  }
}


async function getCityName(lat, lon) {
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lon}&lang=en-US&apiKey=${HERE_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.items && data.items.length > 0) {
            const city = data.items[0].address.city || 'City not found';
            return city;
        } else {
            return 'City not found';
        }
    } catch (error) {
        console.error('Error fetching city:', error.message);
        return 'Error fetching city';
    }
}

/**
 * Function to fetch dynamic mental health content from external API
 * @returns {Promise<Object>} - Additional dynamic resources, if available
 */
async function fetchDynamicMentalHealthContent() {
  try {
    // Example using NewsAPI to get mental health related articles
    // You'll need to sign up for a free API key at newsapi.org
    const NEWS_API_KEY = "8aa5b1bb5f4748269141d7ce0b45467c"; // Replace with your actual key
    const endpoint = 'https://newsapi.org/v2/everything';
    const params = {
      q: 'mental health wellness',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 5,
      apiKey: NEWS_API_KEY
    };

    const response = await axios.get(endpoint, { params });
    
    if (response.status === 200 && response.data.articles) {
      return response.data.articles.map(article => ({
        name: article.title,
        url: article.url,
        description: article.description || "Recent mental health article",
        source: article.source.name,
        publishedAt: article.publishedAt
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching dynamic content:', error);
    return []; // Return empty array on error, so we can fall back to static content
  }
}

/**
 * @route GET /api/mental-health/resources
 * @desc Get all mental health resources organized by category
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Get static resources
    const result = { ...staticResources };
    
    // Try to get dynamic recent articles (optional)
    try {
      const recentArticles = await fetchDynamicMentalHealthContent();
      if (recentArticles && recentArticles.length > 0) {
        result.recent_articles = recentArticles;
      }
    } catch (dynamicError) {
      console.error('Error fetching dynamic content (continuing with static):', dynamicError);
    }
    
    res.json({
      success: true,
      resources: result
    });
  } catch (error) {
    console.error('Error fetching mental health resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mental health resources',
      error: error.message
    });
  }
});

/**
 * @route GET /api/mental-health/nearby-doctors
 * @desc Get nearby mental health doctors based on location
 * @access Public
 */
router.get('/nearby-doctors', async (req, res) => {
  try {
    let { lat, lng, city } = req.query;
    
    // If city is provided but not coordinates, use geocoding to get coordinates
    if (city && (!lat || !lng)) {
      try {
        const coordinates = await geocodeCity(city);
        lat = coordinates.lat;
        lng = coordinates.lng;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Could not find coordinates for city "${city}". Please provide valid coordinates or check the city name.`,
          error: error.message
        });
      }
    }
    if (!city && (lat || lng)){
        try {
            city = await getCityName(lat,lng)
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: `Could not find city.`,
                error: error.message
            });
        }
    }
    
    // Validate coordinates
    if (!lat || !lng) {
        return res.status(400).json({
            success: false,
            message: 'Location coordinates or valid city name are required'
        });
    }
    
    console.log('dec city',city)
    console.log('lat lon',lat,lng)
    // We'll try multiple searches to get more mental health professionals
    const searchQueries = [
      'psychiatrist',
      'psychologist',
    //   'mental health counselor',
    //   'mental health clinic',
    //   'therapist'
    ];
    
    let allDoctors = [];
    
    // Make multiple requests to HERE API with different search terms
    for (const query of searchQueries) {
      try {
        // Define the HERE API endpoint and parameters
        const endpoint = 'https://discover.search.hereapi.com/v1/discover';
        const params = {
          q: query,
          at: `${lat},${lng}`,
          limit: 5,
          apiKey: HERE_API_KEY
        };
        
        // Send the GET request to HERE API
        const response = await axios.get(endpoint, { params });
        
        // Check if the request was successful
        if (response.status === 200) {
          const results = response.data.items || [];
          
          if (results.length > 0) {
            // Format the results and add to our collection
            const doctors = results.map(place => ({
              title: place.title,
              address: place.address?.label || 'Address not available',
              distance: place.distance,
              phone: place.contacts?.[0]?.phone?.[0]?.value || 'Phone not available',
              categories: place.categories?.map(cat => cat.name) || [],
              coordinates: {
                lat: place.position.lat,
                lng: place.position.lng
              },
              searchTerm: query
            }));
            
            allDoctors = [...allDoctors, ...doctors];
          }
        }
      } catch (searchError) {
        console.error(`Error searching for "${query}":`, searchError);
        // Continue with other searches even if one fails
      }
    }
    
    // Remove duplicates based on title
    const uniqueDoctors = Array.from(
      new Map(allDoctors.map(doctor => [doctor.title, doctor])).values()
    );
    
    // Sort by distance
    uniqueDoctors.sort((a, b) => a.distance - b.distance);
    
    if (uniqueDoctors.length === 0) {
      return res.json({
        success: true,
        message: 'No mental health professionals found in this area.',
        doctors: []
      });
    }
    
    res.json({
      success: true,
      doctors: uniqueDoctors
    });
  } catch (error) {
    console.error('Error fetching nearby doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby mental health professionals',
      error: error.message
    });
  }
});

module.exports = router;