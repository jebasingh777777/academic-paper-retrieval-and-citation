import React from 'react';

const PaperList = ({ papers, onPaperSelect }) => {
  if (!papers || papers.length === 0) {
    return null; // Don't show anything when no papers are loaded yet
  }

  return (
    <div className="paper-list">
      {papers.map((paper) => (
        <div key={paper.paperId} className="paper-item" onClick={() => onPaperSelect(paper)}>
          <h3>{paper.title}</h3>
          <p className="authors">
            {paper.authors?.map(author => author.name).join(', ')}
          </p>
          <p className="year">Year: {paper.year}</p>
          <p className="citation-count">Citations: {paper.citationCount || 0}</p>
          {paper.abstract && (
            <p className="abstract">{paper.abstract.substring(0, 200)}...</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaperList;
