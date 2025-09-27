import os
from mailjet_rest import Client
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MAILJET_API_KEY")
secret_key = os.getenv("MAILJET_SECRET_KEY")
from_email = os.getenv("FROM_EMAIL")

mailjet = Client(auth=(api_key, secret_key), version='v3.1')

def send_welcome_email(to_email: str, username: str = "User"):
    subject = "Welcome to SteamPriceTracker!"

    text = f"""
    Hi {username},
    Welcome to SteamPriceTracker! We're excited to have you onboard.

    With your account, you can:
    • Track Steam game prices and get notified of deals
    • Set custom price alerts for your favorite games
    • View detailed price history charts
    • Never miss a sale again!

    Start by searching for games and adding them to your watchlist.

    Happy tracking!
    The SteamPriceTracker Team
    """

    html_content = f"""
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <style>
                  body {{ font-family: Arial, sans-serif; background-color: #f9fafb; color: #1f2937; margin: 0; padding: 20px; }}
                  .container {{ max-width: 600px; margin: 0 auto; background-color: #0f172a; padding: 20px; border-radius: 8px; }}
                  .header {{ text-align: center; margin-bottom: 20px; }}
                  .welcome-content {{ background-color: #1e293b; padding: 20px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }}
                  .feature-item {{ background-color: #1e293b; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }}
                  .feature-title {{ font-size: 16px; font-weight: bold; color: #ffffff; margin-bottom: 5px; }}
                  .feature-desc {{ color: #9ca3af; font-size: 14px; }}
                  .cta-button {{ display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; 
      margin: 20px 0; font-weight: bold; }}
                  .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; }}
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h2 style="color: #3b82f6; margin: 0;">Welcome to SteamPriceTracker!</h2>
                  </div>
                  <div class="content">
                      <div class="welcome-content">
                          <div class="feature-title">Hi {username},</div>
                          <div class="feature-desc" style="color: #ffffff; margin-top: 10px;">
                              We're excited to have you onboard with our community of smart Steam shoppers! 
                              Start saving money on your favorite games today.
                          </div>
                      </div>

                      <div class="feature-item">
                          <div class="feature-title">Track Game Prices</div>
                          <div class="feature-desc">Add games to your watchlist and monitor price changes over time with detailed charts.</div>
                      </div>

                      <div class="feature-item">
                          <div class="feature-title">🔔 Custom Price Alerts</div>
                          <div class="feature-desc">Set alerts for percentage discounts or specific price drops - we'll email you when deals go live!</div>
                      </div>

                      <div class="feature-item">
                          <div class="feature-title">Price History Charts</div>
                          <div class="feature-desc">View detailed price history to find the best time to buy and never overpay again.</div>
                      </div>

                      <div style="text-align: center;">
                          <a href="https://steampricetracker.com/search" class="cta-button">Start Tracking Games</a>
                      </div>
                  </div>
                  <div class="footer">
                      <p>© 2025 SteamPriceTracker.</p>
                  </div>
              </div>
          </body>
          </html>
          """

    return send_email(to_email, subject, text, html_content)


def send_email(to_email: str, subject: str, text: str, html: str = ""):
    data = {
        'Messages': [
            {
                "From": {
                    "Email": from_email,
                    "Name": "SteamPriceTracker"
                },
                "To": [
                    {
                        "Email": to_email,
                        "Name": "User"
                    }
                ],
                "Subject": subject,
                "TextPart": text,
                "HTMLPart": html or f"<p>{text}</p>"
            }
        ]
    }
    result = mailjet.send.create(data=data)
    return result.status_code, result.json()