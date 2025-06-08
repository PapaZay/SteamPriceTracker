# game_services.py
from backend.supabase_client import supabase
def add_game(game_data: dict):
    result = supabase.table("games").insert(game_data).execute()
    return result.data

def get_game_by_id(app_id: int):
    return supabase.table("games").select("*").eq("app_id", app_id).execute()

def get_games():
    return supabase.table("games").select("*").execute()

def update_game_price(app_id: int, new_price: float, discount_percent: int):
    result = supabase.table("games").update({"last_known_price": new_price, "discount_percent": discount_percent}).eq("app_id", app_id).execute()
