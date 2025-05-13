# session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.models.base import Base

DATABASE_URL = "sqlite:///steamtracker.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

