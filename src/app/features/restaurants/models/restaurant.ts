export interface Restaurant {
    id: number;

    clientName: string;
    clientName_En: string;

    government_Ar: string;
    government_En: string;

    city_Ar: string;
    city_En: string;

    address: string | null;
    address_En: string | null;

    field_Ar: string;
    field_En: string;

    visitsCount: number;

    pdfURL: string;
    logoURL: string | null;

    rate: number | null;
    isSponser: boolean | null;

    serial: string;

    fromTime: string;
    toTime: string;

    latitude: number;
    longitude: number;

    isOpen: boolean;
    statusOpen: number;
}