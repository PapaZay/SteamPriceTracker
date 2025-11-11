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

async def search_steam_api(query: str, limit: int = 10): # for games not in database, used in search
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get("https://store.steampowered.com/api/storesearch/", params={"term": query, "cc": "us", "l": "en"})
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])

                results = []
                for item in items[:limit]:
                    price_info = None
                    currency = "USD"
                    discount_percent = 0

                    if "price" in item and item["price"]:
                        initial_price = item["price"].get("initial", 0)
                        final_price = item["price"].get("final", 0)

                        price_info = final_price / 100 if final_price else None
                        currency = item["price"].get("currency", "USD")

                        if initial_price and final_price and initial_price > final_price:
                            discount_percent = int(((initial_price - final_price) / initial_price) * 100)

                    results.append({
                        "app_id": item["id"],
                        "name": item["name"],
                        "current_price": price_info,
                        "currency": currency,
                        "discount_percent": discount_percent,
                        "is_free": price_info == 0 if price_info is not None else None,
                        "image": item.get("tiny_image", "")
                    })
                return results
    except Exception as e:
                print(f"Steam store Search failed: {e}")
                return []
    return []

async def search_games_fallback(query: str, limit: int = 10):
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
            "is_free": game.get("is_free"),
            "in_database": True
        })

    print(f"Found {len(results)} games in db.")

    if len(results) < limit:
        remaining = limit - len(results)
        print(f"Searching steam store for {remaining} more games...")

        try:
            steam_results = await search_steam_api(query, remaining)

            for steam_game in steam_results:
                if not any(game["app_id"] == steam_game["app_id"] for game in results):
                    results.append({**steam_game, "in_database": False})
        except Exception as e:
            print(f"Steam store Search failed: {e}")
    return {"results": results[:limit]}

async def get_popular_games_from_steam(limit: int = 10):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get("https://store.steampowered.com/api/featuredcategories/")
            data = response.json()

            print(f"DEBUG: Steam API status code: {response.status_code}")

            top_sellers = data.get('top_sellers', {}).get('items', [])
            print(f"DEBUG: Found {len(top_sellers)} top sellers from Steam")

            games = []
            for item in top_sellers:
                if not item.get('large_capsule_image'):
                    print(f"DEBUG: Processing game: {item.get('name')} (ID: {item['id']})")
                    continue

                if item['id'] == 1675200:
                    print(f"DEBUG: Skipping Steam Deck")
                    continue


                if 'steam deck' in item.get('name', '').lower():
                    print(f"DEBUG: Skipping game with 'steam deck' in name")
                    continue

                games.append({
                    'app_id': item['id'],
                    'name': item['name'],
                    'current_price': item.get('final_price', 0) / 100,
                    'original_price': item.get('original_price', 0) / 100,
                    'discount_percent': item.get('discount_percent', 0),
                    'currency': 'USD',
                    'header_image': item.get('large_capsule_image', ''),
                    'is_free': item.get('final_price', 0) == 0
                })

                  # Stop once we have enough games
                if len(games) >= limit:
                    break
            print(f"DEBUG: Returning {len(games)} games")
            return games

    except Exception as e:
        print(f"Error fetching Steam top sellers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch popular games from Steam")
