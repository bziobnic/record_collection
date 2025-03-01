import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RecordForm from '../../components/RecordForm';

// Mock the API calls
jest.mock('../../api/recordApi', () => ({
  getGenres: jest.fn().mockResolvedValue(['Rock', 'Pop', 'Jazz']),
}));

describe('RecordForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockIsSubmitting = false;
  
  const renderComponent = (initialData = {}) => {
    return render(
      <BrowserRouter>
        <RecordForm 
          onSubmit={mockOnSubmit} 
          initialData={initialData} 
          isSubmitting={mockIsSubmitting}
        />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form with empty fields', async () => {
    renderComponent();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
    
    // Wait for genres to load
    await waitFor(() => {
      expect(screen.getByText(/genres/i)).toBeInTheDocument();
    });
  });

  test('submits the form with valid data', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Album');
    await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
    await user.type(screen.getByLabelText(/year/i), '2023');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if onSubmit was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Album',
      artist: 'Test Artist',
      year: '2023',
    }));
  });

  test('displays validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/artist is required/i)).toBeInTheDocument();
    });
    
    // Ensure onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('loads initial data correctly', async () => {
    const initialData = {
      title: 'Existing Album',
      artist: 'Existing Artist',
      year: '2020',
      genres: ['Rock'],
    };
    
    renderComponent(initialData);
    
    // Check if form is populated with initial data
    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Album');
    expect(screen.getByLabelText(/artist/i)).toHaveValue('Existing Artist');
    expect(screen.getByLabelText(/year/i)).toHaveValue('2020');
    
    // Wait for genres to load
    await waitFor(() => {
      expect(screen.getByText(/genres/i)).toBeInTheDocument();
    });
  });
}); 