const axios = require('axios');

const SERPER_API_KEY = process.env.SERPER_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;
const SERPER_API_BASE_URL = process.env.SERPER_API_BASE_URL || 'https://google.serper.dev';
const SERPER_TIMEOUT = Number(process.env.SERPER_TIMEOUT || 60000);

const serperRequest = async (endpoint, body = {}) => {
  if (!SERPER_API_KEY) {
    throw new Error('SERPER_API_KEY is required');
  }

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${SERPER_API_BASE_URL}/${endpoint}`,
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(body),
    timeout: SERPER_TIMEOUT,
  };

  const response = await axios.request(config);
  return response.data;
};

const buildSerperOptions = (query, options = {}) => ({
  q: query,
  ...options,
});

/**
 * Search Google and return structured results
 * @param {string} query
 * @param {Object} options
 */
const searchGoogle = async (query, options = {}) => {
  try {
    return await serperRequest('search', buildSerperOptions(query, options));
  } catch (error) {
    console.error('Serper search error:', error);
    throw new Error('Failed to perform Serper web search');
  }
};

/**
 * Search Google Images
 * @param {string} query
 * @param {Object} options
 */
const searchGoogleImages = async (query, options = {}) => {
  try {
    return await serperRequest('images', buildSerperOptions(query, options));
  } catch (error) {
    console.error('Serper images error:', error);
    throw new Error('Failed to perform Serper image search');
  }
};

/**
 * Search Google News
 * @param {string} query
 * @param {Object} options
 */
const searchGoogleNews = async (query, options = {}) => {
  try {
    return await serperRequest('news', buildSerperOptions(query, options));
  } catch (error) {
    console.error('Serper news error:', error);
    throw new Error('Failed to perform Serper news search');
  }
};

/**
 * Search Google Shopping
 * @param {string} query
 * @param {Object} options
 */
const searchGoogleShopping = async (query, options = {}) => {
  try {
    return await serperRequest('shopping', buildSerperOptions(query, options));
  } catch (error) {
    console.error('Serper shopping error:', error);
    throw new Error('Failed to perform Serper shopping search');
  }
};

/**
 * Search Google Maps/Local results
 * @param {string} query
 * @param {Object} options
 */
const searchGoogleMaps = async (query, options = {}) => {
  try {
    return await serperRequest('places', buildSerperOptions(query, options));
  } catch (error) {
    console.error('Serper maps error:', error);
    throw new Error('Failed to perform Serper maps search');
  }
};

/**
 * Get autocomplete suggestions from Serper
 * @param {string} query
 */
const getSearchSuggestions = async (query) => {
  try {
    const result = await serperRequest('suggest', { q: query });
    return result.suggestions || result.data?.suggestions || [];
  } catch (error) {
    console.error('Serper autocomplete error:', error);
    throw new Error('Failed to retrieve Serper autocomplete suggestions');
  }
};

module.exports = {
  searchGoogle,
  searchGoogleImages,
  searchGoogleNews,
  searchGoogleShopping,
  searchGoogleMaps,
  getSearchSuggestions
};
