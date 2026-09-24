import { Service, signal } from '@angular/core';

@Service()
export class LoadingService {
    private readonly activeRequests = signal(0);

    readonly isLoading = () => this.activeRequests() > 0;

    show(): void {
        this.activeRequests.update(count => count + 1);
    }

    hide(): void {
        this.activeRequests.update(count => Math.max(0, count - 1));
    }

    reset(): void {
        this.activeRequests.set(0);
    }
}
