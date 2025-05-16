from fastapi import FastAPI, HTTPException, Path, Depends, Header
import httpx
from pydantic import BaseModel
from backend.api.auth import verify_token, get_current_user
from backend.api.helper import get_game_data
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
@app.get("/track-price/{app_id}")
async def track_price(app_id: int, user=Depends(get_current_user)):
    user_id = user["sub"]

    app_data = await get_game_data(app_id)

    #game_data = app_data["data"]
    game_name = app_data["data"]["name"]
    price = app_data["data"].get("price_overview")
    if price:
        return {"message": f"{user_id} is tracking price for game '{game_name}' (App ID: {app_id})."}
    else:
        return FreeOrUnavailable(message=f"{game_name} is either free or unavailable, add priced games to your watchlist.")




@app.get("/price/{app_id}", response_model=PriceOverview | FreeOrUnavailable)
async def get_game_prices(app_id: int, payload: dict = Depends(verify_token)):
    app_data = await get_game_data(app_id)
    #game_data = app_data["name"]
    price = app_data["data"].get("price_overview")
    if price:
        return PriceOverview(
            game=app_data["data"]["name"],
            initial_price=price["initial"] / 100,
            final_price=price["final"] / 100,
            discount_percent=price["discount_percent"],
            currency=price["currency"]
        )
    else:
        return FreeOrUnavailable(message="This game is either free or unavailable.")

