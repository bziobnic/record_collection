"""
Tests for the database models.
"""

import unittest

from api.database import Base
from api.models import Genre, Record, Track
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class TestModels(unittest.TestCase):
    """Test cases for the database models."""

    def setUp(self):
        """Set up the test database before each test."""
        # Create the tables
        Base.metadata.create_all(bind=engine)

        # Create a session
        self.db = TestingSessionLocal()

    def tearDown(self):
        """Clean up after each test."""
        # Drop all tables
        Base.metadata.drop_all(bind=engine)

        # Close the session
        self.db.close()

    def test_genre_model(self):
        """Test the Genre model."""
        # Create a genre
        genre = Genre(name="Rock")
        self.db.add(genre)
        self.db.commit()

        # Query the genre
        db_genre = self.db.query(Genre).filter(Genre.name == "Rock").first()

        # Check the genre
        self.assertIsNotNone(db_genre)
        self.assertEqual(db_genre.name, "Rock")
        self.assertIsNotNone(db_genre.id)

    def test_record_model(self):
        """Test the Record model."""
        # Create a record
        record = Record(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            cover_image_url="http://example.com/cover.jpg",
        )
        self.db.add(record)
        self.db.commit()

        # Query the record
        db_record = self.db.query(Record).filter(Record.title == "Test Album").first()

        # Check the record
        self.assertIsNotNone(db_record)
        self.assertEqual(db_record.title, "Test Album")
        self.assertEqual(db_record.artist, "Test Artist")
        self.assertEqual(db_record.year, 2023)
        self.assertEqual(db_record.cover_image_url, "http://example.com/cover.jpg")
        self.assertIsNotNone(db_record.id)

    def test_track_model(self):
        """Test the Track model."""
        # Create a record
        record = Record(title="Test Album", artist="Test Artist", year=2023)
        self.db.add(record)
        self.db.commit()

        # Create a track
        track = Track(title="Test Track", duration=180, record_id=record.id)
        self.db.add(track)
        self.db.commit()

        # Query the track
        db_track = self.db.query(Track).filter(Track.title == "Test Track").first()

        # Check the track
        self.assertIsNotNone(db_track)
        self.assertEqual(db_track.title, "Test Track")
        self.assertEqual(db_track.duration, 180)
        self.assertEqual(db_track.record_id, record.id)
        self.assertIsNotNone(db_track.id)

    def test_record_track_relationship(self):
        """Test the relationship between Record and Track."""
        # Create a record
        record = Record(title="Test Album", artist="Test Artist", year=2023)
        self.db.add(record)
        self.db.commit()

        # Create tracks
        track1 = Track(title="Track 1", duration=180, record=record)
        track2 = Track(title="Track 2", duration=240, record=record)
        self.db.add_all([track1, track2])
        self.db.commit()

        # Query the record with tracks
        db_record = self.db.query(Record).filter(Record.title == "Test Album").first()

        # Check the relationship
        self.assertEqual(len(db_record.tracks), 2)
        self.assertEqual(db_record.tracks[0].title, "Track 1")
        self.assertEqual(db_record.tracks[1].title, "Track 2")

        # Check the relationship from track to record
        db_track = self.db.query(Track).filter(Track.title == "Track 1").first()
        self.assertEqual(db_track.record.title, "Test Album")

    def test_record_genre_relationship(self):
        """Test the relationship between Record and Genre."""
        # Create genres
        rock = Genre(name="Rock")
        pop = Genre(name="Pop")
        self.db.add_all([rock, pop])
        self.db.commit()

        # Create a record with genres
        record = Record(title="Test Album", artist="Test Artist", year=2023)
        record.genres = [rock, pop]
        self.db.add(record)
        self.db.commit()

        # Query the record with genres
        db_record = self.db.query(Record).filter(Record.title == "Test Album").first()

        # Check the relationship
        self.assertEqual(len(db_record.genres), 2)
        genre_names = [genre.name for genre in db_record.genres]
        self.assertIn("Rock", genre_names)
        self.assertIn("Pop", genre_names)

        # Check the relationship from genre to records
        db_genre = self.db.query(Genre).filter(Genre.name == "Rock").first()
        self.assertEqual(len(db_genre.records), 1)
        self.assertEqual(db_genre.records[0].title, "Test Album")

    def test_cascade_delete(self):
        """Test that deleting a record cascades to its tracks."""
        # Create a record
        record = Record(title="Test Album", artist="Test Artist", year=2023)
        self.db.add(record)
        self.db.commit()

        # Create tracks
        track1 = Track(title="Track 1", duration=180, record=record)
        track2 = Track(title="Track 2", duration=240, record=record)
        self.db.add_all([track1, track2])
        self.db.commit()

        # Delete the record
        self.db.delete(record)
        self.db.commit()

        # Check that the tracks were deleted
        tracks = self.db.query(Track).all()
        self.assertEqual(len(tracks), 0)

        # Check that the record was deleted
        records = self.db.query(Record).all()
        self.assertEqual(len(records), 0)

    def test_genre_not_cascade_delete(self):
        """Test that deleting a genre does not cascade to its records."""
        # Create a genre
        genre = Genre(name="Rock")
        self.db.add(genre)
        self.db.commit()

        # Create a record with the genre
        record = Record(title="Test Album", artist="Test Artist", year=2023)
        record.genres = [genre]
        self.db.add(record)
        self.db.commit()

        # Delete the genre
        self.db.delete(genre)
        self.db.commit()

        # Check that the record still exists
        records = self.db.query(Record).all()
        self.assertEqual(len(records), 1)

        # Check that the genre was deleted
        genres = self.db.query(Genre).all()
        self.assertEqual(len(genres), 0)

        # Check that the record no longer has the genre
        db_record = self.db.query(Record).first()
        self.assertEqual(len(db_record.genres), 0)
