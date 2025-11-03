import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SEMANTIC_SCHOLAR_API_BASE = 'https://api.semanticscholar.org/graph/v1';
// const CROSSREF_API_BASE = 'https://api.crossref.org/works'; // Reserved for future use
const ARXIV_API_BASE = 'http://export.arxiv.org/api/query';

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Retry utility function
const retryRequest = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      // eslint-disable-next-line no-loop-func
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

export const searchPapers = async (query, limit = 20) => {
  try {
    // Try Semantic Scholar first
    const semanticScholarResults = await retryRequest(async () => {
      const response = await axios.get(`${SEMANTIC_SCHOLAR_API_BASE}/paper/search`, {
        params: {
          query,
          limit: Math.ceil(limit / 2), // Split limit between APIs
          fields: 'title,authors,year,abstract,citationCount,paperId'
        }
      });
      return response.data.data || [];
    });

    // Try arXiv for additional results
    let arxivResults = [];
    try {
      const arxivResponse = await axios.get(ARXIV_API_BASE, {
        params: {
          search_query: `all:${query}`,
          start: 0,
          max_results: Math.ceil(limit / 2),
          sortBy: 'relevance',
          sortOrder: 'descending'
        }
      });

      // Parse arXiv XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(arxivResponse.data, 'text/xml');
      const entries = xmlDoc.getElementsByTagName('entry');

      arxivResults = Array.from(entries).map(entry => ({
        paperId: entry.getElementsByTagName('id')[0]?.textContent || '',
        title: entry.getElementsByTagName('title')[0]?.textContent || '',
        authors: Array.from(entry.getElementsByTagName('author')).map(author =>
          ({ name: author.getElementsByTagName('name')[0]?.textContent || '' })
        ),
        year: new Date(entry.getElementsByTagName('published')[0]?.textContent || '').getFullYear(),
        abstract: entry.getElementsByTagName('summary')[0]?.textContent || '',
        citationCount: 0, // arXiv doesn't provide citation counts
        source: 'arXiv'
      }));
    } catch (error) {
      console.log('arXiv search failed, continuing with Semantic Scholar results only');
    }

    // Combine and deduplicate results
    const combinedResults = [...semanticScholarResults, ...arxivResults];
    const uniqueResults = combinedResults.filter((paper, index, self) =>
      index === self.findIndex(p => p.title === paper.title)
    );

    return uniqueResults.slice(0, limit);
  } catch (error) {
    console.error('All search APIs failed:', error);
    throw new Error('Failed to retrieve papers from all sources');
  }
};

export const getPaperDetails = async (paperId) => {
  return retryRequest(async () => {
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}`, {
      params: {
        fields: 'title,authors,year,abstract,citationCount,references,citations'
      }
    });
    return response.data;
  });
};

export const getCitationRecommendations = async (paperId, limit = 5) => {
  return retryRequest(async () => {
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}/citations`, {
      params: {
        limit,
        fields: 'title,authors,year,citationCount'
      }
    });
    return response.data.data;
  });
};

export const generatePaperSummary = async (paperTitle, paperAbstract) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Please provide a concise summary of the following academic paper in 2-3 sentences:

Title: ${paperTitle}
Abstract: ${paperAbstract}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating paper summary:', error);
    if (error.message.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your REACT_APP_GEMINI_API_KEY in the .env file.');
    }
    throw new Error('Failed to generate AI summary. Please try again later.');
  }
};
