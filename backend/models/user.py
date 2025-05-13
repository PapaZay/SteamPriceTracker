from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import validates

from backend.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    @validates("username")
    def validate_username(self, key, value):
        assert len(value) > 0
        return value
