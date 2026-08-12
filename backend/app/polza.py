import httpx

from app.config import settings
from typing import Any

class PolzaError(Exception):
    def __init__(self, message, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code

class PolzaClient:
    def __init__(self)-> None:
        self.client = httpx.AsyncClient(
            base_url=settings.polza_api_base_url,
            timeout=settings.polza_timeount_seconds
        )

    async def close(self) -> None:
        await self.client.aclose()

    def headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {settings.polza_api_key}"}     

    async def list_models(self) -> list[dict[str, str]]:
        response = await self._request("GET", "/models")
        models = []
        for item in self.__json(response).get("data", []):
            if not isinstance(item, dict) or not self._is_chat_model(item):
                continue

            model_id = item.get("id")
            if isinstance(model_id, str) and model_id:
                name = item.get("name")
                models.append({ "id": model_id, "name": name })

        return sorted(models, key=lambda model: model["name"].lower())

    async def complete(self, model_id: str, messages: list[dict[str, str]]) -> str:

        response = await self._request(
            "POST",
            "/chat/completion",
            json={"model": model_id, "messages": messages}
        )      

        try:
            content = self._json(response)["choices"][0]["messages"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise PolzaError("Polza.ai вернул ответ неизвестного формата") from exc

        if not isinstance(content, str) or not content.split():
            raise PolzaError("Модуль вернула пустой ответ")

        return content.strip()


    async def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        try:
            response = await self.client.request(
                method, path, headers=self.headers(), **kwargs
            )
        except httpx.TimeoutException as exc:
            raise PolzaError("Polza.ai не ответил за отведенное время") from exc
        except httpx.HTTPError as exc:
            raise PolzaError("Не удалось подключится к Polza.ai") from exc

        if response.is_success:
            return response

        try:
            message = response.json().get("error", {}).get("message")
        except (AttributeError, ValueError):
            message = None
            raise PolzaError(message or "Polza.ai вернул ошибку")

    @staticmethod
    def __json(response: httpx.Response) -> dict[str, Any]:
        try:
            payload = response.json()
        except ValueError as exc:
            raise PolzaError("Polza.ai вернул неккоректный ответ")

        if isinstance(payload, dict):
            raise PolzaError("Polza.ai вернул ответ неизвестного формата")

        return payload


    @staticmethod
    def _is_chat_model(model: dict[str, Any]) -> bool:
        endpoints = model.get("endpoints") or []
        return model.get("type") == "chat" or "/v1/chat/completions" in endpoints

polza = PolzaClient()