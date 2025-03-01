"""
Tests for the API schemas.
"""

import unittest

from api.schemas import (
    GenreCreate,
    GenreRead,
    RecordCreate,
    RecordRead,
    RecordUpdate,
    TrackCreate,
    TrackRead,
)
from pydantic import ValidationError


class TestSchemas(unittest.TestCase):
    """Test cases for the API schemas."""

    def test_genre_create_schema(self):
        """Test the GenreCreate schema."""
        # Valid data
        genre = GenreCreate(name="Rock")
        self.assertEqual(genre.name, "Rock")

        # Invalid data (empty name)
        with self.assertRaises(ValidationError):
            GenreCreate(name="")

    def test_genre_read_schema(self):
        """Test the GenreRead schema."""
        # Valid data
        genre = GenreRead(id=1, name="Rock")
        self.assertEqual(genre.id, 1)
        self.assertEqual(genre.name, "Rock")

        # Invalid data (missing id)
        with self.assertRaises(ValidationError):
            GenreRead(name="Rock")

    def test_track_create_schema(self):
        """Test the TrackCreate schema."""
        # Valid data
        track = TrackCreate(title="Test Track", duration=180)
        self.assertEqual(track.title, "Test Track")
        self.assertEqual(track.duration, 180)

        # Invalid data (empty title)
        with self.assertRaises(ValidationError):
            TrackCreate(title="", duration=180)

        # Invalid data (negative duration)
        with self.assertRaises(ValidationError):
            TrackCreate(title="Test Track", duration=-1)

    def test_track_read_schema(self):
        """Test the TrackRead schema."""
        # Valid data
        track = TrackRead(id=1, title="Test Track", duration=180)
        self.assertEqual(track.id, 1)
        self.assertEqual(track.title, "Test Track")
        self.assertEqual(track.duration, 180)

        # Invalid data (missing id)
        with self.assertRaises(ValidationError):
            TrackRead(title="Test Track", duration=180)

    def test_record_create_schema(self):
        """Test the RecordCreate schema."""
        # Valid data with minimal fields
        record = RecordCreate(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=["Rock"],
            tracks=[],
        )
        self.assertEqual(record.title, "Test Album")
        self.assertEqual(record.artist, "Test Artist")
        self.assertEqual(record.year, 2023)
        self.assertEqual(record.genres, ["Rock"])
        self.assertEqual(record.tracks, [])

        # Valid data with all fields
        record = RecordCreate(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=["Rock", "Pop"],
            tracks=[
                TrackCreate(title="Track 1", duration=180),
                TrackCreate(title="Track 2", duration=240),
            ],
            cover_image_url="http://example.com/cover.jpg",
            review_url="http://example.com/review",
        )
        self.assertEqual(record.title, "Test Album")
        self.assertEqual(record.artist, "Test Artist")
        self.assertEqual(record.year, 2023)
        self.assertEqual(record.genres, ["Rock", "Pop"])
        self.assertEqual(len(record.tracks), 2)
        self.assertEqual(record.tracks[0].title, "Track 1")
        self.assertEqual(record.tracks[1].title, "Track 2")
        self.assertEqual(record.cover_image_url, "http://example.com/cover.jpg")
        self.assertEqual(record.review_url, "http://example.com/review")

        # Invalid data (empty title)
        with self.assertRaises(ValidationError):
            RecordCreate(
                title="", artist="Test Artist", year=2023, genres=["Rock"], tracks=[]
            )

        # Invalid data (empty artist)
        with self.assertRaises(ValidationError):
            RecordCreate(
                title="Test Album", artist="", year=2023, genres=["Rock"], tracks=[]
            )

        # Invalid data (year too low)
        with self.assertRaises(ValidationError):
            RecordCreate(
                title="Test Album",
                artist="Test Artist",
                year=1899,
                genres=["Rock"],
                tracks=[],
            )

        # Invalid data (year too high)
        with self.assertRaises(ValidationError):
            RecordCreate(
                title="Test Album",
                artist="Test Artist",
                year=2101,
                genres=["Rock"],
                tracks=[],
            )

        # Invalid data (empty genres)
        with self.assertRaises(ValidationError):
            RecordCreate(
                title="Test Album",
                artist="Test Artist",
                year=2023,
                genres=[],
                tracks=[],
            )

    def test_record_read_schema(self):
        """Test the RecordRead schema."""
        # Valid data
        record = RecordRead(
            id=1,
            title="Test Album",
            artist="Test Artist",
            year=2023,
            genres=[GenreRead(id=1, name="Rock")],
            tracks=[TrackRead(id=1, title="Track 1", duration=180)],
            cover_image_url="http://example.com/cover.jpg",
            review_url="http://example.com/review",
        )
        self.assertEqual(record.id, 1)
        self.assertEqual(record.title, "Test Album")
        self.assertEqual(record.artist, "Test Artist")
        self.assertEqual(record.year, 2023)
        self.assertEqual(len(record.genres), 1)
        self.assertEqual(record.genres[0].name, "Rock")
        self.assertEqual(len(record.tracks), 1)
        self.assertEqual(record.tracks[0].title, "Track 1")
        self.assertEqual(record.cover_image_url, "http://example.com/cover.jpg")
        self.assertEqual(record.review_url, "http://example.com/review")

        # Invalid data (missing id)
        with self.assertRaises(ValidationError):
            RecordRead(
                title="Test Album",
                artist="Test Artist",
                year=2023,
                genres=[GenreRead(id=1, name="Rock")],
                tracks=[TrackRead(id=1, title="Track 1", duration=180)],
            )

    def test_record_update_schema(self):
        """Test the RecordUpdate schema."""
        # Valid data with all fields
        record = RecordUpdate(
            title="Updated Album",
            artist="Updated Artist",
            year=2024,
            genres=["Jazz", "Blues"],
            tracks=[
                TrackCreate(title="Updated Track 1", duration=200),
                TrackCreate(title="Updated Track 2", duration=260),
            ],
            cover_image_url="http://example.com/updated-cover.jpg",
            review_url="http://example.com/updated-review",
        )
        self.assertEqual(record.title, "Updated Album")
        self.assertEqual(record.artist, "Updated Artist")
        self.assertEqual(record.year, 2024)
        self.assertEqual(record.genres, ["Jazz", "Blues"])
        self.assertEqual(len(record.tracks), 2)
        self.assertEqual(record.tracks[0].title, "Updated Track 1")
        self.assertEqual(record.tracks[1].title, "Updated Track 2")
        self.assertEqual(record.cover_image_url, "http://example.com/updated-cover.jpg")
        self.assertEqual(record.review_url, "http://example.com/updated-review")

        # Valid data with partial fields
        record = RecordUpdate(
            title="Updated Album",
            artist="Updated Artist",
            year=2024,
            genres=["Jazz"],
            tracks=[],
        )
        self.assertEqual(record.title, "Updated Album")
        self.assertEqual(record.artist, "Updated Artist")
        self.assertEqual(record.year, 2024)
        self.assertEqual(record.genres, ["Jazz"])
        self.assertEqual(record.tracks, [])

        # Invalid data (empty title)
        with self.assertRaises(ValidationError):
            RecordUpdate(
                title="", artist="Updated Artist", year=2024, genres=["Jazz"], tracks=[]
            )

        # Invalid data (empty artist)
        with self.assertRaises(ValidationError):
            RecordUpdate(
                title="Updated Album", artist="", year=2024, genres=["Jazz"], tracks=[]
            )

        # Invalid data (year too low)
        with self.assertRaises(ValidationError):
            RecordUpdate(
                title="Updated Album",
                artist="Updated Artist",
                year=1899,
                genres=["Jazz"],
                tracks=[],
            )

        # Invalid data (year too high)
        with self.assertRaises(ValidationError):
            RecordUpdate(
                title="Updated Album",
                artist="Updated Artist",
                year=2101,
                genres=["Jazz"],
                tracks=[],
            )

        # Invalid data (empty genres)
        with self.assertRaises(ValidationError):
            RecordUpdate(
                title="Updated Album",
                artist="Updated Artist",
                year=2024,
                genres=[],
                tracks=[],
            )
