from jose import jwt, jwk, JWTError
from fastapi import Cookie, Response, Depends, HTTPException, Header, status, security, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.supabase_client import supabase
from backend.api.email_service import send_email, send_welcome_email
from typing import Optional
import logging
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ISSUER= os.getenv("SUPABASE_ISSUER")
SUPABASE_SECRET = os.getenv("SUPABASE_SECRET")
SUPABASE_AUDIENCE = os.getenv("SUPABASE_AUDIENCE")

jwks_cache = {}

if not all([SUPABASE_URL, SUPABASE_ISSUER, SUPABASE_SECRET, SUPABASE_AUDIENCE]):
    raise ValueError(
        "Missing environment variables: SUPABASE_URL, SUPABASE_ISSUER, SUPABASE_SECRET, SUPABASE_AUDIENCE"
    )

security = HTTPBearer()

async def get_public_keys():
    global jwks_cache
    if not jwks_cache:
        async with httpx.AsyncClient() as client:
            headers = {"apikey": SUPABASE_SECRET}
            resp = await client.get(f"{SUPABASE_URL}/auth/v1/keys")
            resp.raise_for_status()
            keys = resp.json()["keys"]
            jwks_cache = {key["kid"]: key for key in keys}
    return jwks_cache

async def verify_token_flexible(auth_token: str = Cookie(None), authorization: str = Header(None)):
    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif auth_token:
        token = auth_token

    if not token:
        raise HTTPException(status_code=401, detail="Authentication Required")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_SECRET,
            algorithms=["HS256"],
            audience=SUPABASE_AUDIENCE
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

async def get_current_user_flexible(token = Depends(verify_token_flexible)):
    return token

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_SECRET,  # 🔑 HS256 secret
            algorithms=["HS256"],
            audience=SUPABASE_AUDIENCE
            #issuer=SUPABASE_ISSUER
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

async def get_current_user(token = Depends(verify_token)):
    return token

async def exchange_token_for_cookie(token: str, response: Response):
    try:
        payload = jwt.decode(
            token,
            SUPABASE_SECRET,
            algorithms=["HS256"],
            audience=SUPABASE_AUDIENCE
        )
        user_id = payload["sub"]
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600
        )

        logger.info(f"Token exchanged for cookie for user {payload.get('sub')}")
        return {"message": "Token exchanged for cookie successfully.", "user_id": payload.get("sub")}

    except JWTError as e:
        logger.error(f"Error exchanging token for cookie: {e}")
        raise HTTPException(status_code=401, detail="Invalid Token")
    except Exception as e:
        logger.error(f"Unexpected error exchanging token for cookie: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def sync_user_profile(user: dict):
    supabase_id = user["sub"]
    email = user.get("email")
    if not email:
        return
    existing_user = supabase.table("user_profiles").select("*").eq("supabase_id", supabase_id).execute()
    is_new_user = len(existing_user.data) == 0

    supabase.table("user_profiles").upsert({
        "supabase_id": supabase_id,
        "email": email
    }, on_conflict="supabase_id").execute()

    if is_new_user:
        try:
            username = email.split("@")[0].title() if email else "User"
            status_code, response = send_welcome_email(email, username)
            if status_code == 200:
                logger.info(f"Welcome email sent to {email}")
            else:
                logger.error(f"Failed to send welcome email to {email}: {response}")
        except Exception as e:
            logger.error(f"Error sending welcome email to {email}: {e}")
