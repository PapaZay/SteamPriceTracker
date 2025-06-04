from backend.supabase_client import supabase

def get_latest_price(game_id: int):
    result = supabase.table("price_history").select("*").eq("game_id", game_id).order("timestamp", desc=True).limit(1).execute()
    if result.data:
        return result.data[0]
    else:
        return None

