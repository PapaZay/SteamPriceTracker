from fastapi import FastAPI, HTTPException, Path, Depends, Header
import httpx
from pydantic import BaseModel
from backend.api.auth import verify_token, get_current_user
from backend.api.helper import get_game_data
from backend.supabase_client import supabase
from backend.supabase_services.game_services import get_game_by_id, add_game
from backend.supabase_services.user_games_services import track_game_for_user
from backend.models.game import Game
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
    game_result = get_game_by_id(app_id)
    if not game_result or not game_result.data:
        app_data = await get_game_data(app_id)
        game_data = app_data["data"]

        new_game = Game(
            app_id=app_id,
            name=game_data["name"],
            currency=game_data.get("price_overview", {}).get("currency"),
            is_free=not game_data.get("price_overview"),
            last_known_price=game_data.get("price_overview", {}).get("final") / 100 if game_data.get("price_overview") else None,
            discount_percent=game_data.get("price_overview", {}).get("discount_percent", 0)
        )
        add_game(new_game.model_dump())
        game_name = new_game.name
        price_info = game_data.get("price_overview")
    else:
        game_data = game_result.data[0]
        game_name = game_data["name"]
        price_info = {
            "final": game_data.get("last_known_price"),
            "discount_percent": game_data.get("discount_percent"),
            "currency": game_data.get("currency")
        }
    try:
        track_game_for_user(user_id, app_id)
    except HTTPException as e:
        if e.status_code == 400:
            return {"message": f"User {user_id} is already tracking price for game '{game_name}' (App ID: {app_id})."}
        raise
    if price_info and price_info.get("final") is not None:
        return {"message": f"{user_id} is tracking price for game '{game_name}' (App ID: {app_id}).",
                "price": price_info
                }
    else:
        return FreeOrUnavailable(message=f"{game_name} is either free or unavailable, add priced games to your watchlist.")



@app.get("/tracked")
async def get_tracked_games(user=Depends(get_current_user)):
    user_id = user["sub"]
    tracked_games = supabase.table("user_games").select("*, games(name)").eq("user_id", user_id).execute()
    return tracked_games.data
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

