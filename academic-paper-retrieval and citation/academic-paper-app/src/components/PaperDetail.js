import React, { useState, useEffect } from 'react';
import { generatePaperSummary } from '../services/api';

const PaperDetail = ({ paper, onBack }) => {
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (paper && paper.abstract) {
        setLoadingSummary(true);
        try {
          const aiSummary = await generatePaperSummary(paper.title, paper.abstract);
          setSummary(aiSummary);
        } catch (error) {
          console.error('Failed to generate summary:', error);
          setSummary(error.message || 'AI summary unavailable. Please check your API key.');
        } finally {
          setLoadingSummary(false);
        }
      }
    };

    fetchSummary();
  }, [paper]);

  if (!paper) return null;

  return (
    <div className="paper-detail">
      <button onClick={onBack} className="back-button">Back to Results</button>
      <h2>{paper.title}</h2>
      <p className="authors">
        Authors: {paper.authors?.map(author => author.name).join(', ')}
      </p>
      <p className="year">Year: {paper.year}</p>
      <p className="citation-count">Citations: {paper.citationCount || 0}</p>
      {paper.abstract && (
        <div className="abstract">
          <h3>Abstract</h3>
          <p>{paper.abstract}</p>
        </div>
      )}
      <div className="ai-summary">
        <h3>AI-Generated Summary</h3>
        {loadingSummary ? (
          <p>Loading AI summary...</p>
        ) : (
          <p>{summary}</p>
        )}
      </div>
    </div>
  );
};

export default PaperDetail;
