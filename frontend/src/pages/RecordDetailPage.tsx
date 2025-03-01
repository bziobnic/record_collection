import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecord, getGenres, getRecord } from '../api/recordApi';
import defaultAlbumArt from '../assets/default-album.svg';

const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Convert id to number
  const recordId = parseInt(id || '0', 10);

  // Fetch record details
  const { 
    data: record, 
    isLoading: recordLoading, 
    error: recordError 
  } = useQuery(['record', recordId], () => getRecord(recordId), {
    enabled: !!recordId,
  });

  // Fetch genres to get the genre name
  const { 
    data: genres, 
    isLoading: genresLoading 
  } = useQuery('genres', getGenres);

  // Delete record mutation
  const deleteMutation = useMutation(() => deleteRecord(recordId), {
    onSuccess: () => {
      // Invalidate records query to refresh the list
      queryClient.invalidateQueries('records');
      // Navigate back to home page
      navigate('/');
    },
  });

  // Get genre name from genre ID
  const getGenreName = (genreId: number) => {
    const genre = genres?.find(g => g.id === genreId);
    return genre ? genre.name : 'Unknown Genre';
  };

  // Handle delete button click
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate();
    }
  };

  // Loading state
  if (recordLoading || genresLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (recordError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading record. The record may not exist or there was a problem with the server.
              </p>
              <div className="mt-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-red-700 hover:text-red-600"
                >
                  ← Back to collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If record not found
  if (!record) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Record not found</h2>
          <p className="mt-2 text-gray-600">The record you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to collection
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="md:flex">
          {/* Album cover */}
          <div className="md:flex-shrink-0 md:w-1/3">
            <img
              className="h-full w-full object-cover md:h-full md:w-full"
              src={record.cover_image || defaultAlbumArt}
              alt={`${record.title} by ${record.artist}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAlbumArt;
              }}
            />
          </div>

          {/* Record details */}
          <div className="p-8 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{record.title}</h1>
                <p className="mt-1 text-xl text-gray-600">{record.artist}</p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/records/${record.id}/edit`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Delete record"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.year}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{getGenreName(record.genre_id)}</dd>
                </div>
                {record.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{record.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal would go here */}
    </div>
  );
};

export default RecordDetailPage; 