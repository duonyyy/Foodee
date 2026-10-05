"use client";
import React, { createContext, useContext } from "react";
import { useEffect, useState } from "react";

interface GeoLocation {
  lat: number;
  lng: number;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus('unsupported');
      setError("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          const updateStatus = () => {
            if (result.state === 'granted') {
              setStatus('granted');
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  });
                  setError(null);
                },
                (err) => {
                  console.error("Error getting cached location:", err);
                }
              );
            } else if (result.state === 'denied') {
              setStatus('denied');
              setError("Bạn đã từ chối quyền truy cập vị trí.");
              setLocation(null);
            } else {
              setStatus('idle');
              setLocation(null);
            }
          };

          updateStatus();
          result.onchange = updateStatus;
        })
        .catch((err) => {
          console.error("Error querying geolocation permissions:", err);
        });
    }
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setStatus('unsupported');
      setError("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setLoading(true);
    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
        setStatus('granted');
      },
      (err) => {
        console.error("Error getting location:", err);
        let errorMessage = "Bạn cần cho phép truy cập vị trí để sử dụng dịch vụ.";
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          errorMessage = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật định vị trong cài đặt trình duyệt!";
        } else {
          setStatus('denied');
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return { location, error, loading, status, requestLocation };
}

// --- Add below this line ---

const GeoLocationContext = createContext<ReturnType<typeof useGeoLocation> | null>(null);

export const GeoLocationProvider = ({ children }: { children: React.ReactNode }) => {
  const geo = useGeoLocation();
  return (
    <GeoLocationContext.Provider value={geo}>
      {children}
    </GeoLocationContext.Provider>
  );
};

export const useGeo = () => {
  const ctx = useContext(GeoLocationContext);
  if (!ctx) throw new Error("useGeo must be used within GeoLocationProvider");
  return ctx;
};