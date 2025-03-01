import logging
import os
from typing import Any, Dict, Optional, Tuple

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API keys
DISCOGS_API_KEY = os.getenv("DISCOGS_API_KEY", "")
DISCOGS_API_SECRET = os.getenv("DISCOGS_API_SECRET", "")
LASTFM_API_KEY = os.getenv("LASTFM_API_KEY", "")


async def search_discogs(artist: str, title: str) -> Optional[Dict[str, Any]]:
    """
    Search Discogs API for album information.

    Args:
        artist: The artist name
        title: The album title

    Returns:
        Dictionary with album information or None if not found
    """
    if not DISCOGS_API_KEY or not DISCOGS_API_SECRET:
        logger.warning("Discogs API credentials not configured")
        return None

    try:
        url = "https://api.discogs.com/database/search"
        params = {
            "q": f"{artist} {title}",
            "type": "release",
            "key": DISCOGS_API_KEY,
            "secret": DISCOGS_API_SECRET,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("results") and len(data["results"]) > 0:
                return data["results"][0]
            return None
    except Exception as e:
        logger.error(f"Error searching Discogs: {e}")
        return None


async def get_album_art(artist: str, title: str) -> Optional[str]:
    """
    Get album art URL from Discogs.

    Args:
        artist: The artist name
        title: The album title

    Returns:
        URL to album art or None if not found
    """
    result = await search_discogs(artist, title)
    if result and "cover_image" in result:
        return result["cover_image"]
    return None


async def get_album_info(
    artist: str, title: str
) -> Tuple[Optional[str], Optional[str]]:
    """
    Get album art URL and Discogs URL.

    Args:
        artist: The artist name
        title: The album title

    Returns:
        Tuple of (album_art_url, discogs_url)
    """
    result = await search_discogs(artist, title)
    if not result:
        return None, None

    album_art = result.get("cover_image")
    discogs_url = None

    if "uri" in result:
        discogs_url = result["uri"]

    return album_art, discogs_url


async def get_lastfm_review(artist: str, title: str) -> Optional[str]:
    """
    Get album review URL from Last.fm.

    Args:
        artist: The artist name
        title: The album title

    Returns:
        URL to Last.fm album page or None if not found
    """
    if not LASTFM_API_KEY:
        logger.warning("Last.fm API key not configured")
        return None

    try:
        url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            "method": "album.getinfo",
            "api_key": LASTFM_API_KEY,
            "artist": artist,
            "album": title,
            "format": "json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if "album" in data and "url" in data["album"]:
                return data["album"]["url"]
            return None
    except Exception as e:
        logger.error(f"Error getting Last.fm review: {e}")
        return None
