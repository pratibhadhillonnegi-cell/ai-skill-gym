# 🔍 Google Search API Integration

Programmatic access to Google Search results for AI data enrichment and research.

---

## Overview

Your AI Skill Gym now includes Google Search API integration using SerpApi, which provides structured JSON results from Google Search instead of parsing raw HTML. This enables fast, automated search for web scraping and AI data enrichment.

---

## Features

### ✅ Available Search Types

- **Organic Search**: Regular Google search results
- **Images**: Google Images search
- **News**: Google News search
- **Maps**: Local business and location search
- **Autocomplete**: Search suggestions

### ✅ API Endpoints

All endpoints require authentication and are rate-limited (10 requests/minute per user).

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search/google` | GET | Organic search results |
| `/api/search/images` | GET | Image search results |
| `/api/search/news` | GET | News search results |
| `/api/search/maps` | GET | Maps/local search results |
| `/api/search/suggestions` | GET | Search autocomplete |

---

## Quick Start

### 1. Environment Setup

Your API key is already configured in `.env.example`:

```bash
GOOGLE_SEARCH_API_KEY=c9d7cf873c18be33ddc38e211c551d47aa7d1c34
```

### 2. Test the Integration

```bash
cd backend/ai-skill-gym
node test-google-search.js
```

### 3. Make API Calls

**Example: Search Google**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5000/api/search/google?q=AI%20prompt%20engineering&num=5"
```

