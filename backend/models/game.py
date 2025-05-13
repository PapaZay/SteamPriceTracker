# game.py

from sqlalchemy import Column, Integer, String, Boolean, Float
from backend.models.base import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    currency = Column(String, nullable=True)
    is_free = Column(Boolean, nullable=False)
    last_known_price = Column(Float, nullable=True)
    discount_percent = Column(Integer, nullable=True)

