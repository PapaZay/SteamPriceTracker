# price_history.py
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Boolean, String, Column, Integer, ForeignKey
from backend.models.base import Base


class PriceHistory(Base):
    __tablename__ = "PriceHistory"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)
    initial_price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=False)
    discount_percent = Column(Integer, nullable=True)
    currency = Column(String, nullable=True)