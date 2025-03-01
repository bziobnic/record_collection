import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as recordApi from '../../api/recordApi';
import HomePage from '../../pages/HomePage';

// Mock the API calls
jest.mock('../../api/recordApi', () => ({
  getRecords: jest.fn(),
  deleteRecord: jest.fn(),
  searchRecords: jest.fn(),
}));

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the getRecords API call to return sample data
    const mockGetRecords = recordApi.getRecords as jest.Mock;
    mockGetRecords.mockResolvedValue([
      {
        id: 1,
        title: 'Test Album 1',
        artist: 'Test Artist 1',
        year: 2021,
        cover_image_url: 'http://example.com/cover1.jpg',
        genres: [{ id: 1, name: 'Rock' }],
        tracks: [
          { id: 1, title: 'Track 1', duration: 180 },
          { id: 2, title: 'Track 2', duration: 240 }
        ]
      },
      {
        id: 2,
        title: 'Test Album 2',
        artist: 'Test Artist 2',
        year: 2022,
        cover_image_url: 'http://example.com/cover2.jpg',
        genres: [{ id: 2, name: 'Pop' }],
        tracks: [
          { id: 3, title: 'Track 3', duration: 200 },
          { id: 4, title: 'Track 4', duration: 220 }
        ]
      }
    ]);
  });
  
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
  };
  
  test('renders the home page with records', async () => {
    renderComponent();
    
    // Check if the page title is correct
    expect(screen.getByText(/record collection/i)).toBeInTheDocument();
    
    // Check if the Add Record button is rendered
    expect(screen.getByText(/add record/i)).toBeInTheDocument();
    
    // Check if records are rendered
    await waitFor(() => {
      expect(screen.getByText(/test album 1/i)).toBeInTheDocument();
      expect(screen.getByText(/test artist 1/i)).toBeInTheDocument();
      expect(screen.getByText(/test album 2/i)).toBeInTheDocument();
      expect(screen.getByText(/test artist 2/i)).toBeInTheDocument();
    });
  });
  
  test('handles record deletion', async () => {
    const mockDeleteRecord = recordApi.deleteRecord as jest.Mock;
    mockDeleteRecord.mockResolvedValue({});
    
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText(/test album 1/i)).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first record
    const deleteButtons = await screen.findAllByText(/delete/i);
    await user.click(deleteButtons[0]);
    
    // Confirm deletion in the dialog
    await user.click(screen.getByText(/confirm/i));
    
    // Check if deleteRecord was called with the correct ID
    expect(mockDeleteRecord).toHaveBeenCalledWith(1);
    
    // Check if getRecords was called again to refresh the list
    expect(recordApi.getRecords).toHaveBeenCalledTimes(2);
  });
  
  test('handles search functionality', async () => {
    const mockSearchRecords = recordApi.searchRecords as jest.Mock;
    mockSearchRecords.mockResolvedValue([
      {
        id: 1,
        title: 'Test Album 1',
        artist: 'Test Artist 1',
        year: 2021,
        cover_image_url: 'http://example.com/cover1.jpg',
        genres: [{ id: 1, name: 'Rock' }],
        tracks: [
          { id: 1, title: 'Track 1', duration: 180 },
          { id: 2, title: 'Track 2', duration: 240 }
        ]
      }
    ]);
    
    const user = userEvent.setup();
    renderComponent();
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText(/test album 1/i)).toBeInTheDocument();
    });
    
    // Find and type in the search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Test Album 1');
    
    // Trigger search (either by pressing Enter or after debounce)
    await user.keyboard('{Enter}');
    
    // Check if searchRecords was called with the correct query
    await waitFor(() => {
      expect(mockSearchRecords).toHaveBeenCalledWith('Test Album 1');
    });
    
    // Check if only the matching record is displayed
    await waitFor(() => {
      expect(screen.getByText(/test album 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/test album 2/i)).not.toBeInTheDocument();
    });
  });
  
  test('displays loading state', async () => {
    // Delay the API response to show loading state
    const mockGetRecords = recordApi.getRecords as jest.Mock;
    mockGetRecords.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Test Album 1',
            artist: 'Test Artist 1',
            year: 2021,
            cover_image_url: 'http://example.com/cover1.jpg',
            genres: [{ id: 1, name: 'Rock' }],
            tracks: []
          }
        ]);
      }, 100);
    }));
    
    renderComponent();
    
    // Check if loading state is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for records to load
    await waitFor(() => {
      expect(screen.getByText(/test album 1/i)).toBeInTheDocument();
    });
    
    // Check if loading state is no longer displayed
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  
  test('displays error state', async () => {
    // Make the API call fail
    const mockGetRecords = recordApi.getRecords as jest.Mock;
    mockGetRecords.mockRejectedValue(new Error('Failed to fetch records'));
    
    renderComponent();
    
    // Check if error state is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading records/i)).toBeInTheDocument();
    });
  });
});