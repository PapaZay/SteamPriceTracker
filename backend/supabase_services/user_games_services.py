# user_games_services.py
from fastapi import HTTPException

from backend.supabase_client import supabase

def track_game_for_user(user_id: int, app_id: int):
    existing = supabase.table("user_games").select("*").eq("user_id", user_id).eq("app_id", app_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Game already tracked for user")
    try:
        result = supabase.table("user_games").insert({"user_id": user_id, "app_id": app_id}).execute()
        return result.data
    except Exception as e:
        # Handle any errors from Supabase
        status_code = getattr(e, "status_code", 500)
        detail = str(e)
        raise HTTPException(status_code=status_code, detail=detail)