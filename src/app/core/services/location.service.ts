import { computed, Injectable, signal } from '@angular/core';
import { LocationAddress } from '../models/location-address';


@Injectable({
    providedIn: 'root'
})
export class LocationService {

    private readonly STORAGE_KEY = 'user_selected_location';

    // =========================================================
    // State
    // =========================================================

    private readonly currentLocationSignal =
        signal<LocationAddress | null>(this.getSavedLocation());

    /**
     * Read-only location signal.
     *
     * Usage:
     *
     * const location = this.locationService.currentLocation();
     *
     * location?.country
     * location?.governorate
     * location?.city
     * location?.area
     * location?.street
     * location?.lat
     * location?.lng
     * location?.address
     * location?.notes
     */
    readonly currentLocation =
        this.currentLocationSignal.asReadonly();


    // =========================================================
    // Computed Values
    // =========================================================

    /**
     * Full address.
     *
     * Example:
     *
     * عمارة 12، شارع المركز، الحي الثاني، السادات، المنوفية، مصر
     */
    readonly displayAddress = computed(() => {

        const location = this.currentLocationSignal();

        if (!location) {
            return 'حدد موقع التوصيل';
        }

        return location.address;
    });


    /**
     * Short address for Navbar.
     *
     * Example:
     *
     * السادات، المنوفية
     */
    readonly displayShortAddress = computed(() => {

        const location = this.currentLocationSignal();

        if (!location) {
            return 'حدد موقع التوصيل';
        }

        const parts = [
            location.city,
            location.governorate
        ].filter(Boolean);

        return parts.length > 0
            ? parts.join('، ')
            : location.address;
    });


    /**
     * Indicates whether a location has been selected.
     */
    readonly hasLocation = computed(() => {

        return this.currentLocationSignal() !== null;

    });


    // =========================================================
    // Public Methods
    // =========================================================

    /**
     * Set user's selected location.
     *
     * This updates:
     *
     * 1. Signal
     * 2. localStorage
     */
    setLocation(location: LocationAddress): void {

        this.currentLocationSignal.set(location);

        this.saveLocation(location);
    }


    /**
     * Clear current location.
     *
     * Removes:
     *
     * 1. Signal state
     * 2. localStorage
     */
    clearLocation(): void {

        this.currentLocationSignal.set(null);

        localStorage.removeItem(this.STORAGE_KEY);
    }


    /**
     * Get user's location using the following strategy:
     *
     * 1. Browser GPS
     * 2. If GPS fails:
     *    - Mobile → throw error
     *    - Desktop → IP location
     */
    async getSmartLocation(): Promise<LocationAddress> {

        try {

            return await this.getCurrentGeoLocation();

        } catch (error) {

            console.warn(
                'GPS location failed:',
                error
            );

            if (this.isMobileDevice()) {

                throw new Error(
                    'يرجى تفعيل الموقع على هاتفك للحصول على عنوان دقيق.'
                );
            }

            return await this.getLocationByIP();
        }
    }


    /**
     * Get precise location using Browser Geolocation API.
     */
    getCurrentGeoLocation(): Promise<LocationAddress> {

        return new Promise((resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        'Geolocation is not supported by this browser.'
                    )
                );

                return;
            }


