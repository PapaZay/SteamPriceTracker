# user_games_services.py
from fastapi import HTTPException

from backend.api.email_service import send_email
from backend.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)
def track_game_for_user(user_id: int, app_id: int):
    existing = supabase.table("user_games").select("*").eq("user_id", user_id).eq("app_id", app_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Game already tracked for user")
    try:
        result = supabase.table("user_games").insert({"user_id": user_id, "app_id": app_id}).execute()
        return result.data
    except Exception as e:
        status_code = getattr(e, "status_code", 500)
        detail = str(e)
        raise HTTPException(status_code=status_code, detail=detail)

def price_drop_notifications(app_id: int, game_name: str, new_price: float, discount_percent: int):
    result = supabase.table("user_games").select("user_id").eq("app_id", app_id).execute()
    if not result.data:
        logger.info(f"No users tracking game id {app_id}")
        return

    user_ids = [entry["user_id"] for entry in result.data]

    get_emails = supabase.table("user_profiles").select("email").in_("supabase_id", user_ids).execute()
    emails = [user["email"] for user in get_emails.data if user.get("email")]

    if not emails:
        logger.warning(f"No emails found for users tracking game {app_id}")
        return

    for email in emails:
        subject = f"Price Drop Alert: {game_name}"
        text = f"{game_name} is now ${new_price:.2f} ({discount_percent}% off on Steam!)"
        status, response = send_email(to_email=email, subject=subject, text=text)

        if status == 200:
            logger.info(f"Email sent to {email} for {game_name}")
        else:
            logger.warning(f"Failed to send email to {email}: {response}")
    logger.info(f"Sent price drop emails for {game_name} to {len(emails)} users")