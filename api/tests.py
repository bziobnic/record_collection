import os
import sys
import unittest
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app
from database.database import Base

# Create a test database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the tables
Base.metadata.create_all(bind=engine)


# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Create a test client
client = TestClient(app)

# Test data
test_genre = {"name": "Rock"}
test_record = {
    "title": "Test Album",
    "artist": "Test Artist",
    "release_date": str(date.today() - timedelta(days=365)),
    "label": "Test Label",
    "catalog_number": "TEST-123",
    "format": "Vinyl",
    "condition": "Mint",
    "purchase_date": str(date.today() - timedelta(days=30)),
    "purchase_price": 19.99,
    "notes": "Test notes",
    "genres": ["Rock", "Pop"],
    "tracks": [
        {"title": "Track 1", "position": "A1", "duration": "3:45"},
        {"title": "Track 2", "position": "A2", "duration": "4:20"},
    ],
}


class TestAPI(unittest.TestCase):
    """Test the API endpoints"""

    def setUp(self):
        """Set up the test database"""
        # Clear the database before each test
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    def test_root(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Record Collection API is running"}

    def test_create_genre(self):
        """Test creating a genre"""
        response = client.post("/api/genres/", json=test_genre)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_genre["name"]
        assert "id" in data

    def test_get_genres(self):
        """Test getting all genres"""
        # Create a genre first
        client.post("/api/genres/", json=test_genre)

        # Get all genres
        response = client.get("/api/genres/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["name"] == test_genre["name"]

    def test_create_record(self):
        """Test creating a record"""
        response = client.post("/api/records/", json=test_record)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == test_record["title"]
        assert data["artist"] == test_record["artist"]
        assert "id" in data
        assert len(data["genres"]) == 2
        assert len(data["tracks"]) == 2

    def test_get_records(self):
        """Test getting all records"""
        # Create a record first
        client.post("/api/records/", json=test_record)

        # Get all records
        response = client.get("/api/records/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert data[0]["title"] == test_record["title"]
        assert data[0]["artist"] == test_record["artist"]

    def test_get_record(self):
        """Test getting a specific record"""
        # Create a record first
        create_response = client.post("/api/records/", json=test_record)
        record_id = create_response.json()["id"]

        # Get the record
        response = client.get(f"/api/records/{record_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == test_record["title"]
        assert data["artist"] == test_record["artist"]
        assert data["id"] == record_id

    def test_update_record(self):
        """Test updating a record"""
        # Create a record first
        create_response = client.post("/api/records/", json=test_record)
        record_id = create_response.json()["id"]

        # Update the record
        update_data = {
            "title": "Updated Title",
            "artist": "Updated Artist",
            "genres": ["Jazz", "Blues"],
            "tracks": [{"title": "New Track", "position": "B1", "duration": "5:00"}],
        }
        response = client.put(f"/api/records/{record_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert data["artist"] == update_data["artist"]
        assert len(data["genres"]) == 2
        assert data["genres"][0]["name"] in ["Jazz", "Blues"]
        assert data["genres"][1]["name"] in ["Jazz", "Blues"]
        assert len(data["tracks"]) == 1
        assert data["tracks"][0]["title"] == "New Track"

    def test_delete_record(self):
        """Test deleting a record"""
        # Create a record first
        create_response = client.post("/api/records/", json=test_record)
        record_id = create_response.json()["id"]

        # Delete the record
        response = client.delete(f"/api/records/{record_id}")
        assert response.status_code == 200

        # Verify it's deleted
        get_response = client.get(f"/api/records/{record_id}")
        assert get_response.status_code == 404

    def test_search_records(self):
        """Test searching for records"""
        # Create a record first
        client.post("/api/records/", json=test_record)

        # Search for the record
        response = client.get("/api/records/search?q=Test")
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert data["total"] > 0
        assert len(data["results"]) > 0
        assert data["results"][0]["title"] == test_record["title"]

    def test_fetch_album_info(self):
        """Test fetching album info"""
        response = client.get(
            "/api/fetch-album-info?artist=Test+Artist&title=Test+Album"
        )
        assert response.status_code == 200
        data = response.json()
        # The response might vary depending on the external API, so just check the structure
        assert isinstance(data, dict)


if __name__ == "__main__":
    unittest.main()
