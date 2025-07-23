from backend.supabase_client import supabase
import logging
logger = logging.getLogger(__name__)
def get_latest_price(game_id: int):
    result = supabase.table("price_history").select("*").eq("game_id", game_id).order("timestamp", desc=True).limit(1).execute()
    if result.data:
        return result.data[0]
    else:
        return None

def insert_price_history(game_id: int, initial_price: float, final_price: float, discount_percent: int, currency: str):
    logger.info("Inserting price history...")
    print({
        "initial_price": initial_price,
        "final_price": final_price,
        "discount_percent": discount_percent,
        "currency": currency
    })

    entry = {
        "game_id": game_id,
        "initial_price": initial_price,
        "final_price": final_price,
        "discount_percent": discount_percent,
        "currency": currency
    }

    result = supabase.table("price_history").insert(entry).execute()
    logger.info("Inserting price history...")
    if result.data:
        return result.data[0]
    else:
        raise Exception(f"Failed to insert price history: {result}")

def get_price_history(game_id: int, limit: int = 100):
    result = supabase.table("price_history").select("*").eq("game_id", game_id).order("timestamp", desc=True).limit(limit).execute()
    if result.data:
        return result.data
    else:
        raise Exception(f"Failed to get price history.")