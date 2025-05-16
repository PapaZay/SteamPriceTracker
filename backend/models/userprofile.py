from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    supabase_id: str
    preferred_currency: Optional[str] = None

