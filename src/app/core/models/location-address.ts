export interface LocationAddress {
    address: string; // Full detailed address string (e.g., "عمارة 12، شارع المركز، الحي الثاني، السادات، المنوفية، مصر")

    country: string; // Country (e.g., "مصر")
    governorate: string; // Governorate/State (e.g., "المنوفية")
    city: string;  // City/Town (e.g., "السادات")
    area: string; // District/Neighbourhood (e.g., "الحي الثاني")
    street: string; // Street name or building detail

    lat: number | null; // Latitude
    lng: number | null; // Longitude

    notes: string;  // Additional delivery notes
}