**Example: Search Images**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:5000/api/search/images?q=machine%20learning%20diagrams"
```

---

## API Usage Examples

### Frontend Integration

```javascript
// Search Google from your React app
const searchGoogle = async (query) => {
  const response = await fetch('/api/search/google?q=' + encodeURIComponent(query), {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const data = await response.json();
  return data.results;
};

// Usage
const results = await searchGoogle('prompt engineering techniques');
console.log(results.organic_results); // Array of search results
```

### Backend Integration (for AI enrichment)

```javascript
// In your AI service - enrich critiques with web research
const { searchGoogle } = require('./services/googleSearchService');

const enrichCritiqueWithResearch = async (userPrompt, exerciseContext) => {
  // Search for related techniques
  const searchQuery = `prompt engineering ${exerciseContext} best practices`;
  const searchResults = await searchGoogle(searchQuery, { num: 3 });

  // Extract relevant information
  const relevantSnippets = searchResults.organic_results
    .map(result => result.snippet)
    .join(' ')
    .substring(0, 500);

  // Include in AI prompt
  const enrichedPrompt = `
    Exercise: ${exerciseContext}
    User Prompt: ${userPrompt}

    Additional Research Context:
    ${relevantSnippets}

    Provide critique considering current best practices...
  `;

  return enrichedPrompt;
};
```

---

## Response Format

### Organic Search Response

```json
{
  "success": true,
  "query": "AI prompt engineering",
  "results": {
    "search_parameters": {
      "q": "AI prompt engineering",
      "engine": "google"
    },
    "search_information": {
      "total_results": "123000000",
      "time_taken_displayed": 0.45
    },
    "organic_results": [
      {
        "position": 1,
        "title": "Prompt Engineering Guide | OpenAI",
        "link": "https://platform.openai.com/docs/guides/prompt-engineering",
        "displayed_link": "platform.openai.com › docs › guides › prompt-engineering",
        "snippet": "Learn how to craft effective prompts for GPT models...",
        "cached_page_link": "https://webcache.googleusercontent.com/...",
        "related_pages_link": "https://www.google.com/search?q=related:..."
      }
    ],
    "related_searches": [
      {
        "query": "prompt engineering examples"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Images Search Response

```json
{
  "success": true,
  "query": "machine learning diagrams",
  "results": {
    "images_results": [
      {
        "position": 1,
        "thumbnail": "https://encrypted-tbn0.gstatic.com/images?q=tbn:...",
        "original": "https://example.com/ml-diagram.png",
        "title": "Machine Learning Workflow Diagram",
        "link": "https://example.com/article",
        "source": "Example.com"
      }
    ]
  }
}
```

---

## Use Cases for AI Skill Gym

### 1. **Exercise Enhancement**

Enrich exercises with current research:
```javascript
// Add real-time research to exercise context
const enhancedExercise = await searchGoogle(`${exercise.topic} latest techniques 2024`);
```

### 2. **Critique Improvement**

Provide AI with current best practices:
```javascript
// Research current standards before critiquing
const research = await searchGoogle(`prompt engineering ${topic} best practices`);
const improvedCritique = await generateCritique(userPrompt, exerciseContext, research);
```

### 3. **Learning Resources**

Suggest additional reading:
```javascript
// Find learning resources for students
const resources = await searchGoogle(`${topic} tutorial site:github.com OR site:medium.com`);
```

### 4. **Trend Analysis**

Track prompt engineering trends:
```javascript
// Monitor what's trending in prompt engineering
const trends = await searchGoogle(`prompt engineering trends 2024`);
```

---

## Rate Limiting & Costs

### Rate Limits

- **Authenticated users**: 10 requests/minute
- **Anonymous users**: Blocked (requires login)
- **IP-based fallback**: If user not authenticated

### SerpApi Costs

- **Free tier**: 100 searches/month
- **Paid plans**: $50/month for 5,000 searches
- **Enterprise**: Custom pricing

Monitor usage at: https://serpapi.com/dashboard

---

## Configuration Options

### Search Parameters

```javascript
// Available options for searchGoogle()
const options = {
  num: 10,              // Number of results (1-100)
  start: 0,             // Start position (for pagination)
  location: 'Austin, TX', // Location for localized results
  hl: 'en',             // Language
  gl: 'us',             // Country
  safe: 'active',       // Safe search: active/off
  tbm: 'isch'           // Search type (images, news, etc.)
};

const results = await searchGoogle('query', options);
```

### Advanced Search

```javascript
// Site-specific search
await searchGoogle('site:openai.com prompt engineering');

// File type search
await searchGoogle('prompt engineering filetype:pdf');

// Date range
await searchGoogle('prompt engineering after:2024-01-01');

// Exclude terms
await searchGoogle('prompt engineering -beginner');
```

---

## Error Handling

### Common Errors

```javascript
try {
  const results = await searchGoogle(query);
} catch (error) {
  if (error.message.includes('API key')) {
    // Invalid or missing API key
    console.error('Check GOOGLE_SEARCH_API_KEY in .env');
  } else if (error.message.includes('quota')) {
    // API quota exceeded
    console.error('SerpApi quota exceeded - upgrade plan');
  } else if (error.message.includes('rate limit')) {
    // Too many requests
    console.error('Rate limit exceeded - wait before retrying');
  }
}
```

### Fallback Strategy

```javascript
// Graceful degradation if search fails
const getSearchResults = async (query) => {
  try {
    return await searchGoogle(query);
  } catch (error) {
    console.warn('Google Search failed, using fallback');
    return {
      success: false,
      error: error.message,
      fallback: true,
      results: {
        organic_results: [],
        search_information: { total_results: '0' }
      }
    };
  }
};
```

---

## Testing & Development

### Local Testing

```bash
# Test search functionality
cd backend/ai-skill-gym
node test-google-search.js

# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/search/google?q=test"
```

### Production Deployment

1. **Set environment variable in Render:**
   ```
   GOOGLE_SEARCH_API_KEY=c9d7cf873c18be33ddc38e211c551d47aa7d1c34
   ```

2. **Deploy and test:**
   ```bash
   # After deployment
   curl -H "Authorization: Bearer TOKEN" \
        "https://your-app.onrender.com/api/search/google?q=hello"
   ```

---

## Security Considerations

### API Key Protection

- ✅ Never commit API key to git
- ✅ Use environment variables
- ✅ Mark as "secret" in Render dashboard
- ✅ Rotate keys regularly

### Rate Limiting

- ✅ 10 requests/minute per authenticated user
- ✅ Prevents abuse and manages costs
- ✅ Configurable in `routes/search.js`

### Authentication Required

- ✅ All search endpoints require JWT token
- ✅ Prevents unauthorized usage
- ✅ Tracks usage per user

---

## Monitoring & Analytics

### Track Usage

```javascript
// In search routes - log usage for analytics
router.use((req, res, next) => {
  console.log(`🔍 Search: ${req.query.q} by user ${req.user.id}`);
  next();
});
```

### Monitor Costs

- Check SerpApi dashboard regularly
- Set up alerts for quota approaching limits
- Monitor error rates and response times

---

## Integration Ideas

### Exercise Enhancement

```javascript
// Add real-time research to exercises
const enhancedExercise = {
  ...exercise,
  research: await searchGoogle(`${exercise.topic} current best practices`),
  relatedArticles: await searchGoogle(`site:arxiv.org ${exercise.topic}`)
};
```

### Student Progress Tracking

```javascript
// Track what students are researching
const studentResearch = await searchGoogle(`prompt engineering ${student.level}`);
// Store in database for analytics
```

### Content Recommendations

```javascript
// Suggest learning resources
const recommendations = await searchGoogle(
  `${topic} tutorial site:github.com OR site:medium.com OR site:dev.to`
);
```

---

## Troubleshooting

### "API key not valid"

**Solution:**
- Verify `GOOGLE_SEARCH_API_KEY` in `.env`
- Check SerpApi dashboard for key status
- Ensure no extra spaces or characters

### "Rate limit exceeded"

**Solution:**
- Wait before making more requests
- Check SerpApi dashboard for usage
- Consider upgrading plan

### "No results returned"

**Solution:**
- Try different search terms
- Check if query is too restrictive
- Verify API key has search permissions

### "Connection timeout"

**Solution:**
- Check internet connection
- SerpApi servers might be down
- Try again later

---

## Support & Resources

- 📚 **SerpApi Documentation**: https://serpapi.com/documentation
- 🔧 **API Playground**: https://serpapi.com/playground
- 💰 **Pricing**: https://serpapi.com/pricing
- 🐛 **Support**: https://serpapi.com/support

---

## Next Steps

1. ✅ **Test locally**: Run `node test-google-search.js`
2. ✅ **Integrate in frontend**: Add search components
3. ✅ **Enhance AI critiques**: Use search for research
4. ✅ **Deploy to production**: Add API key to Render
5. ✅ **Monitor usage**: Track costs and performance

---

**Your AI Skill Gym now has powerful search capabilities! 🔍✨**
