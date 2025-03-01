"""
Tests for the records API endpoints.
"""

import unittest

from api.database import Base, get_db
from api.main import app
from api.models import Genre, Record, Track
from fastapi.testclient import TestClient
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

# Create the tables
Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override the get_db dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the get_db dependency
app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)


class TestRecordAPI(unittest.TestCase):
    """Test cases for the Record API endpoints."""

    def setUp(self):
        """Set up the test database before each test."""
        # Clear the database
        db = TestingSessionLocal()
        db.query(Track).delete()
        db.query(Record).delete()
        db.query(Genre).delete()
        db.commit()

        # Create test data
        rock_genre = Genre(name="Rock")
        pop_genre = Genre(name="Pop")
        db.add_all([rock_genre, pop_genre])
        db.commit()

        # Create a test record
        record = Record(
            title="Test Album",
            artist="Test Artist",
            year=2023,
            cover_image_url="http://example.com/cover.jpg",
        )
        record.genres = [rock_genre]

        # Add tracks to the record
        track1 = Track(title="Track 1", duration=180, record=record)
        track2 = Track(title="Track 2", duration=240, record=record)

        db.add(record)
        db.add_all([track1, track2])
        db.commit()

        self.record_id = record.id
        db.close()

    def test_get_records(self):
        """Test getting all records."""
        response = client.get("/api/records/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Album"
        assert data[0]["artist"] == "Test Artist"
        assert len(data[0]["genres"]) == 1
        assert data[0]["genres"][0]["name"] == "Rock"
        assert len(data[0]["tracks"]) == 2

    def test_get_record(self):
        """Test getting a single record."""
        response = client.get(f"/api/records/{self.record_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Album"
        assert data["artist"] == "Test Artist"
        assert len(data["genres"]) == 1
        assert data["genres"][0]["name"] == "Rock"
        assert len(data["tracks"]) == 2

    def test_create_record(self):
        """Test creating a new record."""
        record_data = {
            "title": "New Album",
            "artist": "New Artist",
            "year": 2024,
            "genres": ["Pop"],
            "tracks": [
                {"title": "New Track 1", "duration": 200},
                {"title": "New Track 2", "duration": 220},
            ],
        }

        response = client.post("/api/records/", json=record_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Album"
        assert data["artist"] == "New Artist"
        assert len(data["genres"]) == 1
        assert data["genres"][0]["name"] == "Pop"
        assert len(data["tracks"]) == 2

        # Verify the record was added to the database
        response = client.get("/api/records/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_update_record(self):
        """Test updating an existing record."""
        update_data = {
            "title": "Updated Album",
            "artist": "Updated Artist",
            "year": 2025,
            "genres": ["Rock", "Pop"],
            "tracks": [
                {"title": "Updated Track 1", "duration": 300},
                {"title": "Updated Track 2", "duration": 320},
            ],
        }

        response = client.put(f"/api/records/{self.record_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Album"
        assert data["artist"] == "Updated Artist"
        assert len(data["genres"]) == 2
        assert len(data["tracks"]) == 2

        # Verify the record was updated in the database
        response = client.get(f"/api/records/{self.record_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Album"

    def test_delete_record(self):
        """Test deleting a record."""
        response = client.delete(f"/api/records/{self.record_id}")
        assert response.status_code == 200

        # Verify the record was deleted from the database
        response = client.get(f"/api/records/{self.record_id}")
        assert response.status_code == 404

        # Verify there are no records left
        response = client.get("/api/records/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    def test_get_nonexistent_record(self):
        """Test getting a record that doesn't exist."""
        response = client.get("/api/records/999")
        assert response.status_code == 404

    def test_update_nonexistent_record(self):
        """Test updating a record that doesn't exist."""
        update_data = {
            "title": "Nonexistent Album",
            "artist": "Nonexistent Artist",
            "year": 2025,
            "genres": ["Rock"],
            "tracks": [],
        }

        response = client.put("/api/records/999", json=update_data)
        assert response.status_code == 404

    def test_delete_nonexistent_record(self):
        """Test deleting a record that doesn't exist."""
        response = client.delete("/api/records/999")
        assert response.status_code == 404
