from datetime import datetime

from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# Many-to-many relationship between records and genres
record_genre = Table(
    "record_genre",
    Base.metadata,
    Column("record_id", Integer, ForeignKey("records.id"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id"), primary_key=True),
)


class Record(Base):
    """Model representing a record in the collection."""

    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    artist = Column(String(255), nullable=False)
    release_date = Column(Date, nullable=True)
    label = Column(String(255), nullable=True)
    catalog_number = Column(String(100), nullable=True)
    format = Column(String(50), nullable=True)  # e.g., Vinyl, CD, Cassette
    condition = Column(String(50), nullable=True)  # e.g., Mint, Very Good, Good
    purchase_date = Column(Date, nullable=True)
    purchase_price = Column(Float, nullable=True)
    album_art_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    discogs_url = Column(String(500), nullable=True)
    review_url = Column(String(500), nullable=True)
    created_at = Column(Date, default=datetime.utcnow)
    updated_at = Column(Date, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    genres = relationship("Genre", secondary=record_genre, back_populates="records")
    tracks = relationship(
        "Track", back_populates="record", cascade="all, delete-orphan"
    )


class Genre(Base):
    """Model representing music genres."""

    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # Relationships
    records = relationship("Record", secondary=record_genre, back_populates="genres")


class Track(Base):
    """Model representing tracks on a record."""

    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id"), nullable=False)
    title = Column(String(255), nullable=False)
    position = Column(String(10), nullable=True)  # e.g., A1, B2
    duration = Column(String(10), nullable=True)  # e.g., 3:45

    # Relationships
    record = relationship("Record", back_populates="tracks")
