from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class TrackBase(BaseModel):
    title: str
    position: Optional[str] = None
    duration: Optional[str] = None


class TrackCreate(TrackBase):
    pass


class Track(TrackBase):
    id: int
    record_id: int

    class Config:
        from_attributes = True


class GenreBase(BaseModel):
    name: str


class GenreCreate(GenreBase):
    pass


class Genre(GenreBase):
    id: int

    class Config:
        from_attributes = True


class RecordBase(BaseModel):
    title: str
    artist: str
    release_date: Optional[date] = None
    label: Optional[str] = None
    catalog_number: Optional[str] = None
    format: Optional[str] = None
    condition: Optional[str] = None
    purchase_date: Optional[date] = None
    purchase_price: Optional[float] = None
    album_art_url: Optional[str] = None
    notes: Optional[str] = None
    discogs_url: Optional[str] = None
    review_url: Optional[str] = None


class RecordCreate(RecordBase):
    genres: Optional[List[str]] = []
    tracks: Optional[List[TrackCreate]] = []


class RecordUpdate(RecordBase):
    title: Optional[str] = None
    artist: Optional[str] = None
    genres: Optional[List[str]] = None
    tracks: Optional[List[TrackCreate]] = None


class Record(RecordBase):
    id: int
    created_at: date
    updated_at: date
    genres: List[Genre] = []
    tracks: List[Track] = []

    class Config:
        from_attributes = True


class RecordSearchResults(BaseModel):
    results: List[Record]
    total: int
