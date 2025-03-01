import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
    createRecord,
    deleteRecord,
    getGenres,
    getRecord,
    getRecords,
    searchRecords,
    updateRecord
} from '../../api/recordApi';

// Define API base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Mock server setup
const server = setupServer(
  // Mock getRecords endpoint
  rest.get(`${API_BASE_URL}/records/`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          title: 'Test Album',
          artist: 'Test Artist',
          year: 2023,
          cover_image_url: 'http://example.com/cover.jpg',
          genres: [{ id: 1, name: 'Rock' }],
          tracks: [
            { id: 1, title: 'Track 1', duration: 180 }
          ]
        }
      ])
    );
  }),
  
  // Mock getRecord endpoint
  rest.get(`${API_BASE_URL}/records/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          title: 'Test Album',
          artist: 'Test Artist',
          year: 2023,
          cover_image_url: 'http://example.com/cover.jpg',
          genres: [{ id: 1, name: 'Rock' }],
          tracks: [
            { id: 1, title: 'Track 1', duration: 180 }
          ]
        })
      );
    }
    
    return res(ctx.status(404));
  }),
  
  // Mock createRecord endpoint
  rest.post(`${API_BASE_URL}/records/`, async (req, res, ctx) => {
    const body = await req.json();
    
    return res(
      ctx.status(200),
      ctx.json({
        id: 2,
        ...body,
        genres: body.genres.map((name: string, index: number) => ({ id: index + 2, name })),
        tracks: body.tracks.map((track: any, index: number) => ({ id: index + 2, ...track }))
      })
    );
  }),
  
  // Mock updateRecord endpoint
  rest.put(`${API_BASE_URL}/records/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          ...body,
          genres: body.genres.map((name: string, index: number) => ({ id: index + 1, name })),
          tracks: body.tracks.map((track: any, index: number) => ({ id: index + 1, ...track }))
        })
      );
    }
    
    return res(ctx.status(404));
  }),
  
  // Mock deleteRecord endpoint
  rest.delete(`${API_BASE_URL}/records/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '1') {
      return res(
        ctx.status(200),
        ctx.json({ success: true })
      );
    }
    
    return res(ctx.status(404));
  }),
  
  // Mock searchRecords endpoint
  rest.get(`${API_BASE_URL}/records/search`, (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    
    if (query === 'Test') {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: 1,
            title: 'Test Album',
            artist: 'Test Artist',
            year: 2023,
            cover_image_url: 'http://example.com/cover.jpg',
            genres: [{ id: 1, name: 'Rock' }],
            tracks: [
              { id: 1, title: 'Track 1', duration: 180 }
            ]
          }
        ])
      );
    }
    
    return res(ctx.status(200), ctx.json([]));
  }),
  
  // Mock getGenres endpoint
  rest.get(`${API_BASE_URL}/genres/names`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(['Rock', 'Pop', 'Jazz'])
    );
  })
);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close the server after all tests
afterAll(() => server.close());

describe('Record API Client', () => {
  test('getRecords fetches records correctly', async () => {
    const records = await getRecords();
    
    expect(records).toHaveLength(1);
    expect(records[0].title).toBe('Test Album');
    expect(records[0].artist).toBe('Test Artist');
    expect(records[0].genres).toHaveLength(1);
    expect(records[0].genres[0].name).toBe('Rock');
  });
  
  test('getRecord fetches a single record correctly', async () => {
    const record = await getRecord(1);
    
    expect(record.id).toBe(1);
    expect(record.title).toBe('Test Album');
    expect(record.artist).toBe('Test Artist');
    expect(record.genres).toHaveLength(1);
    expect(record.genres[0].name).toBe('Rock');
  });
  
  test('getRecord handles non-existent records', async () => {
    await expect(getRecord(999)).rejects.toThrow();
  });
  
  test('createRecord creates a record correctly', async () => {
    const newRecord = {
      title: 'New Album',
      artist: 'New Artist',
      year: '2024',
      genres: ['Pop'],
      tracks: [
        { title: 'New Track', duration: 200 }
      ]
    };
    
    const createdRecord = await createRecord(newRecord);
    
    expect(createdRecord.id).toBe(2);
    expect(createdRecord.title).toBe('New Album');
    expect(createdRecord.artist).toBe('New Artist');
    expect(createdRecord.genres).toHaveLength(1);
    expect(createdRecord.genres[0].name).toBe('Pop');
    expect(createdRecord.tracks).toHaveLength(1);
    expect(createdRecord.tracks[0].title).toBe('New Track');
  });
  
  test('updateRecord updates a record correctly', async () => {
    const updatedData = {
      title: 'Updated Album',
      artist: 'Updated Artist',
      year: '2025',
      genres: ['Jazz'],
      tracks: [
        { title: 'Updated Track', duration: 300 }
      ]
    };
    
    const updatedRecord = await updateRecord(1, updatedData);
    
    expect(updatedRecord.id).toBe(1);
    expect(updatedRecord.title).toBe('Updated Album');
    expect(updatedRecord.artist).toBe('Updated Artist');
    expect(updatedRecord.genres).toHaveLength(1);
    expect(updatedRecord.genres[0].name).toBe('Jazz');
    expect(updatedRecord.tracks).toHaveLength(1);
    expect(updatedRecord.tracks[0].title).toBe('Updated Track');
  });
  
  test('updateRecord handles non-existent records', async () => {
    const updatedData = {
      title: 'Updated Album',
      artist: 'Updated Artist',
      year: '2025',
      genres: ['Jazz'],
      tracks: []
    };
    
    await expect(updateRecord(999, updatedData)).rejects.toThrow();
  });
  
  test('deleteRecord deletes a record correctly', async () => {
    const result = await deleteRecord(1);
    expect(result).toEqual({ success: true });
  });
  
  test('deleteRecord handles non-existent records', async () => {
    await expect(deleteRecord(999)).rejects.toThrow();
  });
  
  test('searchRecords searches records correctly', async () => {
    const results = await searchRecords('Test');
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Album');
    expect(results[0].artist).toBe('Test Artist');
  });
  
  test('searchRecords returns empty array for no matches', async () => {
    const results = await searchRecords('NonExistent');
    expect(results).toHaveLength(0);
  });
  
  test('getGenres fetches genres correctly', async () => {
    const genres = await getGenres();
    
    expect(genres).toHaveLength(3);
    expect(genres).toContain('Rock');
    expect(genres).toContain('Pop');
    expect(genres).toContain('Jazz');
  });
  
  test('API handles network errors', async () => {
    // Temporarily override the handler to simulate a network error
    server.use(
      rest.get(`${API_BASE_URL}/records/`, (req, res) => {
        return res.networkError('Failed to connect');
      })
    );
    
    await expect(getRecords()).rejects.toThrow();
  });
}); 