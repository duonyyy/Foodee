"use client";

import { NotificationProvider } from "@/components/ui/notification";
import { CartProvider } from "@/context/cart-context";
import { CartDrawerProvider } from "@/context/cart-drawer-context";
import { GeoLocationProvider } from "@/context/geolocation-context";
import { AuthModalProvider } from "@/context/modal-context";
import { apolloClient } from "@/lib/graphql/apolloClient";
import { ApolloProvider } from "@apollo/client";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const ChatWidget = dynamic(
  () => import("@/components/common/chat-widget"),
  { ssr: false },
);
const CartDrawer = dynamic(() => import("./cart-drawer"), {
  ssr: false,
});

export default function MainProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ApolloProvider client={apolloClient}>
      <NotificationProvider>
        <AuthModalProvider>
          <CartProvider>
            <CartDrawerProvider>
              <GeoLocationProvider>
                {children}
                <ChatWidget />
                <CartDrawer />
              </GeoLocationProvider>
            </CartDrawerProvider>
          </CartProvider>
        </AuthModalProvider>
      </NotificationProvider>
    </ApolloProvider>
  );
}
