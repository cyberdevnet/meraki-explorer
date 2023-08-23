from dotenv import load_dotenv
from pydantic_settings import BaseSettings


load_dotenv(verbose=True)


class Settings(BaseSettings):
    fastapi_env: str = 'development'
    mongodb_url: str = 'mongodb://localhost:27017/'
    mongodb_hostname: str = 'localhost'
    redis_hostname: str = 'localhost'
    app_name: str = "FastAPI"

    class Config:
        env_prefix = ''
        env_file = "back-end/.env"
        env_file_encoding = 'utf-8'


settings = Settings()
