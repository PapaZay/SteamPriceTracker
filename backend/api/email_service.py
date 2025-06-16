import os
from mailjet_rest import Client
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("MAILJET_API_KEY")
secret_key = os.getenv("MAILJET_SECRET_KEY")
from_email = os.getenv("FROM_EMAIL")

mailjet = Client(auth=(api_key, secret_key), version='v3.1')

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