
from backend.models.base import Base
from backend.models import User, Game, PriceHistory
from backend.db.session import engine

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database Tables initialized.")

if __name__ == "__main__":
    init_db()