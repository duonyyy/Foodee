from pydantic import BaseModel


class ChatMenuItem(BaseModel):
    """Menu item data sent from NestJS backend."""

    id: str
    name: str
    price: float
    description: str | None = None
    image: str = ""
    link: str = ""
    restaurantId: str


class GeneralReplyRequest(BaseModel):
    """Request body for general chat reply endpoint."""

    userMessage: str
    menuFlat: list[ChatMenuItem] = []


class ParseOrderItemsRequest(BaseModel):
    """Request body for parse order items endpoint."""

    userMessage: str
    menuFlat: list[ChatMenuItem] = []
