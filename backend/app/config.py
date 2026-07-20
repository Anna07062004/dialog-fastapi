import os
from dataclasses import dataclass

from dotenv import load_dotenv

DEFAULT_SECRET = "development-secret"

@dataclass(frozen= True, slots=True)

class Settings:
    app_name: str
    frontend_url: str
    database_url: str
    jwt_secret_key: str
    jwt_expire_minutes: str
    cookie_secure: bool
    pozia_api_key: str
    pozia_api_base_url:str
    pozia_timeount_seconds: str
    max_chat_history_messages: int

    @classmethod
    def from_env(cls):
        load_dotenv()
        settings = cls(
            app_name=os.getenv(),
            frontend_url=os.getenv(),
            database_url=os.getenv(),
            jwt_secret_key=os.getenv(),
            jwt_expire_minutes=os.getenv(),
            cookie_secure=os.getenv(),
            pozia_api_key=os.getenv(),
            pozia_api_base_url=os.getenv(),
            pozia_timeount_seconds=os.getenv(),
            max_chat_history_messages=os.getenv(),

)
