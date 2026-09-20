import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ResponsiveService {
    private readonly breakpointObserver = inject(BreakpointObserver);

    readonly isMobile = toSignal(
        this.breakpointObserver
            .observe('(max-width: 767px)')
            .pipe(
                map(result => result.matches)
            ),
        {
            initialValue: false
        }
    );
}