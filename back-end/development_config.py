import os
from os import environ, path
from dotenv import load_dotenv
from pydantic import BaseSettings


load_dotenv(verbose=True)


class Settings(BaseSettings):
    flask_env: str = os.getenv("FLASK_ENV")
    mongodb_url: str = os.getenv("MONGODB_URL_DEV")
    mongodb_hostname: str = os.getenv("MONGODB_HOSTNAME_DEV")
    app_name: str = ""

    class Config:
        env_prefix = ''
        env_file = "back-end/.env"
        env_file_encoding = 'utf-8'


settings = Settings()