            navigator.geolocation.getCurrentPosition(

                async (position) => {

                    const lat =
                        position.coords.latitude;

                    const lng =
                        position.coords.longitude;


                    try {

                        const location =
                            await this.reverseGeocode(
                                lat,
                                lng
                            );


                        this.setLocation(location);

                        resolve(location);

                    } catch (error) {

                        console.warn(
                            'Reverse geocoding failed:',
                            error
                        );


                        /**
                         * GPS worked but reverse geocoding failed.
                         *
                         * We still keep the coordinates.
                         */
                        const fallbackLocation =
                            this.createCoordinateLocation(
                                lat,
                                lng
                            );


                        this.setLocation(
                            fallbackLocation
                        );


                        resolve(
                            fallbackLocation
                        );
                    }
                },


                (error) => {

                    reject(
                        new Error(
                            this.getGeolocationErrorMessage(
                                error
                            )
                        )
                    );
                },


                {
                    enableHighAccuracy: true,

                    timeout: 15000,

                    maximumAge: 0
                }
            );
        });
    }


    /**
     * Desktop fallback.
     *
     * Gets approximate location using IP address.
     */
    async getLocationByIP(): Promise<LocationAddress> {

        try {

            const response =
                await fetch(
                    'https://ipapi.co/json/'
                );


            if (!response.ok) {

                throw new Error(
                    `IP location request failed: ${response.status}`
                );
            }


            const data =
                await response.json();


            const location: LocationAddress = {

                address: [
                    data.city,
                    data.region,
                    data.country_name
                ]
                    .filter(Boolean)
                    .join('، ') || 'موقع غير محدد',


                country:
                    data.country_name ?? '',


                governorate:
                    data.region ?? '',


                city:
                    data.city ?? '',


                area: '',


                street: '',


                lat:
                    data.latitude ?? null,


                lng:
                    data.longitude ?? null,


                notes: ''
            };


            this.setLocation(location);


            return location;

        } catch (error) {

            console.error(
                'IP location failed:',
                error
            );


            /**
             * We don't have an accurate location.
             *
             * Return an empty location instead of
             * assuming the user is in Cairo.
             */
            const fallbackLocation =
                this.createEmptyLocation();


            this.setLocation(
                fallbackLocation
            );


            return fallbackLocation;
        }
    }


    // =========================================================
    // Reverse Geocoding
    // =========================================================

    /**
     * Convert latitude/longitude into
     * a detailed address using Nominatim.
     */
    private async reverseGeocode(lat: number, lng: number): Promise<LocationAddress> {

        const url =
            'https://nominatim.openstreetmap.org/reverse' +
            `?format=json` +
            `&lat=${encodeURIComponent(lat)}` +
            `&lon=${encodeURIComponent(lng)}` +
            `&accept-language=ar` +
            `&addressdetails=1`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Reverse geocoding failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        const address =
            data.address ?? {};


        // -----------------------------------------------------
        // Country
        // -----------------------------------------------------

        const country =
            address.country ?? '';


        // -----------------------------------------------------
        // Governorate / State
        // -----------------------------------------------------

        const governorate =
            address.state ??
            address.governorate ??
            '';


        // -----------------------------------------------------
        // City
        // -----------------------------------------------------

        const city =
            address.city ??
            address.town ??
            address.village ??
            address.municipality ??
            address.county ??
            '';


        // -----------------------------------------------------
        // Area / District
        // -----------------------------------------------------

        const area =
            address.suburb ??
            address.neighbourhood ??
            address.quarter ??
            address.residential ??
            address.district ??
            '';


        // -----------------------------------------------------
        // Street
        // -----------------------------------------------------

        const street =
            address.road ??
            address.pedestrian ??
            address.street ??
            '';


        // -----------------------------------------------------
        // Building
        // -----------------------------------------------------

        const building =
            address.house_number ??
            address.building ??
            '';


        // -----------------------------------------------------
        // Street + Building
        // -----------------------------------------------------

        const streetDetails = [

            building
                ? `عمارة ${building}`
                : '',

            street

        ]
            .filter(Boolean)
            .join(' ');


        // -----------------------------------------------------
        // Full Address
        // -----------------------------------------------------

        const fullAddress = [

            streetDetails,

            area,

            city,

            governorate,

            country

        ]
            .filter(Boolean)
            .join('، ');


        // -----------------------------------------------------
        // Return complete object
        // -----------------------------------------------------

        return {

            address:
                fullAddress ||
                'موقع محدد',


            country,

            governorate,

            city,

            area,

            street:
                streetDetails,


            lat,

            lng,

            notes: ''
        };
    }


    // =========================================================
    // Local Storage
    // =========================================================

    /**
     * Restore previously saved location.
     */
    private getSavedLocation(): LocationAddress | null {

        try {

            const saved =
                localStorage.getItem(
                    this.STORAGE_KEY
                );


            if (!saved) {

                return null;
            }


            return JSON.parse(
                saved
            ) as LocationAddress;

        } catch (error) {

            console.error(
                'Failed to restore saved location:',
                error
            );


            localStorage.removeItem(
                this.STORAGE_KEY
            );


            return null;
        }
    }


    /**
     * Save location to localStorage.
     */
    private saveLocation(
        location: LocationAddress
    ): void {

        localStorage.setItem(

            this.STORAGE_KEY,

            JSON.stringify(location)

        );
    }


    // =========================================================
    // Helpers
    // =========================================================

    /**
     * Check whether current device is mobile.
     */
    private isMobileDevice(): boolean {

        return /iPhone|iPad|iPod|Android/i
            .test(navigator.userAgent);
    }


    /**
     * Create location object when GPS coordinates
     * are available but reverse geocoding failed.
     */
    private createCoordinateLocation(
        lat: number,
        lng: number
    ): LocationAddress {

        return {

            address:
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`,

            country: '',

            governorate: '',

            city: '',

            area: '',

            street: '',

            lat,

            lng,

            notes: ''
        };
    }


    /**
     * Empty fallback location.
     *
     * We intentionally don't assume
     * that the user is in a specific city.
     */
    private createEmptyLocation(): LocationAddress {

        return {

            address: 'موقع غير محدد',

            country: '',

            governorate: '',

            city: '',

            area: '',

            street: '',

            lat: null,

            lng: null,

            notes: ''
        };
    }


    /**
     * Convert browser geolocation errors
     * into user-friendly messages.
     */
    private getGeolocationErrorMessage(
        error: GeolocationPositionError
    ): string {

        switch (error.code) {

            case error.PERMISSION_DENIED:

                return (
                    'تم رفض إذن الوصول للموقع، ' +
                    'يرجى السماح بالوصول للموقع ' +
                    'من إعدادات المتصفح.'
                );


            case error.POSITION_UNAVAILABLE:

                return (
                    'بيانات موقع الـ GPS ' +
                    'غير متوفرة حالياً.'
                );


            case error.TIMEOUT:

                return (
                    'استغرق تحديد موقع الـ GPS ' +
                    'وقتاً أطول من المتوقع.'
                );


            default:

                return (
                    'حدث خطأ غير معروف ' +
                    'أثناء تحديد الموقع.'
                );
        }
    }
}