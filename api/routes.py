import os
import sys
from typing import List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api import crud, schemas, services
from database.database import get_db
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/records/", response_model=List[schemas.Record])
async def read_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all records with pagination."""
    records = crud.get_records(db, skip=skip, limit=limit)
    return records


@router.get("/records/search", response_model=schemas.RecordSearchResults)
async def search_records(
    q: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Search records by title, artist, or genre."""
    results = crud.search_records(db, query=q, skip=skip, limit=limit)
    return results


@router.get("/records/{record_id}", response_model=schemas.Record)
async def read_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific record by ID."""
    db_record = crud.get_record(db, record_id=record_id)
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_record


@router.post("/records/", response_model=schemas.Record)
async def create_record(record: schemas.RecordCreate, db: Session = Depends(get_db)):
    """Create a new record."""
    # Try to get album art and review links if not provided
    if not record.album_art_url or not record.discogs_url or not record.review_url:
        album_art_url, discogs_url = await services.get_album_info(
            record.artist, record.title
        )
        review_url = await services.get_lastfm_review(record.artist, record.title)

        if not record.album_art_url and album_art_url:
            record.album_art_url = album_art_url

        if not record.discogs_url and discogs_url:
            record.discogs_url = discogs_url

        if not record.review_url and review_url:
            record.review_url = review_url

    return crud.create_record(db=db, record=record)


@router.put("/records/{record_id}", response_model=schemas.Record)
async def update_record(
    record_id: int, record: schemas.RecordUpdate, db: Session = Depends(get_db)
):
    """Update an existing record."""
    db_record = crud.update_record(db, record_id=record_id, record_update=record)
    if db_record is None:
        raise HTTPException(status_code=404, detail="Record not found")
    return db_record


@router.delete("/records/{record_id}", response_model=bool)
async def delete_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a record."""
    success = crud.delete_record(db, record_id=record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return success


@router.get("/genres/", response_model=List[schemas.Genre])
async def read_genres(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all genres."""
    genres = crud.get_genres(db, skip=skip, limit=limit)
    return genres


@router.get("/fetch-album-info")
async def fetch_album_info(artist: str, title: str):
    """Fetch album art, Discogs URL, and Last.fm review URL."""
    album_art_url, discogs_url = await services.get_album_info(artist, title)
    review_url = await services.get_lastfm_review(artist, title)

    return {
        "album_art_url": album_art_url,
        "discogs_url": discogs_url,
        "review_url": review_url,
    }
