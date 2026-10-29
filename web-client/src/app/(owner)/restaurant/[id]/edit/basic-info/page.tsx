/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommonInfoForm } from '../_components/common';
import { Restaurant } from '@/interface';
import { useAuth } from '@/context/auth-context';
import { userApi } from '@/api/user';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { PageHeader } from "@/components/ui/page-header";

export default function BasicInfoPage() {
    const { getToken, loading: authLoading } = useAuth();
    const params = useParams();
    const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [, setError] = useState<string | null>(null);

    // Fetch restaurant data
    useEffect(() => {
        if (authLoading) return;

        const loadRestaurant = async () => {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken() ?? '';
                if (!token) {
                    setError("Failed to retrieve authentication token");
                    return;
                }

                const fetchedRestaurant = await userApi.restaurant.getMyRestaurant(token);

                if (!fetchedRestaurant) {
                    setError("Restaurant not found");
                    return;
                }

                setRestaurant(fetchedRestaurant);
            } catch (err) {
                console.error("Failed to fetch restaurant:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                toast.error("Failed to load restaurant data");
            } finally {
                setLoading(false);
            }
        };

        loadRestaurant();
    }, [getToken, authLoading]);

    // Utility to split address string
    function parseAddress(full: string) {
        const parts = full.split(',').map(p => p.trim());
        return {
            street: parts[0] || '',
            ward: parts[1] && parts[2] ? `${parts[1]}, ${parts[2]}` : (parts[1] || ''),
            district: parts[3] || '',
            city: parts[4] || '',
        };
    }

    // Handle address selection from MapboxSearch
    const handleAddressSelect = useCallback((addressData: any) => {
        const { full, latitude, longitude } = addressData;
        const { street, ward, district, city } = parseAddress(full);

        setRestaurant(prev => ({
            ...prev,
            address: {
                street,
                ward,
                district,
                city,
            },
            addressStreet: street,
            addressWard: ward,
            addressDistrict: district,
            addressCity: city,
            latitude,
            longitude
        }));
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRestaurant((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submit with actual API call
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = await getToken() ?? '';
            if (!token) {
                toast.error("Vui lòng đăng nhập lại");
                return;
            }

            const formData = new FormData();

            Object.entries(restaurant).forEach(([key, value]) => {
                if (
                    key !== 'id' &&
                    key !== 'owner' &&
                    key !== 'foods' &&
                    value !== undefined
                ) {
                    if (key === 'address' && typeof value === 'object') return;
                    formData.append(key, String(value));
                }
            });

            await userApi.restaurant.updateRestaurant(token, restaurantId!, formData);
            toast.success("Đã cập nhật thông tin nhà hàng thành công!");
        } catch (err) {
            console.error("Failed to update restaurant:", err);
            toast.error("Không thể cập nhật thông tin lúc này");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-2 px-1 sm:px-2 space-y-6">
            <PageHeader
                title="Thông tin cơ bản của quán"
                description="Cập nhật tên quán, tọa độ bản đồ đón khách, giờ mở cửa và hotline"
                breadcrumbs={[
                    { label: "Bảng điều khiển", href: `/restaurant/${restaurantId}/edit/statistics` },
                    { label: "Thông tin cơ bản" },
                ]}
            />
            <CommonInfoForm
                restaurant={restaurant}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                saving={saving}
                loading={loading}
                authLoading={authLoading}
                hideAddressInput={true}
                handleAddressSelect={handleAddressSelect}
            />
        </div>
    );
}