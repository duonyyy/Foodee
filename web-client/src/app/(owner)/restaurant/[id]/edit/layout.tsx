'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { userApi } from '@/api/user';
import { OwnerNotificationProvider } from '@/context/owner-notification-context';
import { NotificationPopup } from '@/components/owner/notification-popup';
import { Sidebar, MobileOwnerNav } from './_components/sidebar';
import { StatusBadge } from '@/components/ui/status-badge';

export default function EditRestaurantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, getToken, loading: authLoading } = useAuth();
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Fetch user's restaurant ID and validate ownership
    useEffect(() => {
        const fetchAndValidateRestaurant = async () => {
            if (user && !authLoading) {
                try {
                    const token = getToken();
                    if (token) {
                        console.log('🏪 Fetching restaurant for user:', user.id);
                        const restaurant = await userApi.restaurant.getMyRestaurant(token);
                        if (restaurant?.id) {
                            console.log('✅ Found restaurant:', restaurant.id);
                            setRestaurantId(restaurant.id);
                        } else {
                            console.log('❌ No restaurant found for user');
                            setError('Bạn chưa có nhà hàng nào để quản lý');
                        }
                    } else {
                        console.log('❌ No token available');
                        setError('Vui lòng đăng nhập để tiếp tục');
                    }
                } catch (error) {
                    console.error('❌ Error fetching restaurant:', error);
                    setError('Có lỗi xảy ra khi tải thông tin nhà hàng');
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading && !user) {
                console.log('❌ No user found, stopping restaurant fetch');
                setError('Vui lòng đăng nhập để truy cập trang này');
                setLoading(false);
            }
        };

        fetchAndValidateRestaurant();
    }, [user, getToken, authLoading]);

    // Show loading while auth or restaurant data is loading
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang tải thông tin nhà hàng...</p>
                    <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    // Show error if no user, no restaurant, or other errors
    if (!user || !restaurantId || error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {!user ? 'Vui lòng đăng nhập' : 'Không thể truy cập'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'Có lỗi xảy ra khi tải thông tin'}
                    </p>
                    <div className="space-y-3">
                        {!user ? (
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Về trang chủ
                            </Link>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mr-2"
                                >
                                    Thử lại
                                </button>
                                <Link
                                    href="/my-shop"
                                    className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Đăng ký nhà hàng
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <OwnerNotificationProvider restaurantId={restaurantId}>
            <div className="flex h-screen bg-background">
                {/* Sidebar Desktop */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-card/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <MobileOwnerNav />
                            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                                <Link href="/" className="hover:text-foreground transition-colors">Foodee</Link>
                                <span>/</span>
                                <Link href="/my-shop" className="hover:text-foreground transition-colors">Quán của tôi</Link>
                                <span>/</span>
                                <span className="font-semibold text-foreground">Kênh quản trị</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <StatusBadge status="approved" label="Đang nhận đơn" />
                            <Link
                                href={`/restaurant/${restaurantId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition hover:bg-accent"
                            >
                                <span>Xem trang quán</span>
                                <span className="text-muted-foreground text-xs">↗</span>
                            </Link>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
                        {children}
                    </main>
                </div>

                {/* Notification Popup */}
                <NotificationPopup />
            </div>
        </OwnerNotificationProvider>
    );
}
