from models.base import Base
from models.PriceHistory import PriceHistory
from models.game import Game
from db.session import engine

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database Tables initialized.")
