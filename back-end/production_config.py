import os
from os import environ, path
from dotenv import load_dotenv
from pydantic import BaseSettings


load_dotenv(verbose=True)


class Settings(BaseSettings):
    fastapi_env: str = 'production'
    mongodb_url: str = "mongodb://mongodb:27017/"
    mongodb_hostname: str = 'mongodb'
    redis_hostname: str = 'redis'
    app_name: str = "FastAPI"

    class Config:
        env_prefix = ''
        env_file = "back-end/.env"
        env_file_encoding = 'utf-8'


settings = Settings()
