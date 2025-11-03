import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import PaperList from './components/PaperList';
import PaperDetail from './components/PaperDetail';
import CitationRecommendations from './components/CitationRecommendations';
import { searchPapers, getPaperDetails, getCitationRecommendations } from './services/api';

function App() {
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchPapers(query);
      setPapers(results);
      setSelectedPaper(null);
      setRecommendations([]);
    } catch (err) {
      setError('Failed to search papers after multiple attempts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSelect = async (paper) => {
    setLoading(true);
    setError(null);
    try {
      const details = await getPaperDetails(paper.paperId);
      setSelectedPaper(details);
      const recs = await getCitationRecommendations(paper.paperId);
      setRecommendations(recs);
    } catch (err) {
      setError('Failed to load paper details after multiple attempts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPaper(null);
    setRecommendations([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Academic Paper Retrieval & Citation Recommendation</h1>
      </header>
      <main className="App-main">
        <SearchBar onSearch={handleSearch} />
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!selectedPaper ? (
          <PaperList papers={papers} onPaperSelect={handlePaperSelect} />
        ) : (
          <div>
            <PaperDetail paper={selectedPaper} onBack={handleBack} />
            <CitationRecommendations recommendations={recommendations} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
