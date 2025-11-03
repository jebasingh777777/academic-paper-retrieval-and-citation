import React from 'react';

const CitationRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return <div className="citation-recommendations">No citation recommendations available.</div>;
  }

  return (
    <div className="citation-recommendations">
      <h3>Citation Recommendations</h3>
      {recommendations.map((rec, index) => (
        <div key={index} className="recommendation-item">
          <h4>{rec.citingPaper?.title || 'Unknown Title'}</h4>
          <p className="authors">
            Authors: {rec.citingPaper?.authors?.map(author => author.name).join(', ') || 'Unknown'}
          </p>
          <p className="year">Year: {rec.citingPaper?.year || 'Unknown'}</p>
          <p className="citation-count">Citations: {rec.citingPaper?.citationCount || 0}</p>
        </div>
      ))}
    </div>
  );
};

export default CitationRecommendations;
