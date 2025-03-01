import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Record } from '../api/recordApi';
import defaultAlbumArt from '../assets/default-album.svg';

interface RecordListProps {
  records: Record[];
  genres: { [id: number]: string };
}

const RecordList: React.FC<RecordListProps> = ({ records, genres }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'year'>('artist');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter and sort records
  const filteredRecords = records
    .filter(record => {
      // Apply search filter
      const matchesSearch = searchTerm === '' || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.artist.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply genre filter
      const matchesGenre = filterGenre === null || record.genre_id === filterGenre;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'artist') {
        comparison = a.artist.localeCompare(b.artist);
      } else if (sortBy === 'year') {
        comparison = a.year - b.year;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Get unique genre IDs from records
  const uniqueGenreIds = Array.from(new Set(records.map(record => record.genre_id)));

  // Toggle sort direction or change sort field
  const handleSortChange = (field: 'title' | 'artist' | 'year') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full md:w-1/2">
            <label htmlFor="search" className="sr-only">Search records</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by title or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="genre-filter" className="sr-only">Filter by genre</label>
            <select
              id="genre-filter"
              value={filterGenre === null ? '' : filterGenre}
              onChange={(e) => setFilterGenre(e.target.value ? Number(e.target.value) : null)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Genres</option>
              {uniqueGenreIds.map(genreId => (
                <option key={genreId} value={genreId}>
                  {genres[genreId]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Records count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredRecords.length}</span> of{' '}
          <span className="font-medium">{records.length}</span> records
        </p>
        
        {/* Sort controls */}
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-700">Sort by:</span>
          <button
            onClick={() => handleSortChange('artist')}
            className={`${sortBy === 'artist' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Artist {sortBy === 'artist' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('title')}
            className={`${sortBy === 'title' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('year')}
            className={`${sortBy === 'year' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Year {sortBy === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Records grid */}
      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRecords.map(record => (
            <Link
              key={record.id}
              to={`/records/${record.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={record.cover_image || defaultAlbumArt}
                  alt={`${record.title} by ${record.artist}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAlbumArt;
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{record.title}</h3>
                <p className="text-gray-600 truncate">{record.artist}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{record.year}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {genres[record.genre_id]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No records found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default RecordList; 