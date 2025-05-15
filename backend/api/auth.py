from jose import jwt, jwk, JWTError
from fastapi import Depends, HTTPException, Header, status, security, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

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