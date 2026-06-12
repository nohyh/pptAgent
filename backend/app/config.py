from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")
MODEL_PRO = os.getenv("MODEL_PRO")
MODEL_FLASH = os.getenv("MODEL_FLASH")
MODEL_PHOTO = os.getenv("MODEL_PHOTO")
MODEL_DEEPSEEK = os.getenv("MODEL_DEEPSEEK")

API_KEY_2 = os.getenv("API_KEY_2")
BASE_URL_2 = os.getenv("BASE_URL_2")
MODEL_FLASH_2 = os.getenv("MODEL_FLASH_2")

DEBUG_RAW_AI_RESPONSE = os.getenv("DEBUG_RAW_AI_RESPONSE", "").lower() == "true"

PEXELS_KEY = os.getenv("PEXELS_KEY")

DATABASE_URL = os.getenv("DATABASE_URL")
ASYNC_DATABASE_URL = os.getenv("ASYNC_DATABASE_URL")

