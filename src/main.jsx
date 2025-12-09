import React from 'react';
import ReactDOM from 'react-dom/client';
import { FlashCardQuiz } from './FlashCardQuiz.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <FlashCardQuiz />
  </ErrorBoundary>
);
