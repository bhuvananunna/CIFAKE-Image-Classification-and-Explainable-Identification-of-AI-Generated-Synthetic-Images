"""
CIFAKE: Image Classification and Explainable Identification of AI-Generated Synthetic Images
Database Management Module (SQLite3)

Schema:
1. users
   - id INTEGER PRIMARY KEY AUTOINCREMENT
   - name TEXT NOT NULL
   - email TEXT UNIQUE NOT NULL
   - password_hash TEXT NOT NULL
   - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. prediction_history
   - id INTEGER PRIMARY KEY AUTOINCREMENT
   - user_id INTEGER NOT NULL
   - image_name TEXT NOT NULL
   - original_path TEXT NOT NULL
   - gradcam_path TEXT NOT NULL
   - model_type TEXT NOT NULL
   - prediction TEXT NOT NULL
   - confidence REAL NOT NULL
   - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY(user_id) REFERENCES users(id)
"""

import sqlite3
import hashlib
import os
from pathlib import Path
import config

def get_db_connection():
    """Establishes and returns a database connection with dict-like row access."""
    db_path = Path(config.DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = "cifake_salt_2026") -> str:
    """Computes SHA-256 hash with cryptographic salt."""
    salted = f"{salt}_{password}_{salt}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verifies a plain password against the stored hash."""
    return hash_password(plain_password) == password_hash

def init_db():
    """Initializes the SQLite database with required tables and indexes."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create prediction_history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        image_name TEXT NOT NULL,
        original_path TEXT NOT NULL,
        gradcam_path TEXT NOT NULL,
        model_type TEXT NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)

    # Seed demo user for testing if none exists
    cursor.execute("SELECT id FROM users WHERE email = 'student@university.edu'")
    if not cursor.fetchone():
        demo_pass_hash = hash_password("Student@2026")
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            ("Academic Researcher", "student@university.edu", demo_pass_hash)
        )

    conn.commit()
    conn.close()
    print(f"[DATABASE] Initialized SQLite database successfully at {config.DATABASE_PATH}")

def register_user(name: str, email: str, password: str):
    """Registers a new user after hashing password. Returns user id or error string."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        pass_hash = hash_password(password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name.strip(), email.strip().lower(), pass_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"success": True, "user_id": user_id}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "An account with this email address already exists."}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def authenticate_user(email: str, password: str):
    """Authenticates credentials against stored password hash."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    user = cursor.fetchone()
    conn.close()

    if user and verify_password(password, user["password_hash"]):
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
    return None

def save_prediction(user_id: int, image_name: str, original_path: str, gradcam_path: str, model_type: str, prediction: str, confidence: float):
    """Records a single prediction inference event into the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO prediction_history (user_id, image_name, original_path, gradcam_path, model_type, prediction, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, image_name, original_path, gradcam_path, model_type, prediction, confidence))
    conn.commit()
    pred_id = cursor.lastrowid
    conn.close()
    return pred_id

def get_user_history(user_id: int):
    """Retrieves prediction history for the specified authenticated user only."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM prediction_history WHERE user_id = ? ORDER BY created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_user_dashboard_stats(user_id: int):
    """Computes summary statistics for a user's dashboard."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM prediction_history WHERE user_id = ?", (user_id,))
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as real_cnt FROM prediction_history WHERE user_id = ? AND prediction = 'REAL'", (user_id,))
    real_cnt = cursor.fetchone()["real_cnt"]

    cursor.execute("SELECT COUNT(*) as fake_cnt FROM prediction_history WHERE user_id = ? AND prediction = 'FAKE'", (user_id,))
    fake_cnt = cursor.fetchone()["fake_cnt"]

    conn.close()
    return {
        "total_predictions": total,
        "real_count": real_cnt,
        "fake_count": fake_cnt
    }

if __name__ == "__main__":
    init_db()
