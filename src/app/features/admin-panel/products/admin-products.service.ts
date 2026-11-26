import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_API_ENDPOINTS } from '../../../core/constants/admin-api.constants';
import { AdminMenuFilePayload } from '../restaurants/models/admin-menu-file-payload.model';
import { AdminMenuPreparedInsert } from '../restaurants/models/admin-menu-prepared-insert.model';
import { AdminProduct } from './models/admin-product.model';
import { AdminProductPriceRequest } from './models/admin-product-price-request.model';
import { AdminProductRecord } from './models/admin-product-record.model';
import { AdminProductRequest } from './models/admin-product-request.model';
import { AdminProductsQuery } from './models/admin-products-query.model';
import { AdminProductsResponse } from './models/admin-products-response.model';

/** Platform-admin products (Admin/*Product endpoints). */
@Injectable({
  providedIn: 'root',
})
export class AdminProductsService {
  private readonly _http = inject(HttpClient);

  /** GET /Admin/GetAllProducts — newest first; filter by restaurant, main or sub category. */
  getProducts(query: AdminProductsQuery): Observable<AdminProductsResponse> {
    let params = new HttpParams()
      .set('SortField', 'Id')
      .set('SortDirection', 'desc')
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize);

    const search = query.searchValue?.trim();
    if (search) params = params.set('SearchValue', search);
    if (query.menuId) params = params.set('MenuId', query.menuId);
    if (query.menuCategoryId) params = params.set('MenuCategoryId', query.menuCategoryId);
    if (query.menuSubCategoryId) params = params.set('MenuSubCategoryId', query.menuSubCategoryId);

    return this._http
      .get<{
        listWithDetails?: AdminProduct[];
        itemsCount?: number;
        totalPages?: number;
      }>(ADMIN_API_ENDPOINTS.allProducts, { params })
      .pipe(
        map((res) => ({
          items: Array.isArray(res?.listWithDetails) ? res.listWithDetails : [],
          itemsCount: res?.itemsCount ?? 0,
          totalPages: res?.totalPages ?? 1,
        })),
      );
  }

  /** GET /Admin/GetProduct/{id} — `result` is an array of one product. */
  getProduct(id: number): Observable<AdminProductRecord> {
    return this._http
      .get<{
        result: AdminProductRecord[] | AdminProductRecord;
      }>(`${ADMIN_API_ENDPOINTS.productById}/${id}`)
      .pipe(map((res) => (Array.isArray(res.result) ? res.result[0] : res.result)));
  }

  /** GET /Admin/PreparedForInsertProduct */
  getPreparedInsert(): Observable<AdminMenuPreparedInsert> {
    return this._http.get<AdminMenuPreparedInsert>(ADMIN_API_ENDPOINTS.preparedForInsertProduct);
  }

  /** POST /Admin/AddMenuProduct/{menuSerial} — serial of the categories' own restaurant. */
  createProduct(menuSerial: string, request: AdminProductRequest): Observable<unknown> {
    return this._http.post(
      `${ADMIN_API_ENDPOINTS.createProduct}/${encodeURIComponent(menuSerial)}`,
      request,
    );
  }

  /** PUT /Admin/UpdateMenuProduct/{id} */
  updateProduct(id: number, request: AdminProductRequest): Observable<unknown> {
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateProduct}/${id}`, request);
  }

  /** POST /Admin/AddMenuProductPrice?MenuProductId={productId} */
  addPrice(productId: number, request: AdminProductPriceRequest): Observable<unknown> {
    const params = new HttpParams().set('MenuProductId', productId);
    return this._http.post(ADMIN_API_ENDPOINTS.addProductPrice, request, { params });
  }

  /** DELETE /Admin/DeleteProductPrice/{detailId} */
  deletePrice(detailId: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteProductPrice}/${detailId}`);
  }

  /** PUT /Admin/UpdatePhotoProduct/{id} — `dataUrl` must keep its `data:…;base64,` prefix. */
  updatePhoto(id: number, dataUrl: string): Observable<unknown> {
    const body: AdminMenuFilePayload = { base64String: dataUrl };
    return this._http.put(`${ADMIN_API_ENDPOINTS.updateProductPhoto}/${id}`, body);
  }

  /** DELETE /Admin/DeletePhotoProduct/{id} */
  deletePhoto(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteProductPhoto}/${id}`);
  }

  /** DELETE /Admin/DeleteProduct/{id} */
  deleteProduct(id: number): Observable<unknown> {
    return this._http.delete(`${ADMIN_API_ENDPOINTS.deleteProduct}/${id}`);
  }
}
