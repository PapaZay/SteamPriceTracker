# helper.py
from dotenv import load_dotenv
import os
from fastapi import HTTPException, Path, Depends, Header
import httpx
from fastapi import HTTPException
from datetime import datetime
import asyncio
from backend.supabase_services.game_services import search_games_in_db

load_dotenv()

RAWG_API_KEY = os.getenv("RAWG_API_KEY")
async def get_game_data(app_id: int):
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&cc=us&l=en"

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(url)
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Failed to reach Steam API.")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Steam API returned an error.")

    data = resp.json()

    app_data = data.get(str(app_id), {})
    if not app_data.get("success"):
        raise HTTPException(status_code=404, detail="Game not found.")
    return app_data

async def search_games_with_fallback(query: str, limit: int = 10):
    results = []

    print(f"Searching database for: {query}")
    db_games = search_games_in_db(query, limit)

    for game in db_games:
        results.append({
            "app_id": game["app_id"],
            "name": game["name"],
            "current_price": game.get("last_known_price"),
            "currency": game.get("currency"),
            "discount_percent": game.get("discount_percent"),
            "is_free": game.get("is_free")
        })

    print(f"Found {len(results)} games in database")
    return {"results": results}


