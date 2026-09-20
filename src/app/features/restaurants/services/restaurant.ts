import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Restaurant } from '../models/restaurant';
import { PageData } from '../../../shared/models/pagination/page-data';


@Injectable({
    providedIn: 'root'
})
export class RestaurantService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl = environment.apiUrl + 'restaurants';


    // =========================
    // All Menus
    // =========================

    readonly allMenus = signal<Restaurant[]>([]);
    readonly allMenusPage = signal(1);
    readonly allMenusLoading = signal(false);
    readonly allMenusHasNext = signal(true);

    loadAllMenus(): void {
        if (this.allMenusLoading() || !this.allMenusHasNext()) {
            return;
        }

        this.allMenusLoading.set(true);

        this.http
            .get<PageData<Restaurant>>(`${this.apiUrl}/GetAllMenus`, {
                params: {
                    SortField: 'id',
                    PageNumber: this.allMenusPage(),
                    PageSize: 10
                }
            })
            .subscribe({
                next: response => {
                    this.allMenus.update(current => [
                        ...current,
                        ...response.result
                    ]);
                    if (this.allMenusPage() >= response.totalPages) {
                        this.allMenusHasNext.set(false);
                    }

                    this.allMenusPage.update(page => page + 1);
                    this.allMenusLoading.set(false);
                },
                error: () => {
                    this.allMenusLoading.set(false);
                }
            });
    }

    // =========================
    // Trending
    // =========================

    readonly trending = signal<Restaurant[]>([]);
    readonly trendingPage = signal(1);
    readonly trendingLoading = signal(false);
    readonly trendingHasNext = signal(true);

    loadTrending(): void {
        if (this.trendingLoading() || !this.trendingHasNext()) {
            return;
        }

        this.trendingLoading.set(true);

        this.http
            .get<PageData<Restaurant>>(`${this.apiUrl}/trending`, {
                params: {
                    page: this.trendingPage(),
                    pageSize: 10
                }
            })
            .subscribe({
                next: response => {
                    this.trending.update(current => [
                        ...current,
                        ...response.result
                    ]);

                    if (this.trendingPage() >= response.totalPages) {
                        this.trendingHasNext.set(false);
                    }

                    this.trendingPage.update(page => page + 1);
                    this.trendingLoading.set(false);
                },
                error: () => {
                    this.trendingLoading.set(false);
                }
            });
    }


    // =========================
    // Most Visited
    // =========================

    readonly mostVisited = signal<Restaurant[]>([]);
    readonly mostVisitedPage = signal(1);
    readonly mostVisitedLoading = signal(false);
    readonly mostVisitedHasNext = signal(true);

    loadMostVisited(): void {
        if (this.mostVisitedLoading() || !this.mostVisitedHasNext()) {
            return;
        }

        this.mostVisitedLoading.set(true);

        this.http
            .get<PageData<Restaurant>>(`${this.apiUrl}/most-visited`, {
                params: {
                    page: this.mostVisitedPage(),
                    pageSize: 10
                }
            })
            .subscribe({
                next: response => {
                    this.mostVisited.update(current => [
                        ...current,
                        ...response.result
                    ]);

                    if (this.mostVisitedPage() >= response.totalPages) {
                        this.mostVisitedHasNext.set(false);
                    }

                    this.mostVisitedPage.update(page => page + 1);
                    this.mostVisitedLoading.set(false);
                },
                error: () => {
                    this.mostVisitedLoading.set(false);
                }
            });
    }


    // =========================
    // Most Ordered
    // =========================

    readonly mostOrdered = signal<Restaurant[]>([]);
    readonly mostOrderedPage = signal(1);
    readonly mostOrderedLoading = signal(false);
    readonly mostOrderedHasNext = signal(true);

    loadMostOrdered(): void {
        if (this.mostOrderedLoading() || !this.mostOrderedHasNext()) {
            return;
        }

        this.mostOrderedLoading.set(true);

        this.http
            .get<PageData<Restaurant>>(`${this.apiUrl}/most-ordered`, {
                params: {
                    page: this.mostOrderedPage(),
                    pageSize: 10
                }
            })
            .subscribe({
                next: response => {
                    this.mostOrdered.update(current => [
                        ...current,
                        ...response.result
                    ]);

                    if (this.mostOrderedPage() >= response.totalPages) {
                        this.mostOrderedHasNext.set(false);
                    }

                    this.mostOrderedPage.update(page => page + 1);
                    this.mostOrderedLoading.set(false);
                },
                error: () => {
                    this.mostOrderedLoading.set(false);
                }
            });
    }


    // =========================
    // Top Rated
    // =========================

    readonly topRated = signal<Restaurant[]>([]);
    readonly topRatedPage = signal(1);
    readonly topRatedLoading = signal(false);
    readonly topRatedHasNext = signal(true);

    loadTopRated(): void {
        if (this.topRatedLoading() || !this.topRatedHasNext()) {
            return;
        }

        this.topRatedLoading.set(true);

        this.http
            .get<PageData<Restaurant>>(`${this.apiUrl}/top-rated`, {
                params: {
                    page: this.topRatedPage(),
                    pageSize: 10
                }
            })
            .subscribe({
                next: response => {
                    this.topRated.update(current => [
                        ...current,
                        ...response.result
                    ]);

                    if (this.topRatedPage() >= response.totalPages) {
                        this.topRatedHasNext.set(false);
                    }

                    this.topRatedPage.update(page => page + 1);
                    this.topRatedLoading.set(false);
                },
                error: () => {
                    this.topRatedLoading.set(false);
                }
            });
    }
}