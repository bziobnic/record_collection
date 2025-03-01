import React, { useEffect, useState } from 'react';
import defaultAlbumArt from '../assets/default-album.svg';
import { Record, RecordFormData } from '../types';

interface RecordFormProps {
  initialData?: Record;
  genres: string[];
  onSubmit: (data: RecordFormData) => void;
  isSubmitting: boolean;
}

const RecordForm: React.FC<RecordFormProps> = ({
  initialData,
  genres,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<RecordFormData>({
    title: '',
    artist: '',
    release_date: '',
    label: '',
    catalog_number: '',
    format: '',
    condition: '',
    purchase_date: '',
    purchase_price: undefined,
    album_art_url: '',
    notes: '',
    discogs_url: '',
    review_url: '',
    genres: [],
    tracks: []
  });

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        artist: initialData.artist,
        release_date: initialData.release_date || '',
        label: initialData.label || '',
        catalog_number: initialData.catalog_number || '',
        format: initialData.format || '',
        condition: initialData.condition || '',
        purchase_date: initialData.purchase_date || '',
        purchase_price: initialData.purchase_price,
        album_art_url: initialData.album_art_url || '',
        notes: initialData.notes || '',
        discogs_url: initialData.discogs_url || '',
        review_url: initialData.review_url || '',
        genres: initialData.genres.map(g => g.name),
        tracks: initialData.tracks.map(t => ({
          title: t.title,
          position: t.position || '',
          duration: t.duration || ''
        }))
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'purchase_price') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      genres: selectedOptions
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log form data for debugging
    console.log('Submitting form data:', formData);
    
    // Validate required fields
    if (!formData.title.trim()) {
      console.error('Title is required');
      return;
    }
    
    if (!formData.artist.trim()) {
      console.error('Artist is required');
      return;
    }
    
    if (!formData.genres.length) {
      console.error('At least one genre is required');
      return;
    }
    
    // Create a clean copy of the data
    const cleanData = {
      ...formData,
      // Convert empty strings to null for optional fields
      release_date: formData.release_date || null,
      label: formData.label || null,
      catalog_number: formData.catalog_number || null,
      format: formData.format || null,
      condition: formData.condition || null,
      purchase_date: formData.purchase_date || null,
      album_art_url: formData.album_art_url || null,
      notes: formData.notes || null,
      discogs_url: formData.discogs_url || null,
      review_url: formData.review_url || null,
    };
    
    console.log('Submitting cleaned data:', cleanData);
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700">
              Artist *
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              required
              value={formData.artist}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="release_date" className="block text-sm font-medium text-gray-700">
              Release Date
            </label>
            <input
              type="date"
              id="release_date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-gray-700">
              Genres *
            </label>
            <select
              id="genres"
              name="genres"
              required
              multiple
              value={formData.genres}
              onChange={handleGenreChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              style={{ height: '100px' }}
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple genres</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="album_art_url" className="block text-sm font-medium text-gray-700">
              Album Art URL
            </label>
            <input
              type="url"
              id="album_art_url"
              name="album_art_url"
              value={formData.album_art_url}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/album-cover.jpg"
            />
            <div className="mt-2">
              <img
                src={formData.album_art_url || defaultAlbumArt}
                alt="Album cover preview"
                className="h-40 w-40 object-cover rounded-md border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any notes about this record..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Add Record'}
        </button>
      </div>
    </form>
  );
};

export default RecordForm; 