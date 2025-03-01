import React from 'react';
import { Link } from 'react-router-dom';
import defaultAlbumArt from '../assets/default-album.png';
import { Record } from '../types';

interface RecordCardProps {
  record: Record;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative pb-[100%]">
        <img
          src={record.album_art_url || defaultAlbumArt}
          alt={`${record.title} by ${record.artist}`}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultAlbumArt;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{record.title}</h3>
        <p className="text-gray-600 truncate">{record.artist}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {record.genres.slice(0, 3).map((genre) => (
            <span
              key={genre.id}
              className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700"
            >
              {genre.name}
            </span>
          ))}
          {record.genres.length > 3 && (
            <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
              +{record.genres.length - 3}
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-between">
          <Link
            to={`/records/${record.id}`}
            className="text-vinyl-blue hover:text-blue-700 font-medium"
          >
            View Details
          </Link>
          {record.format && (
            <span className="text-gray-500 text-sm">{record.format}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordCard; 