from fastapi import FastAPI, HTTPException, Path, Depends, Header
from pydantic import BaseModel
from backend.api.auth import verify_token, get_current_user, sync_user_profile
from backend.api.helper import get_game_data, search_games_fallback
from backend.supabase_client import supabase
from backend.supabase_services.game_services import get_game_by_id, add_game, update_game_price
from backend.supabase_services.price_history_services import get_latest_price, insert_price_history, get_price_history
from backend.supabase_services.user_games_services import track_game_for_user, untrack_game_for_user
from backend.models.game import Game
import logging
from backend.sync_prices import run_sync_prices
from backend.sync_prices import start
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

logger.info("app starting up...")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://api.steampricetracker.com", "https://www.api.steampricetracker.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"message": "SteamPriceTracker is running..."}

@app.get("/protected")
async def protected(user = Depends(get_current_user)):
    sync_user_profile(user)
    return {"message": "You are authenticated.",
            "user": user["sub"],
            "email": user.get("email")}
@app.get("/track-price/{app_id}")
async def track_price(app_id: int, user=Depends(get_current_user)):
    user_id = user["sub"]
    # confirms new users are in user_profiles table when they track their first game
    sync_user_profile(user)
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
        inserted_game_data = inserted_game.data[0]
        game_id = inserted_game_data["id"]
    else:
        app_data = await get_game_data(app_id)
        game_data = game_result.data[0]
        game_name = game_data["name"]
        new_current_price = app_data["data"].get("price_overview").get("final")
        db_price = game_data.get("last_known_price")
        new_discount = app_data["data"].get("price_overview").get("discount_percent")
        db_percent = game_data.get("discount_percent")
        # can possibly refactor this to run the conditional first
        price_info = {
            "initial": app_data["data"].get("price_overview").get("initial"),
            "final": new_current_price if new_current_price != db_price else db_price,
            "discount_percent": new_discount if new_discount != db_percent else db_percent,
            "currency": game_data.get("currency")
        }
        if (new_current_price != db_price) or (new_discount != db_percent):
            update_game_price(app_id, new_price=new_current_price / 100, discount_percent=new_discount)
        #initial_price = game_data.get("initial_price")
        game_id = game_data["id"]
    already_tracking = False
    try:
        track_game_for_user(user_id, app_id)
    except HTTPException as e:
        if e.status_code == 400:
            already_tracking = True
            logger.info(f"User {user_id} is already tracking App ID {app_id}. Continuing to price tracking.")
        else:
            raise


    if price_info and price_info.get("final") is not None:
        current_price = price_info.get("final") / 100
        current_initial = price_info.get("initial") / 100
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
        if already_tracking:
            return {"message": f"You are already tracking '{game_name}'. Price updated if changed.",
                    "price": price_info,
                    "already_tracking": True
                    }
        else:
            return {"message": f"Now tracking price for '{game_name}'.",
                    "price": price_info,
                    "already_tracking": False
                    }
    else:
        return FreeOrUnavailable(message=f"{game_name} is either free or unavailable, add priced games to your watchlist.")



@app.get("/tracked", summary="Get tracked games for user")
async def get_tracked_games(user=Depends(get_current_user)):
    user_id = user["sub"]
    tracked_games = supabase.table("user_games").select("*, games(name, last_known_price, currency, discount_percent, is_free)").eq("user_id", user_id).execute()
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

@app.get("/search_games")
async def search_games(query: str, limit: int = 10):
    return await search_games_fallback(query, limit)

@app.get("/price-history/{app_id}")
async def get_game_price_history(app_id: int = Path(..., title="Steam App ID")):
    try:
        game_data = get_game_by_id(app_id)
        if not game_data:
            raise HTTPException(status_code=404, detail="Game not found")

        game_id = game_data.data[0]["id"]
        price_history = get_price_history(game_id)

        return {
            "app_id": app_id,
            "game_name": game_data.data[0]["name"],
            "price_history": price_history
        }
    except Exception as e:
        logger.error(f"Error fetching price history for app_id {app_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch price history")

@app.delete("/untrack/{app_id}")
async def untrack_game(app_id: int, user=Depends(get_current_user)):
    user_id = user["sub"]
    untrack_game_for_user(user_id=user_id, app_id=app_id)
    return {"message": "Game removed from watchlist."}
@app.post("/admin/sync")
async def trigger_sync():
    await run_sync_prices()
    return {"message": "Sync completed"}

start()

