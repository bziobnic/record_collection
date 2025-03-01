import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { Genre, Record } from '../types';

// Mock data
const mockGenres: Genre[] = [
  { id: 1, name: 'Rock' },
  { id: 2, name: 'Jazz' },
  { id: 3, name: 'Pop' },
];

const mockRecords: Record[] = [
  {
    id: 1,
    title: 'Test Album',
    artist: 'Test Artist',
    release_date: '2023-01-01',
    label: 'Test Label',
    catalog_number: 'TEST-123',
    format: 'Vinyl',
    condition: 'Mint',
    purchase_date: '2023-02-01',
    purchase_price: 19.99,
    album_art_url: 'https://example.com/album.jpg',
    notes: 'Test notes',
    discogs_url: 'https://discogs.com/test',
    review_url: 'https://example.com/review',
    created_at: '2023-02-15',
    updated_at: '2023-02-15',
    genres: [mockGenres[0], mockGenres[2]],
    tracks: [
      { id: 1, record_id: 1, title: 'Track 1', position: 'A1', duration: '3:45' },
      { id: 2, record_id: 1, title: 'Track 2', position: 'A2', duration: '4:20' },
    ],
  },
];

// Set up MSW server to mock API requests
const server = setupServer(
  // Mock GET /api/records/
  rest.get('http://localhost:8000/api/records/', (req, res, ctx) => {
    return res(ctx.json(mockRecords));
  }),

  // Mock GET /api/genres/
  rest.get('http://localhost:8000/api/genres/', (req, res, ctx) => {
    return res(ctx.json(mockGenres));
  }),

  // Mock GET /api/records/:id
  rest.get('http://localhost:8000/api/records/:id', (req, res, ctx) => {
    const { id } = req.params;
    const record = mockRecords.find(r => r.id === Number(id));
    if (record) {
      return res(ctx.json(record));
    }
    return res(ctx.status(404));
  }),

  // Mock POST /api/records/
  rest.post('http://localhost:8000/api/records/', (req, res, ctx) => {
    return res(ctx.json({ ...req.body, id: 2, created_at: '2023-02-15', updated_at: '2023-02-15' }));
  }),

  // Mock PUT /api/records/:id
  rest.put('http://localhost:8000/api/records/:id', (req, res, ctx) => {
    const { id } = req.params;
    const record = mockRecords.find(r => r.id === Number(id));
    if (record) {
      return res(ctx.json({ ...record, ...req.body }));
    }
    return res(ctx.status(404));
  }),

  // Mock DELETE /api/records/:id
  rest.delete('http://localhost:8000/api/records/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),

  // Mock GET /api/records/search
  rest.get('http://localhost:8000/api/records/search', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    const filteredRecords = mockRecords.filter(
      r => r.title.includes(query || '') || r.artist.includes(query || '')
    );
    return res(ctx.json({ results: filteredRecords, total: filteredRecords.length }));
  }),

  // Mock GET /api/fetch-album-info
  rest.get('http://localhost:8000/api/fetch-album-info', (req, res, ctx) => {
    return res(
      ctx.json({
        album_art_url: 'https://example.com/album.jpg',
        discogs_url: 'https://discogs.com/test',
        review_url: 'https://example.com/review',
      })
    );
  })
);

// Set up and tear down the server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Create a wrapper component with the necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  test('renders the app and displays the homepage', async () => {
    render(<App />, { wrapper: createWrapper() });
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Record Collection')).toBeInTheDocument();
    });
    
    // Check if the "Add New Record" button is present
    expect(screen.getByText('Add New Record')).toBeInTheDocument();
    
    // Check if the record is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });
});

describe('Record List Component', () => {
  test('displays records and allows navigation to detail view', async () => {
    render(<App />, { wrapper: createWrapper() });
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
    
    // Click on a record to navigate to the detail view
    fireEvent.click(screen.getByText('Test Album'));
    
    // Check if the detail view is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('TEST-123')).toBeInTheDocument();
      expect(screen.getByText('Track 1')).toBeInTheDocument();
      expect(screen.getByText('Track 2')).toBeInTheDocument();
    });
  });
});

describe('Record Form Component', () => {
  test('allows creating a new record', async () => {
    render(<App />, { wrapper: createWrapper() });
    
    // Navigate to the new record form
    await waitFor(() => {
      expect(screen.getByText('Add New Record')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Add New Record'));
    
    // Check if the form is displayed
    await waitFor(() => {
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Artist *')).toBeInTheDocument();
      expect(screen.getByLabelText('Genres *')).toBeInTheDocument();
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'New Test Album' },
    });
    
    fireEvent.change(screen.getByLabelText('Artist *'), {
      target: { value: 'New Test Artist' },
    });
    
    // Select genres (this is a bit tricky with a multi-select)
    const genreSelect = screen.getByLabelText('Genres *');
    fireEvent.change(genreSelect, {
      target: { value: 'Rock' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Record'));
    
    // Check if we're redirected back to the home page
    await waitFor(() => {
      expect(screen.getByText('Record Collection')).toBeInTheDocument();
    });
  });
});

describe('Record Detail Component', () => {
  test('displays record details and allows editing', async () => {
    render(<App />, { wrapper: createWrapper() });
    
    // Wait for the data to load and navigate to a record
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Album'));
    
    // Check if the detail view is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
    
    // Click the edit button
    fireEvent.click(screen.getByText('Edit'));
    
    // Check if the edit form is displayed
    await waitFor(() => {
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Album')).toBeInTheDocument();
    });
    
    // Edit the title
    fireEvent.change(screen.getByLabelText('Title *'), {
      target: { value: 'Updated Test Album' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Record'));
    
    // Check if we're redirected back to the detail view
    await waitFor(() => {
      expect(screen.getByText('Updated Test Album')).toBeInTheDocument();
    });
  });
  
  test('allows deleting a record', async () => {
    render(<App />, { wrapper: createWrapper() });
    
    // Wait for the data to load and navigate to a record
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Album'));
    
    // Check if the detail view is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
    
    // Click the delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirm the deletion
    fireEvent.click(screen.getByText('Yes, delete it'));
    
    // Check if we're redirected back to the home page
    await waitFor(() => {
      expect(screen.getByText('Record Collection')).toBeInTheDocument();
    });
  });
}); 