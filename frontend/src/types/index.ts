export interface Genre {
  id: number;
  name: string;
}

export interface Track {
  id: number;
  record_id: number;
  title: string;
  position?: string;
  duration?: string;
}

export interface Record {
  id: number;
  title: string;
  artist: string;
  release_date?: string;
  label?: string;
  catalog_number?: string;
  format?: string;
  condition?: string;
  purchase_date?: string;
  purchase_price?: number;
  album_art_url?: string;
  notes?: string;
  discogs_url?: string;
  review_url?: string;
  created_at: string;
  updated_at: string;
  genres: Genre[];
  tracks: Track[];
}

export interface RecordFormData {
  title: string;
  artist: string;
  release_date?: string;
  label?: string;
  catalog_number?: string;
  format?: string;
  condition?: string;
  purchase_date?: string;
  purchase_price?: number;
  album_art_url?: string;
  notes?: string;
  discogs_url?: string;
  review_url?: string;
  genres: string[];
  tracks: Omit<Track, 'id' | 'record_id'>[];
}

export interface SearchResults {
  results: Record[];
  total: number;
}

export interface AlbumInfo {
  album_art_url?: string;
  discogs_url?: string;
  review_url?: string;
} 