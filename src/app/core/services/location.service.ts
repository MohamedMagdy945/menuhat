import { Injectable, signal, computed } from '@angular/core';

export interface LocationAddress {
    address: string;      // Full detailed address string (e.g., "عمارة 12، شارع المركز، الحي الثاني، السادات، المنوفية، مصر")
    lat?: number;         // Latitude
    lng?: number;         // Longitude
    country?: string;     // Country (e.g., "مصر")
    governorate?: string; // Governorate/State (e.g., "المنوفية")
    city?: string;        // City/Town (e.g., "السادات")
    area?: string;        // District/Neighbourhood (e.g., "الحي الثاني")
    street?: string;      // Street name or building detail
    notes?: string;       // Additional delivery notes
}

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private readonly STORAGE_KEY = 'user_selected_location';

    // 1. Primary Signal holding the active location state
    private currentLocationSignal = signal<LocationAddress | null>(this.getSavedLocation());

    // 2. Readonly Signal exposed externally
    currentLocation = this.currentLocationSignal.asReadonly();

    // 3. Computed Signal returning formatted display text for Navbar
    displayAddress = computed(() => {
        const loc = this.currentLocationSignal();
        return loc ? loc.address : 'حدد موقع التوصيل';
    });

    constructor() { }

    /**
     * Sets and updates user location manually or programmatically
     */
    setLocation(location: LocationAddress): void {
        this.currentLocationSignal.set(location);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(location));
    }

    /**
     * Smart location retriever with multi-device support
     */
    async getSmartLocation(): Promise<LocationAddress> {
        try {
            // Always prioritize accurate device Geolocation (GPS)
            return await this.getCurrentGeoLocation();
        } catch (error) {
            console.warn('GPS Geolocation failed or permission denied:', error);

            // Check if user is on mobile; avoid IP fallback as mobile IPs route incorrectly
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                throw new Error('يرجى تفعيل خيار موقع الـ GPS على هاتفك للحصول على عنوان دقيق.');
            }

            // Fallback for Desktop devices only
            return await this.getLocationByIP();
        }
    }

    /**
     * Fetches precise location via Browser Geolocation API
     */
    getCurrentGeoLocation(): Promise<LocationAddress> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject('Geolocation is not supported by this browser.');
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    try {
                        // Reverse geocode to get fully detailed address
                        const addressData = await this.reverseGeocode(lat, lng);
                        this.setLocation(addressData);
                        resolve(addressData);
                    } catch (error) {
                        const fallbackLocation: LocationAddress = {
                            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            lat,
                            lng
                        };
                        this.setLocation(fallbackLocation);
                        resolve(fallbackLocation);
                    }
                },
                (error) => {
                    reject(this.getGeolocationErrorMessage(error));
                },
                {
                    enableHighAccuracy: true, // Forces physical GPS on mobile devices
                    timeout: 15000,           // Increased timeout to 15s for mobile GPS fix
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Desktop Fallback: Estimates location using user's IP Address
     */
    async getLocationByIP(): Promise<LocationAddress> {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            const addressData: LocationAddress = {
                address: [data.city, data.region, data.country_name].filter(Boolean).join('، ') || 'موقع غير محدد',
                country: data.country_name,
                governorate: data.region,
                city: data.city,
                lat: data.latitude,
                lng: data.longitude
            };

            this.setLocation(addressData);
            return addressData;
        } catch (error) {
            const defaultLocation: LocationAddress = {
                address: 'القاهرة، مصر'
            };
            this.setLocation(defaultLocation);
            return defaultLocation;
        }
    }

    /**
     * Reverse Geocodes coordinates using OpenStreetMap Nominatim API
     * Formats response to extract: Country, Governorate, City, District/Area, Street & Building
     */
    private async reverseGeocode(lat: number, lng: number): Promise<LocationAddress> {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&addressdetails=1`
        );
        const data = await response.json();
        const addr = data.address || {};

        // 1. Extract granular address parameters
        const country = addr.country || '';
        const governorate = addr.state || addr.governorate || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || '';
        const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.district || '';
        const street = addr.road || addr.pedestrian || addr.street || '';
        const building = addr.house_number || addr.building || '';

        // 2. Build street/building string if available
        const streetAndBuilding = [building ? `عمارة ${building}` : '', street].filter(Boolean).join(' ');

        // 3. Construct detailed full address string in hierarchical order
        // Order: Street/Building -> Area -> City -> Governorate -> Country
        const addressParts = [
            streetAndBuilding,
            area,
            city,
            governorate,
            country
        ].filter(Boolean);

        const formattedAddress = addressParts.length > 0 ? addressParts.join('، ') : 'موقع محدد';

        return {
            address: formattedAddress,
            lat,
            lng,
            country,
            governorate,
            city,
            area,
            street: streetAndBuilding
        };
    }

    /**
     * Restores previously saved location from localStorage
     */
    private getSavedLocation(): LocationAddress | null {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    }

    /**
     * Maps GeolocationPositionError codes to readable messages
     */
    private getGeolocationErrorMessage(error: GeolocationPositionError): string {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'تم رفض إذن الوصول للموقع، يرجى السماح للوصول للموقع من إعدادات الهاتف.';
            case error.POSITION_UNAVAILABLE:
                return 'بيانات موقع الـ GPS غير متوفرة حالياً.';
            case error.TIMEOUT:
                return 'استغرق تحديد موقع الـ GPS وقتاً أطول من المتوقع.';
            default:
                return 'حدث خطأ غير معروف أثناء تحديد الموقع.';
        }
    }
}