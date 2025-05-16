# game.py

from pydantic import BaseModel
from typing import Optional


class Game(BaseModel):
    app_id: int
    name: str
    currency: Optional[str] = None
    is_free: bool
    last_known_price: Optional[float] = None
    discount_percent: Optional[int] = None
