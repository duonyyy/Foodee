/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useNotification } from '@/components/ui/notification';
import { userApi } from '@/api/user';
import { Address } from '@/interface';
import { CalculateOrderResponse, OrderResponse } from '@/api/response.interface';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

interface UseCheckoutProps {
  selectedAddressType: 'saved' | 'custom';
  selectedAddress: {
    full: string;
    latitude?: number;
    longitude?: number;
  } | null;
}

export const useCheckout = ({ selectedAddressType, selectedAddress }: UseCheckoutProps) => {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const { showNotification } = useNotification();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
  } = useCart();
  const { user, getToken } = useAuth();
  const router = useRouter();

  const [displayCartItems, setDisplayCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [, setLoadingCart] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedUserAddressId, setSelectedUserAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [showOnlineDropdown, setShowOnlineDropdown] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [calculation, setCalculation] = useState<CalculateOrderResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [orderType, setOrderType] = useState<'asap' | 'scheduled'>('asap');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [promotionCode, setPromotionCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await getCartItems();
        const filtered = restaurantId
          ? items.filter((item: any) => item.restaurant?.id === restaurantId)
          : items;

        setDisplayCartItems(filtered);
        setTotalPrice(
          filtered.reduce((sum, item) => sum + Number(item.total || 0), 0),
        );
        setLoadingCart(false);
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error);
        showNotification('Có lỗi khi tải giỏ hàng. Vui lòng thử lại!', 'error');
        setLoadingCart(false);
        setInitialLoading(false);
      }
    };
    void fetchCart();
  }, [cartItems, getCartItems, restaurantId, showNotification]);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!user) {
        setUserAddresses([]);
        setSelectedUserAddressId(null);
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          setUserAddresses([]);
          showNotification('Vui lòng đăng nhập để sử dụng địa chỉ đã lưu!', 'warning');
          return;
        }
        const profile = await userApi.getMe(token);
        setUserAddresses(profile?.address || []);
        for (const address of profile?.address || []) {
          if (address.isDefault) {
            setSelectedUserAddressId(address.id || null);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setUserAddresses([]);
        showNotification('Không thể tải danh sách địa chỉ. Vui lòng thử lại!', 'error');
      }
    };
    fetchUserAddresses();
  }, [user, getToken, showNotification]);

  useEffect(() => {
    const calc = async () => {
      const targetRestaurantId = displayCartItems[0]?.restaurant?.id || restaurantId;

      if (
        !targetRestaurantId ||
        displayCartItems.length === 0 ||
        (selectedAddressType === 'saved' && !selectedUserAddressId) ||
        (selectedAddressType === 'custom' && !selectedAddress?.full)
      ) {
        setCalculation(null);
        return;
      }

      setCalculating(true);

      try {
        const items = displayCartItems.map(item => ({
          foodId: item.foodId || item.id,
          quantity: item.quantity,
          discountPercent: item.discountPercent || 0,
          toppings: item.toppings?.map((t: any) => ({
            id: t.id,
            price: Number(t.price),
          })) || [],
        }));

        const payload =
          selectedAddressType === 'saved'
            ? await userApi.order.calculateOrder(
                selectedUserAddressId!,
                targetRestaurantId,
                items,
                promotionCode || undefined
              )
            : await userApi.order.calculateOrderWithCustomAddress(
                {
                  ...parseAddress(selectedAddress!.full),
                  latitude: selectedAddress!.latitude ?? 0,
                  longitude: selectedAddress!.longitude ?? 0,
                  label: 'Địa chỉ mới',
                },
                targetRestaurantId,
                items,
                promotionCode || undefined
              );

        setCalculation(payload);
      } catch (e) {
        console.error('Failed to calculate order:', e);
        setCalculation(null);
        showNotification('Không thể tính toán phí giao hàng. Vui lòng kiểm tra địa chỉ!', 'error');
      }

      setCalculating(false);
    };

    calc();
  }, [
    displayCartItems,
    restaurantId,
    selectedUserAddressId,
    selectedAddress,
    selectedAddressType,
    promotionCode,
    showNotification,
  ]);

  const handleSetDefaultAddress = (addressId: string) => {
    setUserAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
    setSelectedUserAddressId(addressId);
    showNotification('Đã chọn địa chỉ giao hàng!', 'success');
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    try {
      updateQuantity(id, qty);
      showNotification('Đã cập nhật số lượng!', 'success');
    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification('Không thể cập nhật số lượng. Vui lòng thử lại!', 'error');
    }
  };

  const handleRemoveFromCart = (id: string) => {
    try {
      removeFromCart(id);
      showNotification('Đã xóa món khỏi giỏ hàng!', 'success');
    } catch (error) {
      console.error('Error removing from cart:', error);
      showNotification('Không thể xóa món khỏi giỏ hàng. Vui lòng thử lại!', 'error');
    }
  };

  function parseAddress(full: string) {
    const parts = full.split(',').map(p => p.trim());
    return {
      street: parts[0] || '',
      ward: parts[1] && parts[2] ? `${parts[1]}, ${parts[2]}` : parts[1] || '',
      district: parts[3] || '',
      city: parts[4] || '',
    };
  }

  const handleOrder = async (
    overrideAddressType?: 'saved' | 'custom',
    overrideAddress?: { full: string; latitude?: number; longitude?: number } | null
  ) => {
    if (isSubmitting) return;

    const activeAddressType = overrideAddressType || selectedAddressType;
    const activeAddress = overrideAddress !== undefined ? overrideAddress : selectedAddress;

    // Validation checks with notifications
    if (!user) {
      showNotification('Vui lòng đăng nhập để đặt hàng!', 'warning');
      return;
    }

    if (displayCartItems.length === 0) {
      showNotification('Giỏ hàng của bạn đang trống!', 'warning');
      return;
    }

    if (activeAddressType === 'saved' && !selectedUserAddressId) {
      showNotification('Vui lòng chọn địa chỉ giao hàng!', 'warning');
      return;
    }

    if (activeAddressType === 'custom' && !activeAddress?.full) {
      showNotification('Vui lòng nhập địa chỉ giao hàng!', 'warning');
      return;
    }

    if (!paymentMethod) {
      showNotification('Vui lòng chọn phương thức thanh toán!', 'warning');
      return;
    }

    setIsSubmitting(true);

    const targetRestaurantId = displayCartItems[0]?.restaurant?.id || restaurantId;

    const orderPayload = {
      userId: user.id,
      restaurantId: targetRestaurantId,
      total: calculation?.total ?? totalPrice,
      note: orderNote,
      paymentMethod,
      orderType,
      ...(activeAddressType === 'saved'
        ? { addressId: selectedUserAddressId }
        : activeAddress && {
            address: {
              ...parseAddress(activeAddress.full),
              latitude: activeAddress.latitude,
              longitude: activeAddress.longitude,
              label: 'Địa chỉ mới',
            },
          }),
      orderDetails: displayCartItems.map(item => ({
        foodId: item.foodId || item.id,
        quantity: String(item.quantity),
        price: String(item.price),
        note: item.note || '',
        discountPercent: item.discountPercent ?? 0,
        selectedToppings: item.toppings?.map((t: any) => ({
          id: t.id,
          name: t.name,
          price: Number(t.price),
        })),
      })),
    };

    try {
      showNotification('Đang tạo đơn hàng...', 'info');

      const token = await getToken();
      if (!token) {
        showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'error');
        return;
      }

      const response: OrderResponse = await userApi.order.createOrder(token, orderPayload);

      // Xoá các món của quán đã đặt khỏi giỏ hàng
      clearCart(targetRestaurantId);

      if (response.paymentUrl) {
        showNotification('Chuyển hướng đến trang thanh toán...', 'info');
        window.location.href = response.paymentUrl;
        return;
      }

      showNotification('Đặt hàng thành công!', 'success');
      router.push(`/order/${response.order.id}`);
    } catch (err: any) {
      console.error('Failed to create order:', err);

      // Handle specific error messages
      if (err?.response?.status === 400) {
        showNotification('Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại!', 'error');
      } else if (err?.response?.status === 401) {
        showNotification('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 'error');
      } else if (err?.response?.status === 404) {
        showNotification('Không tìm thấy sản phẩm hoặc cửa hàng!', 'error');
      } else if (err?.response?.status >= 500) {
        showNotification('Lỗi hệ thống. Vui lòng thử lại sau!', 'error');
      } else {
        showNotification('Không thể tạo đơn hàng. Vui lòng thử lại!', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (typeof price !== 'number' || isNaN(price)) return '0 ₫';
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  return {
    displayCartItems,
    totalPrice,
    initialLoading,
    userAddresses,
    selectedUserAddressId,
    paymentMethod,
    showOnlineDropdown,
    orderNote,
    setPaymentMethod,
    setShowOnlineDropdown,
    setOrderNote,
    handleSetDefaultAddress,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleOrder,
    formatPrice,
    calculation,
    calculating,
    promotionCode,
    setPromotionCode,
    orderType,
    setOrderType,
    isSubmitting,
  };
};
