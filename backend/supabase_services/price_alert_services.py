from backend.supabase_client import supabase
from backend.supabase_services.game_services import get_game_by_id

def create_price_alert(user_id: str, app_id: int, alert_type: str, target_value: float):
    try:
        game_result = get_game_by_id(app_id)
        if not game_result.data:
            return {"error": "Game not found"}
        
        game_id = game_result.data[0]['id']

        existing = supabase.table("price_alerts").select("*").eq("user_id", user_id).eq("game_id", game_id).eq("is_active", True).execute()
        if existing.data:
            return {"error": "Alert already exists for this game"}

        alert_data = {
            "user_id": user_id,
            "game_id": game_id,
            "alert_type": alert_type,
            "target_value": target_value,
            "is_active": True
        }
        
        result = supabase.table("price_alerts").insert(alert_data).execute()
        return result.data[0] if result.data else None
        
    except Exception as e:
        print(f"Error creating price alert: {e}")
        return {"error": str(e)}

def get_user_alerts(user_id: str):
    try:
        result = supabase.table("price_alerts").select(
            "*, games(name, last_known_price, currency, discount_percent, app_id)"
        ).eq("user_id", user_id).eq("is_active", True).execute()
        
        return result.data if result.data else []
    except Exception as e:
        print(f"Error getting user alerts: {e}")
        return []

def delete_alert(alert_id: int, user_id: str):
    try:
        result = supabase.table("price_alerts").delete().eq("id", alert_id).eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        print(f"Error deleting alert: {e}")
        return None

def toggle_alert(alert_id: int, user_id: str, is_active: bool):
    try:
        result = supabase.table("price_alerts").update({"is_active": is_active}).eq("id", alert_id).eq("user_id", user_id).execute()
        return result.data
    except Exception as e:
        print(f"Error toggling alert: {e}")
        return None

def get_active_alerts():
    try:
        result = supabase.table("price_alerts").select(
            "*, games(app_id, name, last_known_price)"
        ).eq("is_active", True).execute()
        
        return result.data if result.data else []
    except Exception as e:
        print(f"Error getting active alerts: {e}")
        return []

def trigger_alert(alert_id: int, current_price: float):
    try:
        from datetime import datetime
        result = supabase.table("price_alerts").update({
            "triggered_at": datetime.now().isoformat(),
            "last_checked_price": current_price,
            "is_active": False  # disable after triggering
        }).eq("id", alert_id).execute()
        
        return result.data
    except Exception as e:
        print(f"Error triggering alert: {e}")
        return None