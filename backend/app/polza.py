import httpx

from app.config import settings


class PolzaClient:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.polza_api_base_url,
            timeout=settings.polza_timeount_seconds
        )

    async def close(self) -> None:
        await self.client.aclose()

    def headers(self) -> dict[str, str]:
        return { "Authorization": f"Bearer {settings.polza_api_key}" }
    