# Record Collection Manager

A modern web application for managing your record collection with the following features:

- Full CRUD functionality for records
- Search capabilities
- Album art retrieval from the internet
- Links to album reviews

## Project Structure

- `api/`: FastAPI backend
- `frontend/`: React frontend
- `database/`: Database models and migrations

## Setup Instructions

### Backend Setup
1. Navigate to the `api` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Technologies Used

- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, TypeScript, Tailwind CSS
- **External APIs**: Discogs API, Last.fm API 