from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
import logging
from backend.supabase_services.game_services import get_games, update_game_price
from backend.api.helper import get_game_data

scheduler = BackgroundScheduler()
logger = logging.getLogger("price_sync")
def start():
    scheduler.add_job(sync_prices, 'interval', hours=6)
    scheduler.start()
    logger.info("Price syncing started.")

def sync_prices():
    asyncio.run(run_sync_prices())

async def run_sync_prices():
    logger.info("syncing prices...")
    games = get_games()

    for game in games.data:
        app_id = game["app_id"]
        db_price = game.get("last_known_price")
        db_discount = game.get("discount_percent")

        try:
            steam_api_call = await get_game_data(app_id)
            price_info = steam_api_call["data"].get("price_overview")
            if not price_info:
                continue

            new_price = price_info["final"] / 100
            new_discount = price_info["discount_percent"]

            if new_price != db_price or new_discount != db_discount:
                update_game_price(app_id, new_price=new_price, discount_percent=new_discount)
                logger.info(f"Updated {game['name']} to ${new_price} with {new_discount}% off.")
        except Exception as e:
            logger.error(f"Error syncing game {app_id}: {e}")
    logger.info("Syncing complete.")
