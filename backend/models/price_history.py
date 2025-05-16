# price_history.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PriceHistory(BaseModel):
    game_id: int
    timestamp: datetime
    initial_price: float
    final_price: float
    discount_percent: Optional[int] = None
    currency: Optional[str] = None