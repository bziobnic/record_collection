"""
Tests for the CRUD operations.
"""

import unittest

from api.crud import (
    create_genre,
    create_record,
    delete_record,
    get_genre_by_name,
    get_genres,
    get_record,
    get_records,
    search_records,
    update_record,
)
from api.database import Base
from api.models import Genre
from api.schemas import RecordCreate, RecordUpdate, TrackCreate
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


class TestCRUD(unittest.TestCase):
    """Test cases for the CRUD operations."""

    def setUp(self):
        """Set up the test database before each test."""
        # Create the tables
        Base.metadata.create_all(bind=engine)

        # Create a session
        self.db = TestingSessionLocal()

        # Create test genres
        rock = Genre(name="Rock")
        pop = Genre(name="Pop")
        jazz = Genre(name="Jazz")
        self.db.add_all([rock, pop, jazz])
        self.db.commit()

    def tearDown(self):
        """Clean up after each test."""
        # Drop all tables
        Base.metadata.drop_all(bind=engine)

        # Close the session
        self.db.close()

    def test_get_genre_by_name(self):
        """Test getting a genre by name."""
        # Get an existing genre
        genre = get_genre_by_name(self.db, "Rock")
        self.assertIsNotNone(genre)
        self.assertEqual(genre.name, "Rock")

        # Get a non-existent genre
        genre = get_genre_by_name(self.db, "Metal")
        self.assertIsNone(genre)

    def test_get_genres(self):
        """Test getting all genres."""
        genres = get_genres(self.db)
        self.assertEqual(len(genres), 3)

        # Check that all expected genres are present
        genre_names = [genre.name for genre in genres]
        self.assertIn("Rock", genre_names)
        self.assertIn("Pop", genre_names)
        self.assertIn("Jazz", genre_names)

    def test_create_genre(self):
        """Test creating a genre."""
        # Create a new genre
        genre = create_genre(self.db, "Metal")
        self.assertIsNotNone(genre)
        self.assertEqual(genre.name, "Metal")

        # Verify the genre was added to the database
        db_genre = self.db.query(Genre).filter(Genre.name == "Metal").first()
        self.assertIsNotNone(db_genre)

        # Create a genre that already exists
        genre = create_genre(self.db, "Rock")
        self.assertIsNotNone(genre)
        self.assertEqual(genre.name, "Rock")

        # Verify no duplicate was added
        genres = self.db.query(Genre).filter(Genre.name == "Rock").all()
        self.assertEqual(len(genres), 1)

    def test_create_record(self):
        """Test creating a record."""
        # Create a record with minimal fields
        record_data = RecordCreate(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=["Rock"],
            tracks=[],
        )

        record = create_record(self.db, record_data)
        self.assertIsNotNone(record)
        self.assertEqual(record.title, "Test Album")
        self.assertEqual(record.artist, "Test Artist")
        self.assertEqual(record.year, 2023)
        self.assertEqual(len(record.genres), 1)
        self.assertEqual(record.genres[0].name, "Rock")
        self.assertEqual(len(record.tracks), 0)

        # Create a record with all fields
        record_data = RecordCreate(
            title="Complete Album",
            artist="Complete Artist",
            year=2024,
            genres=["Rock", "Pop"],
            tracks=[
                TrackCreate(title="Track 1", duration=180),
                TrackCreate(title="Track 2", duration=240),
            ],
            cover_image_url="http://example.com/cover.jpg",
            review_url="http://example.com/review",
        )

        record = create_record(self.db, record_data)
        self.assertIsNotNone(record)
        self.assertEqual(record.title, "Complete Album")
        self.assertEqual(record.artist, "Complete Artist")
        self.assertEqual(record.year, 2024)
        self.assertEqual(len(record.genres), 2)
        genre_names = [genre.name for genre in record.genres]
        self.assertIn("Rock", genre_names)
        self.assertIn("Pop", genre_names)
        self.assertEqual(len(record.tracks), 2)
        self.assertEqual(record.tracks[0].title, "Track 1")
        self.assertEqual(record.tracks[1].title, "Track 2")
        self.assertEqual(record.cover_image_url, "http://example.com/cover.jpg")
        self.assertEqual(record.review_url, "http://example.com/review")

        # Create a record with a new genre
        record_data = RecordCreate(
            title="New Genre Album",
            artist="New Genre Artist",
            year=2025,
            genres=["Metal"],
            tracks=[],
        )

        record = create_record(self.db, record_data)
        self.assertIsNotNone(record)
        self.assertEqual(record.title, "New Genre Album")
        self.assertEqual(len(record.genres), 1)
        self.assertEqual(record.genres[0].name, "Metal")

        # Verify the new genre was added to the database
        db_genre = self.db.query(Genre).filter(Genre.name == "Metal").first()
        self.assertIsNotNone(db_genre)

    def test_get_record(self):
        """Test getting a record by ID."""
        # Create a record
        record_data = RecordCreate(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=["Rock"],
            tracks=[TrackCreate(title="Track 1", duration=180)],
        )

        created_record = create_record(self.db, record_data)

        # Get the record
        record = get_record(self.db, created_record.id)
        self.assertIsNotNone(record)
        self.assertEqual(record.title, "Test Album")
        self.assertEqual(record.artist, "Test Artist")
        self.assertEqual(record.year, 2023)
        self.assertEqual(len(record.genres), 1)
        self.assertEqual(record.genres[0].name, "Rock")
        self.assertEqual(len(record.tracks), 1)
        self.assertEqual(record.tracks[0].title, "Track 1")

        # Get a non-existent record
        record = get_record(self.db, 999)
        self.assertIsNone(record)

    def test_get_records(self):
        """Test getting all records."""
        # Create records
        record_data1 = RecordCreate(
            title="Album 1", artist="Artist 1", year=2023, genres=["Rock"], tracks=[]
        )

        record_data2 = RecordCreate(
            title="Album 2", artist="Artist 2", year=2024, genres=["Pop"], tracks=[]
        )

        create_record(self.db, record_data1)
        create_record(self.db, record_data2)

        # Get all records
        records = get_records(self.db)
        self.assertEqual(len(records), 2)

        # Check that all expected records are present
        record_titles = [record.title for record in records]
        self.assertIn("Album 1", record_titles)
        self.assertIn("Album 2", record_titles)

    def test_update_record(self):
        """Test updating a record."""
        # Create a record
        record_data = RecordCreate(
            title="Original Album",
            artist="Original Artist",
            year=2023,
            genres=["Rock"],
            tracks=[TrackCreate(title="Original Track", duration=180)],
        )

        created_record = create_record(self.db, record_data)

        # Update the record
        update_data = RecordUpdate(
            title="Updated Album",
            artist="Updated Artist",
            year=2024,
            genres=["Pop", "Jazz"],
            tracks=[
                TrackCreate(title="Updated Track 1", duration=200),
                TrackCreate(title="Updated Track 2", duration=240),
            ],
            cover_image_url="http://example.com/updated-cover.jpg",
            review_url="http://example.com/updated-review",
        )

        updated_record = update_record(self.db, created_record.id, update_data)
        self.assertIsNotNone(updated_record)
        self.assertEqual(updated_record.title, "Updated Album")
        self.assertEqual(updated_record.artist, "Updated Artist")
        self.assertEqual(updated_record.year, 2024)
        self.assertEqual(len(updated_record.genres), 2)
        genre_names = [genre.name for genre in updated_record.genres]
        self.assertIn("Pop", genre_names)
        self.assertIn("Jazz", genre_names)
        self.assertEqual(len(updated_record.tracks), 2)
        self.assertEqual(updated_record.tracks[0].title, "Updated Track 1")
        self.assertEqual(updated_record.tracks[1].title, "Updated Track 2")
        self.assertEqual(
            updated_record.cover_image_url, "http://example.com/updated-cover.jpg"
        )
        self.assertEqual(updated_record.review_url, "http://example.com/updated-review")

        # Update a non-existent record
        updated_record = update_record(self.db, 999, update_data)
        self.assertIsNone(updated_record)

    def test_delete_record(self):
        """Test deleting a record."""
        # Create a record
        record_data = RecordCreate(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=["Rock"],
            tracks=[TrackCreate(title="Track 1", duration=180)],
        )

        created_record = create_record(self.db, record_data)

        # Delete the record
        result = delete_record(self.db, created_record.id)
        self.assertTrue(result)

        # Verify the record was deleted
        record = get_record(self.db, created_record.id)
        self.assertIsNone(record)

        # Delete a non-existent record
        result = delete_record(self.db, 999)
        self.assertFalse(result)

    def test_search_records(self):
        """Test searching for records."""
        # Create records
        record_data1 = RecordCreate(
            title="Rock Album",
            artist="Rock Artist",
            year=2023,
            genres=["Rock"],
            tracks=[],
        )

        record_data2 = RecordCreate(
            title="Pop Album", artist="Pop Artist", year=2024, genres=["Pop"], tracks=[]
        )

        record_data3 = RecordCreate(
            title="Jazz Album",
            artist="Jazz Artist",
            year=2025,
            genres=["Jazz"],
            tracks=[],
        )

        create_record(self.db, record_data1)
        create_record(self.db, record_data2)
        create_record(self.db, record_data3)

        # Search by title
        results = search_records(self.db, "Rock")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "Rock Album")

        # Search by artist
        results = search_records(self.db, "Pop Artist")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].artist, "Pop Artist")

        # Search by genre
        results = search_records(self.db, "Jazz")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "Jazz Album")

        # Search with no results
        results = search_records(self.db, "Metal")
        self.assertEqual(len(results), 0)

        # Search with multiple results
        results = search_records(self.db, "Album")
        self.assertEqual(len(results), 3)
