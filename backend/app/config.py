from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL = os.getenv("MODEL")
MODEL_2 = os.getenv("MODEL_2")
MODEL_3 = os.getenv("MODEL_3")
MODEL_4 = os.getenv("MODEL_4")
DEBUG_RAW_AI_RESPONSE = os.getenv("DEBUG_RAW_AI_RESPONSE", "").lower() == "true"
