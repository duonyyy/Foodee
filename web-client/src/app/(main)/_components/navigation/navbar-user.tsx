/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { authService } from "@/api/auth";
import { apiRequest } from "@/api/base-api"; // adjust path if needed
import { UserActionsProps } from "@/app/(main)/_components/navigation/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useCartDrawer } from "@/context/cart-drawer-context";
import type { Notification } from "@/interface"; // adjust path as needed
import { NOTIFICATION_ADDED_SUBSCRIPTION } from "@/lib/graphql/subcriptions/notificationSubscriptions";
import { gql, useSubscription } from "@apollo/client";
import {
  BellIcon,
  LogOutIcon,
  MessageSquareIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Notification type
type NotificationItem = {
  id: string;
  title: string;
  time: string;
  type?: string | null;
  isRead?: boolean | null;
};

const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications {
    getUserNotifications {
      id
      content
      description
      createdAt
      isRead
      type
      receiveUser
    }
  }
`;

export default function UserActions({ openModal }: UserActionsProps) {
  const router = useRouter();
  // Get cart context
  const { getToken, logout, user } = useAuth();
  const { cartItems } = useCart(); // Change 'cart' to 'cartItems'
  const { toggleCartDrawer } = useCartDrawer();
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: notificationData } = useSubscription<{
    notificationAdded: Notification;
  }>(NOTIFICATION_ADDED_SUBSCRIPTION, {
    skip: !user?.id,
    onData: ({ data }) => {
      const notif = data.data?.notificationAdded;
      if (notif) {
        setNotifications((prev) => [
          {
            id: notif.id,
            title:
              notif.content ||
              notif.description ||
              "Có thông báo mới",
            time: new Date(notif.createdAt).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" },
            ),
            type: notif.type,
            isRead: notif.isRead,
          },
          ...prev,
        ]);
        // Play sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
    },
  });

  useEffect(() => {
    let ignore = false;
    async function fetchNotifications() {
      if (!user) return;
      const token = await getToken();
      if (!token) return;
      try {
        const data = await apiRequest<Notification[]>(
          "/notifications",
          "GET",
          { token: token },
        );
        if (!ignore) {
          setNotifications(
            data.map((notif) => ({
              id: notif.id,
              title:
                notif.content ||
                notif.description ||
                "Có thông báo mới",
              time: new Date(notif.createdAt).toLocaleTimeString(
                "vi-VN",
                { hour: "2-digit", minute: "2-digit" },
              ),
              type: notif.type,
              isRead: notif.isRead,
            })),
          );
        }
      } catch (err) {
        // Optionally handle error
        console.error("Failed to fetch notifications:", err);
      }
    }
    fetchNotifications();
    return () => {
      ignore = true;
    };
  }, [user, getToken]);

  /**
   * Handle user logout
   * Signs out from Firebase and backend
   */
  const handleLogout = async () => {
    try {
      // Firebase signs out the user
      await logout();

      // Backend logout
      const token = await getToken();
      if (token) {
        await authService.logout();
      }

      // Refresh page to reset state
      window.location.reload();
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  return (
    <>
      {/* Favorite Button (left) */}

      {/* Action buttons (wishlist, cart, notifications) */}
      <div className="flex flex-1 items-center justify-center gap-2 lg:flex-none">
        {user ? (
          <>
            {/* Cart button */}
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-control transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => toggleCartDrawer()}
              aria-label={`Giỏ hàng (${cartItems.length})`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative block">
              {(() => {
                const unreadCount = notifications.filter(
                  (item) => !item.isRead,
                ).length;
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative rounded-full border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
                        size="icon"
                        aria-label={
                          unreadCount > 0
                            ? `Thông báo (${unreadCount} chưa đọc)`
                            : "Thông báo"
                        }
                      >
                        <BellIcon className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span
                            className="absolute right-1.5 top-1 flex h-2.5 w-2.5 justify-center rounded-full bg-primary"
                            aria-hidden="true"
                          ></span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-0 max-h-96 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto sm:mr-4">
                      <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length > 0 ? (
                        notifications.map((item, idx) => (
                          <div key={item.id}>
                            <DropdownMenuItem className="p-3 cursor-pointer">
                              <div className="flex gap-2 items-center">
                                <Avatar>
                                  <AvatarImage
                                    src="/default-avatar.png"
                                    alt="Avatar"
                                  />
                                  <AvatarFallback>NT</AvatarFallback>
                                </Avatar>
                                <div className="px-2">
                                  <p className="line-clamp-2 text-md font-medium">
                                    {item.title}
                                  </p>
                                  <span className="text-gray-500 text-sm">
                                    {item.time}
                                  </span>
                                </div>
                              </div>
                            </DropdownMenuItem>
                            {idx < notifications.length - 1 && (
                              <DropdownMenuSeparator />
                            )}
                          </div>
                        ))
                      ) : (
                        <DropdownMenuItem className="justify-center text-gray-400">
                          Không có thông báo mới
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="justify-center"></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })()}
            </div>
          </>
        ) : null}
      </div>

      {/* User profile or login/register */}
      <div className="mx-auto flex flex-none flex-col items-center gap-2 sm:flex-row lg:mx-0 lg:ml-2">
        {user ? (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-11 min-w-11 items-center justify-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Mở menu tài khoản"
              >
                <span className="relative inline-block">
                  <Avatar className="ring-2 ring-primary/20">
                    <AvatarImage
                      src={user.avatar ?? ""}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {user.name?.substring(0, 2) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="absolute -bottom-1 right-0.5 flex h-3 w-3 rounded-full border-2 border-card bg-success"
                    aria-hidden="true"
                  />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 p-2">
                {/* User info */}
                <DropdownMenuItem className="text-base p-3 cursor-default">
                  <Avatar>
                    <AvatarImage
                      src={user.avatar ?? ""}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {user.name?.substring(0, 2) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex flex-col">
                    <p className="font-medium">
                      {user.name ?? "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Overview section */}
                <DropdownMenuLabel className="text-base font-medium px-2 py-3">
                  Tổng quan
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-base px-2 py-3 flex gap-2"
                  onClick={() => router.push("/order")}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Đơn hàng của tôi</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-base px-2 py-3 flex gap-2"
                  onClick={() => router.push("/profile")}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Chỉnh sửa hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Communication section */}
                <DropdownMenuItem
                  className="text-base px-2 py-3 flex gap-2"
                  onClick={() => router.push("/messenger")}
                >
                  <MessageSquareIcon className="h-5 w-5" />
                  <span>Tin nhắn</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Settings section */}

                {/* Payment section */}

                {/* Help and logout */}
                <DropdownMenuItem
                  className="text-base px-2 py-3 flex gap-2 text-red-500"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="h-5 w-5" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              className="w-full text-base font-semibold text-foreground hover:bg-accent hover:text-primary sm:w-auto"
              onClick={() => openModal("login")}
            >
              Đăng nhập
            </Button>
            <Button
              variant="default"
              className="w-full text-base font-semibold shadow-sm sm:w-auto"
              onClick={() => openModal("register")}
            >
              Đăng ký
            </Button>
          </>
        )}
      </div>

      {/* Hidden audio element for notification sound */}
      <audio
        ref={audioRef}
        src="/sounds/receive.mp3"
        preload="auto"
        style={{ display: "none" }}
      />
    </>
  );
}
