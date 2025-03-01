import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createRecord, getGenres, getRecord, updateRecord } from '../api';
import RecordForm from '../components/RecordForm';
import { RecordFormData } from '../types';

const RecordFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch record if in edit mode
  const { data: record, isLoading: isLoadingRecord } = useQuery(
    ['record', id],
    () => getRecord(Number(id)),
    {
      enabled: isEditMode,
    }
  );

  // Fetch genres
  const { data: genres = [], isLoading: isLoadingGenres } = useQuery(
    'genres',
    getGenres
  );

  // Create record mutation
  const createMutation = useMutation(createRecord, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('records');
      navigate(`/records/${data.id}`);
    },
  });

  // Update record mutation
  const updateMutation = useMutation(
    (data: RecordFormData) => updateRecord(Number(id), data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['record', id]);
        queryClient.invalidateQueries('records');
        navigate(`/records/${data.id}`);
      },
    }
  );

  // Handle form submission
  const handleSubmit = (data: RecordFormData) => {
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingRecord || isLoadingGenres;
  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={isEditMode ? `/records/${id}` : '/'}
          className="inline-flex items-center text-vinyl-blue hover:text-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {isEditMode ? 'Back to Record' : 'Back to Collection'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Record' : 'Add New Record'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vinyl-blue"></div>
          </div>
        ) : (
          <RecordForm
            initialData={record}
            onSubmit={handleSubmit}
            genres={genres}
            isSubmitting={isSubmitting}
          />
        )}

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <p className="text-gray-700 mb-4">
                {isEditMode ? 'Updating record...' : 'Adding record...'}
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vinyl-blue"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordFormPage; 