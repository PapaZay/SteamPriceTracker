from fastapi import FastAPI, HTTPException, Path, Depends, Header
#import httpx
from pydantic import BaseModel
from backend.api.auth import verify_token, get_current_user
from backend.api.helper import get_game_data
from backend.supabase_client import supabase
from backend.supabase_services.game_services import get_game_by_id, add_game
from backend.supabase_services.price_history_services import get_latest_price, insert_price_history
from backend.supabase_services.user_games_services import track_game_for_user
from backend.models.game import Game
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

logger.info("Main app starting up...")

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
        inserted_game = get_game_by_id(new_game.app_id)
        game_id = inserted_game.id
    else:
        app_data = await get_game_data(app_id)
        game_data = game_result.data[0]
        game_name = game_data["name"]
        price_info = {
            "initial_price": app_data["data"].get("price_overview").get("initial") / 100,
            "final": game_data.get("last_known_price"),
            "discount_percent": game_data.get("discount_percent"),
            "currency": game_data.get("currency")
        }
        #initial_price = game_data.get("initial_price")
        game_id = game_data["id"]
    try:
        track_game_for_user(user_id, app_id)
    except HTTPException as e:
        if e.status_code == 400:
            logger.info(f"User {user_id} is already tracking App ID {app_id}. Continuing to price tracking.")
        else:
            raise


    if price_info and price_info.get("final") is not None:
        current_price = price_info.get("final")
        current_initial = price_info.get("initial_price")
        discount = price_info.get("discount_percent", 0)
        currency = price_info.get("currency")
        latest = get_latest_price(game_id)

        logger.info(f"Latest from DB: {latest}")
        logger.info(f"Current final price: {current_price}")

        if not latest or float(latest["final_price"]) != float(current_price):
            insert_price_history(
                game_id=game_id,
                initial_price=current_initial,
                final_price=current_price,
                discount_percent=discount,
                currency=currency
            )
        return {"message": f"{user_id} is tracking price for game '{game_name}' (App ID: {app_id}).",
                "price": price_info
                }
    else:
        return FreeOrUnavailable(message=f"{game_name} is either free or unavailable, add priced games to your watchlist.")



@app.get("/tracked", summary="Get tracked games for user")
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

