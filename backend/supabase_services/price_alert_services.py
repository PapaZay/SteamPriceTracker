import datetime

from backend.supabase_client import supabase
from backend.supabase_services.game_services import get_game_by_id
from backend.api.email_service import send_email
import logging
logger = logging.getLogger(__name__)
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
            "*, games(app_id, name, last_known_price, discount_percent)"
        ).eq("is_active", True).execute()
        
        return result.data if result.data else []
    except Exception as e:
        print(f"Error getting active alerts: {e}")
        return []

def trigger_alert(alert_id: int, current_price: float):
    try:
        result = supabase.table("price_alerts").update({
            "triggered_at": datetime.datetime.now(datetime.UTC).isoformat(),
            "last_checked_price": current_price,
            #"is_active": False  # disable after triggering
        }).eq("id", alert_id).execute()
        
        return result.data
    except Exception as e:
        print(f"Error triggering alert: {e}")
        return None

def check_price_alerts():
    try:
        alerts = get_active_alerts()
        logger.info(f"Found {len(alerts)} price alerts...")
        user_triggered_alerts = {}

        for alert in alerts:
            logger.info(f"Checking alert: {alert['alert_type']} with target {alert['target_value']}")
            game = alert["games"]
            current_price = game["last_known_price"]
            discount_percent = game.get("discount_percent", 0)
            logger.info(f"Game Discount: {discount_percent}, should_trigger will be calculated...")
            should_trigger = False

            if alert["alert_type"] == "percentage_discount":
                should_trigger = discount_percent > 0 and discount_percent >= alert["target_value"]
                logger.info(f"Percentage check: {discount_percent} >= {alert['target_value']} and discount > 0 = {should_trigger}")
            elif alert["alert_type"] == "price_drop":
                if alert["last_checked_price"] and current_price < alert['last_checked_price'] and discount_percent > 0:
                    should_trigger = True

            if should_trigger:
                user_id = alert["user_id"]
                if user_id not in user_triggered_alerts:
                    user_triggered_alerts[user_id] = []

                user_triggered_alerts[user_id].append({
                    'alert': alert,
                    'game': game,
                    'current_price': current_price,
                    'discount_percent': discount_percent
                })
            else:
                supabase.table("price_alerts").update({"last_checked_price": current_price}).eq("id", alert["id"]).execute()


        for user_id, triggered_alerts in user_triggered_alerts.items():
            get_emails = supabase.table("user_profiles").select("email").eq("supabase_id", user_id).execute()
            emails = [user["email"] for user in get_emails.data if user.get("email")]
            logger.info(f"Found emails for user {user_id}: {emails}")
            if not emails:
                continue

            for email in emails:
                if len(triggered_alerts) == 1:
                    subject = f"Price alert: {triggered_alerts[0]["game"]["name"]} is on sale!"
                else:
                    subject = f"Price alert: {len(triggered_alerts)} games are on sale!"

                html_content = f"""
                 <!DOCTYPE html>
                 <html>
                 <head>
                     <meta charset="utf-8">
                     <style>
                         body {{ font-family: Arial, sans-serif; background-color: #f9fafb; color: #1f2937; margin: 0; padding: 20px; }}
                         .container {{ max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 20px; border-radius: 8px; }}
                         .header {{ text-align: center; margin-bottom: 20px; }}
                         .game-item {{ background-color: #1e293b; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }}
                         .game-name {{ font-size: 18px; font-weight: bold; color: #ffffff; }}
                         .discount {{ color: #3b82f6; font-size: 16px; margin-top: 5px; }}
                         .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; }}
                     </style>
                 </head>
                 <body>
                     <div class="container">
                         <div class="header">
                             <h2 style="color: #3b82f6; margin: 0;">SteamPriceTracker Alert</h2>
                         </div>
                         <div class="content">
                 """


                for alert_data in triggered_alerts:
                    game = alert_data["game"]
                    alert = alert_data["alert"]
                    current_price = alert_data["current_price"]
                    discount_percent = alert_data["discount_percent"]

                    if alert["alert_type"] == "percentage_discount":
                        original_price = current_price / (1 - discount_percent / 100)
                        html_content += f"""
                             <div class="game-item">
              <div class="game-name">{game['name']}</div>
              <div class="discount">
                  <span style="color: #6b7280; text-decoration: line-through;">${original_price:.2f}</span>
                  <span style="color: #3b82f6; font-weight: 600;"> ${current_price:.2f}</span>
                  <span style="color: #dc2626; font-weight: 600;"> -{discount_percent}%</span>
              </div>
          </div>
      """

                    elif alert["alert_type"] == "price_drop":
                        old_price = alert.get("last_checked_price", "N/A")
                        if old_price:
                            html_content += f"""
                                     <div class="game-item">
                                         <div class="game-name">{game['name']}</div>
                                         <div class="discount">Price dropped to ${current_price:.2f} (was ${old_price:.2f})</div>
                                     </div>
                                 """
                        else:
                            html_content += f"""
                                     <div class="game-item">
                                         <div class="game-name">{game['name']}</div>
                                         <div class="discount">Price dropped to ${current_price:.2f}</div>
                                    </div>
                            """

                html_content += """
                             </div>
                             <div class="footer">
                                 <p>Visit Steam to grab these deals before they expire!</p>
                             </div>
                         </div>
                     </body>
                     </html>
                     """

                text = "\n".join(
                    [f"{alert_data['game']['name']}: {alert_data['discount_percent']}% OFF on Steam!" for alert_data in
                     triggered_alerts])

                status, response = send_email(to_email=email, subject=subject, text=text, html=html_content)
                logger.info(f"Email status: {status}, response: {response}")
                if status == 200:
                    for alert_data in triggered_alerts:
                        trigger_alert(alert_data["alert"]["id"], alert_data["current_price"])
    except Exception as e:
        print(f"Error checking price alerts: {e}")
        return None