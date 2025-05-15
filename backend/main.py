from fastapi import FastAPI, HTTPException, Path, Depends, Header
import httpx
from pydantic import BaseModel
from backend.api.auth import verify_token, get_current_user
app = FastAPI()

class PriceOverview(BaseModel):
    game: str
    initial_price: float
    final_price: float
    discount_percent: int
    currency: str

class FreeOrUnavailable(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"message": "SteamDB tracker is running..."}

@app.get("/protected")
async def protected(user = Depends(get_current_user)):
    return {"message": "This is a protected endpoint.", "user": user}

@app.get("/price/{app_id}", response_model=PriceOverview | FreeOrUnavailable)
async def get_game_prices(app_id: int, payload: dict = Depends(verify_token)):
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
    game_data = app_data["data"]
    price = game_data.get("price_overview")
    if price:
        return PriceOverview(
            game=game_data["name"],
            initial_price=price["initial"] / 100,
            final_price=price["final"] / 100,
            discount_percent=price["discount_percent"],
            currency=price["currency"]
        )
    else:
        return FreeOrUnavailable(message="This game is either free or unavailable.")

