"""
Tests for the genres API endpoints.
"""

import unittest

from api.database import Base, get_db
from api.main import app
from api.models import Genre
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


class TestGenreAPI(unittest.TestCase):
    """Test cases for the Genre API endpoints."""

    def setUp(self):
        """Set up the test database before each test."""
        # Clear the database
        db = TestingSessionLocal()
        db.query(Genre).delete()
        db.commit()

        # Create test data
        genres = [
            Genre(name="Rock"),
            Genre(name="Pop"),
            Genre(name="Jazz"),
            Genre(name="Classical"),
        ]
        db.add_all(genres)
        db.commit()
        db.close()

    def test_get_genres(self):
        """Test getting all genres."""
        response = client.get("/api/genres/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4

        # Check that all expected genres are present
        genre_names = [genre["name"] for genre in data]
        assert "Rock" in genre_names
        assert "Pop" in genre_names
        assert "Jazz" in genre_names
        assert "Classical" in genre_names

    def test_get_genre_names(self):
        """Test getting only genre names."""
        response = client.get("/api/genres/names")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 4

        # Check that all expected genre names are present
        assert "Rock" in data
        assert "Pop" in data
        assert "Jazz" in data
        assert "Classical" in data

    def test_create_genre(self):
        """Test creating a new genre."""
        response = client.post("/api/genres/", json={"name": "Metal"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Metal"

        # Verify the genre was added to the database
        response = client.get("/api/genres/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5

        # Check that the new genre is present
        genre_names = [genre["name"] for genre in data]
        assert "Metal" in genre_names

    def test_create_duplicate_genre(self):
        """Test creating a genre that already exists."""
        # First attempt should succeed
        response = client.post("/api/genres/", json={"name": "Electronic"})
        assert response.status_code == 200

        # Second attempt with the same name should return the existing genre
        response = client.post("/api/genres/", json={"name": "Electronic"})
        assert response.status_code == 200

        # Verify only one instance of the genre exists
        response = client.get("/api/genres/")
        assert response.status_code == 200
        data = response.json()

        # Count occurrences of "Electronic"
        electronic_count = sum(1 for genre in data if genre["name"] == "Electronic")
        assert electronic_count == 1

    def test_create_genre_case_insensitive(self):
        """Test creating a genre with different case."""
        # Create a genre with lowercase
        response = client.post("/api/genres/", json={"name": "indie"})
        assert response.status_code == 200

        # Create a genre with uppercase
        response = client.post("/api/genres/", json={"name": "INDIE"})
        assert response.status_code == 200

        # Verify only one instance of the genre exists (case-insensitive)
        response = client.get("/api/genres/")
        assert response.status_code == 200
        data = response.json()

        # Count occurrences of "indie" (case-insensitive)
        indie_count = sum(1 for genre in data if genre["name"].lower() == "indie")
        assert indie_count == 1
