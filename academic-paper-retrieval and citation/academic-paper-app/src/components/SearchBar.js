import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions] = useState([
    'machine learning',
    'artificial intelligence',
    'deep learning',
    'neural networks',
    'computer vision',
    'natural language processing',
    'data science',
    'reinforcement learning',
    'computer science',
    'quantum computing'
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for academic papers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={!query.trim()}>
          Search
        </button>
      </form>
      {!query && (
        <div className="search-suggestions">
          <p>Popular searches:</p>
          <div className="suggestion-tags">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-tag"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
