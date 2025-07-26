from backend.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)
def is_admin(user_id: str) -> bool:
    try:
        result = supabase.table("user_profiles").select("is_admin").eq("supabase_id", user_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0].get("is_admin", False)
        else:
            return False
    except Exception as e:
        logger.error(f"Error checking if user is admin: {e}")
        return False