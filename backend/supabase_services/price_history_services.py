from backend.supabase_client import supabase

def get_latest_price(game_id: int):
    result = supabase.table("price_history").select("*").eq("game_id", game_id).order("timestamp", desc=True).limit(1).execute()
    return result.data[0] if result.data else None
