export interface RestaurantQueryParams {
    PageNumber?: number;
    PageSize?: number;
    SearchValue?: string;
    SortField: string;
    SortDirection?: string;
    Id?: number;
    UserId?: number;
    GovernmentId?: number;
    CityId?: number;
    FieldId?: number;
    lat?: number;
    lon?: number;
}
