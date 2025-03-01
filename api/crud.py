import os
import sys
from datetime import date
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api import schemas
from database.models import Genre, Record, Track
from sqlalchemy import or_
from sqlalchemy.orm import Session


def get_record(db: Session, record_id: int) -> Optional[Record]:
    """Get a single record by ID."""
    return db.query(Record).filter(Record.id == record_id).first()


def get_records(db: Session, skip: int = 0, limit: int = 100) -> List[Record]:
    """Get a list of records with pagination."""
    return db.query(Record).offset(skip).limit(limit).all()


def search_records(
    db: Session, query: str, skip: int = 0, limit: int = 100
) -> Dict[str, Any]:
    """Search records by title, artist, or genre."""
    search = f"%{query}%"

    # Query for records matching the search term
    records_query = db.query(Record).filter(
        or_(
            Record.title.ilike(search),
            Record.artist.ilike(search),
            Record.label.ilike(search),
            Record.catalog_number.ilike(search),
            # Join with genres to search by genre name
            Record.genres.any(Genre.name.ilike(search)),
        )
    )

    # Get total count
    total = records_query.count()

    # Apply pagination
    records = records_query.offset(skip).limit(limit).all()

    return {"results": records, "total": total}


def create_record(db: Session, record: schemas.RecordCreate) -> Record:
    """Create a new record."""
    # Handle genres
    db_genres = []
    if record.genres:
        for genre_name in record.genres:
            # Check if genre exists, create if not
            genre = db.query(Genre).filter(Genre.name == genre_name).first()
            if not genre:
                genre = Genre(name=genre_name)
                db.add(genre)
                db.flush()  # Flush to get the ID
            db_genres.append(genre)

    # Create record without tracks first
    db_record = Record(
        title=record.title,
        artist=record.artist,
        release_date=record.release_date,
        label=record.label,
        catalog_number=record.catalog_number,
        format=record.format,
        condition=record.condition,
        purchase_date=record.purchase_date,
        purchase_price=record.purchase_price,
        album_art_url=record.album_art_url,
        notes=record.notes,
        discogs_url=record.discogs_url,
        review_url=record.review_url,
        genres=db_genres,
    )
    db.add(db_record)
    db.flush()  # Flush to get the ID

    # Add tracks if provided
    if record.tracks:
        for track_data in record.tracks:
            track = Track(
                record_id=db_record.id,
                title=track_data.title,
                position=track_data.position,
                duration=track_data.duration,
            )
            db.add(track)

    db.commit()
    db.refresh(db_record)
    return db_record


def update_record(
    db: Session, record_id: int, record_update: schemas.RecordUpdate
) -> Optional[Record]:
    """Update an existing record."""
    db_record = get_record(db, record_id)
    if not db_record:
        return None

    # Update record fields
    update_data = record_update.dict(exclude_unset=True)

    # Handle genres separately
    if "genres" in update_data:
        genres = update_data.pop("genres", [])
        db_record.genres = []
        for genre_name in genres:
            genre = db.query(Genre).filter(Genre.name == genre_name).first()
            if not genre:
                genre = Genre(name=genre_name)
                db.add(genre)
                db.flush()
            db_record.genres.append(genre)

    # Handle tracks separately
    if "tracks" in update_data:
        tracks_data = update_data.pop("tracks", [])
        # Remove existing tracks
        db.query(Track).filter(Track.record_id == record_id).delete()
        # Add new tracks
        for track_data in tracks_data:
            track = Track(
                record_id=record_id,
                title=track_data.title,
                position=track_data.position,
                duration=track_data.duration,
            )
            db.add(track)

    # Update other fields
    for key, value in update_data.items():
        setattr(db_record, key, value)

    # Update the updated_at timestamp
    db_record.updated_at = date.today()

    db.commit()
    db.refresh(db_record)
    return db_record


def delete_record(db: Session, record_id: int) -> bool:
    """Delete a record."""
    db_record = get_record(db, record_id)
    if not db_record:
        return False

    db.delete(db_record)
    db.commit()
    return True


def get_genres(db: Session, skip: int = 0, limit: int = 100) -> List[Genre]:
    """Get a list of all genres."""
    return db.query(Genre).offset(skip).limit(limit).all()


def get_genre_by_name(db: Session, name: str) -> Optional[Genre]:
    """Get a genre by name."""
    return db.query(Genre).filter(Genre.name == name).first()
