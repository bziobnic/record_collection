import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as recordApi from '../../api/recordApi';
import RecordFormPage from '../../pages/RecordFormPage';

// Mock the API calls
jest.mock('../../api/recordApi', () => ({
  getGenres: jest.fn().mockResolvedValue(['Rock', 'Pop', 'Jazz']),
  getRecord: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('RecordFormPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderComponent = (path = '/records/new') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/records/new" element={<RecordFormPage />} />
          <Route path="/records/:id/edit" element={<RecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );
  };
  
  test('renders the create record form', async () => {
    renderComponent();
    
    // Check if the page title is correct
    expect(screen.getByText(/add new record/i)).toBeInTheDocument();
    
    // Check if form elements are rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
      expect(screen.getByText(/genres/i)).toBeInTheDocument();
    });
  });
  
  test('submits the create record form', async () => {
    const mockCreateRecord = recordApi.createRecord as jest.Mock;
    mockCreateRecord.mockResolvedValue({ id: 1, title: 'Test Album' });
    
    const user = userEvent.setup();
    renderComponent();
    
    // Fill out the form
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/title/i), 'Test Album');
    await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
    await user.type(screen.getByLabelText(/year/i), '2023');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if createRecord was called with the correct data
    await waitFor(() => {
      expect(mockCreateRecord).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist',
        year: '2023',
      }));
    });
  });
  
  test('renders the edit record form', async () => {
    const mockGetRecord = recordApi.getRecord as jest.Mock;
    mockGetRecord.mockResolvedValue({
      id: 1,
      title: 'Existing Album',
      artist: 'Existing Artist',
      year: 2020,
      genres: [{ id: 1, name: 'Rock' }],
      tracks: [
        { id: 1, title: 'Track 1', duration: 180 },
        { id: 2, title: 'Track 2', duration: 240 }
      ]
    });
    
    renderComponent('/records/1/edit');
    
    // Check if the page title is correct
    await waitFor(() => {
      expect(screen.getByText(/edit record/i)).toBeInTheDocument();
    });
    
    // Check if form is populated with initial data
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Album');
      expect(screen.getByLabelText(/artist/i)).toHaveValue('Existing Artist');
      expect(screen.getByLabelText(/year/i)).toHaveValue('2020');
    });
  });
  
  test('submits the edit record form', async () => {
    const mockGetRecord = recordApi.getRecord as jest.Mock;
    mockGetRecord.mockResolvedValue({
      id: 1,
      title: 'Existing Album',
      artist: 'Existing Artist',
      year: 2020,
      genres: [{ id: 1, name: 'Rock' }],
      tracks: [
        { id: 1, title: 'Track 1', duration: 180 },
        { id: 2, title: 'Track 2', duration: 240 }
      ]
    });
    
    const mockUpdateRecord = recordApi.updateRecord as jest.Mock;
    mockUpdateRecord.mockResolvedValue({ id: 1, title: 'Updated Album' });
    
    const user = userEvent.setup();
    renderComponent('/records/1/edit');
    
    // Wait for the form to be populated
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Album');
    });
    
    // Update the form
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Updated Album');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if updateRecord was called with the correct data
    await waitFor(() => {
      expect(mockUpdateRecord).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Album',
        artist: 'Existing Artist',
        year: '2020',
      }));
    });
  });
  
  test('handles API errors during form submission', async () => {
    const mockCreateRecord = recordApi.createRecord as jest.Mock;
    mockCreateRecord.mockRejectedValue(new Error('API Error'));
    
    const user = userEvent.setup();
    renderComponent();
    
    // Fill out the form
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
    
    await user.type(screen.getByLabelText(/title/i), 'Test Album');
    await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
    await user.type(screen.getByLabelText(/year/i), '2023');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error saving record/i)).toBeInTheDocument();
    });
  });
}); 