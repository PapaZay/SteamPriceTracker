import httpx
import os


async def verify_turnstile(token: str, ip: str = None) -> bool:
    if not token:
        return False

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post("https://challenges.cloudflare.com/turnstile/v0/siteverify",
            json = {
                "secret": os.getenv("TURNSTILE_SECRET_KEY"),
                "response": token,
                "remoteip": ip,
            },
            timeout=10.0
            )
            data = response.json()
            return data.get("success", False)
    except Exception as e:
        print(f"Turnstile verification error: {e}")
        return False