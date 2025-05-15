from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import validates

from backend.models.base import Base

class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    supabase_id = Column(String, unique=True, nullable=False)
    preferred_currency = Column(String, nullable=True)

