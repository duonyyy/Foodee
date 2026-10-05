from pydantic import BaseModel


class ChatSuggestion(BaseModel):
    """A food suggestion returned to the user."""

    id: str
    name: str
    price: float
    image: str = ""
    link: str = ""


class GeneralReplyResponse(BaseModel):
    """Response body for general chat reply endpoint."""

    reply: str
    suggestions: list[ChatSuggestion] = []
    action: str | None = None


class OrderItem(BaseModel):
    """A parsed order item from user message."""

    id: str
    name: str
    quantity: int
    price: float = 0
    restaurantId: str


class ParseOrderItemsResponse(BaseModel):
    """Response body for parse order items endpoint."""

    orderItems: list[OrderItem] = []
