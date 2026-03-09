from database import SessionLocal, engine
from models import User, Base

# Ensure tables exist (optional but good for safety)
# Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    users = db.query(User).all()
    for u in users:
        print(f"ID:{u.user_id}")
        print(f"  Name: '{u.name}' (len:{len(u.name)})")
        print(f"  Contact: '{u.contact}' (len:{len(u.contact) if u.contact else 0})")
        print(f"  Pass: '{u.password}' (len:{len(u.password) if u.password else 0})")
finally:
    db.close()
