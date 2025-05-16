# helper.py
from fastapi import HTTPException, Path, Depends, Header
import httpx
from pydantic import BaseModel
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