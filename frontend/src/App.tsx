import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RecordDetailPage from './pages/RecordDetailPage';
import RecordFormPage from './pages/RecordFormPage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/records/:id" element={<RecordDetailPage />} />
            <Route path="/records/new" element={<RecordFormPage />} />
            <Route path="/records/:id/edit" element={<RecordFormPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App; 