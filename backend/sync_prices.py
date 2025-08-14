from locale import currency
from backend.supabase_client import supabase
from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
import logging
from backend.supabase_services.game_services import get_games, update_game_price
from backend.api.helper import get_game_data
from backend.supabase_services.price_history_services import insert_price_history, get_latest_price
from backend.supabase_services.user_games_services import price_drop_notifications
from backend.supabase_services.price_alert_services import check_price_alerts
scheduler = BackgroundScheduler()
logger = logging.getLogger("price_sync")
def start():
    scheduler.add_job(sync_prices, 'interval', hours=4)
    scheduler.start()
    logger.info("Price syncing started.")

def sync_prices():
    asyncio.run(run_sync_prices())

async def run_sync_prices():
    logger.info("syncing prices...")
    games = get_games()

    for game in games.data:
        app_id = game["app_id"]
        game_id = game["id"]
        currency = game.get("currency")

        try:
            steam_api_call = await get_game_data(app_id)
            price_info = steam_api_call["data"].get("price_overview")
            if not price_info:
                logger.info(f"Skipping {game['name']} since it is free.")
                continue

            new_current = price_info["final"] / 100
            new_initial = price_info["initial"] / 100
            new_discount = price_info["discount_percent"]

            latest = get_latest_price(game_id)
            latest_current = float(latest["final_price"]) if latest else None
            latest_discount = int(latest["discount_percent"]) if latest else None

            if new_current != latest_current or new_discount != latest_discount:

                insert_price_history(
                    game_id=game_id,
                    initial_price=new_initial,
                    final_price=new_current,
                    discount_percent=new_discount,
                    currency=currency

                )
                logger.info(f"logged price history change for {game['name']} (${new_current}, {new_discount}% off).")
                update_game_price(app_id, new_price=new_current, discount_percent=new_discount)
                if new_discount == 0 and latest_discount > 0:
                    supabase.table("price_alerts").update({"triggered_at": None}).eq("game_id", game_id).execute()
                    logger.info(f"Reset price alert for {game['name']} - sale ended.")
                logger.info(f"Updated {game['name']}'s price, but no drop detected.")
        except Exception as e:
            logger.error(f"Error syncing game {app_id}: {e}")
    check_price_alerts()
    logger.info(f"Price alerts check complete.")

    #logger.info("Syncing complete.")
