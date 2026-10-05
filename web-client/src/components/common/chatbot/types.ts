export type ChatSender = "user" | "bot";

export interface FoodSuggestion {
  id: string;
  name: string;
  price: number;
  image?: string;
  link: string;
  restaurantName?: string;
  rating?: number;
}

export interface OrderPreview {
  orderId: string;
  totalAmount: number;
  orderDetails: {
    foodName: string;
    quantity: number;
  }[];
}

export interface ChatMessageModel {
  id: string;
  from: ChatSender;
  text?: string;
  foodCards?: FoodSuggestion[];
  createdAt: Date;
}

export interface ChatMetadata {
  orderItems: unknown[];
  addresses: unknown[];
  isOrdering: boolean;
  isFoodConfirmed: boolean;
  isRestaurantConfirmed: boolean;
  isAddressConfirmed: boolean;
  isPaymentConfirmed: boolean;
  isQuickReorder?: boolean;
  quickOrderOptions?: OrderPreview[];
}

export interface ChatApiResponse {
  reply?:
    | string
    | {
        reply?: string;
        suggestions?: FoodSuggestion[];
      };
  suggestions?: FoodSuggestion[];
  metadata?: Partial<ChatMetadata>;
}
