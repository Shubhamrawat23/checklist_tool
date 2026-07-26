import psycopg2
from dotenv import load_dotenv
import os 

load_dotenv()

def db_conn():
    try:
        return psycopg2.connect(
            dbname = os.getenv("DB_NAME"),
            user = os.getenv("DB_USER"),
            password = os.getenv("DB_PASSWORD"),
            host = os.getenv("DB_HOST"),
            port = os.getenv("DB_PORT")
        )
    except Exception as e:
        print("DB connection Failed")
        print(e)
        return None