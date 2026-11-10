import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportService, ComplaintItem } from '../../../../technical-support/services/support-service';

@Component({
  selector: 'app-support-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support-tracking.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportTrackingComponent implements OnInit {
  private readonly supportService = inject(SupportService);

  readonly complaints = signal<ComplaintItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly selectedComplaint = signal<ComplaintItem | null>(null);
  readonly isDetailsModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.isLoading.set(true);
    this.supportService.getComplaints().subscribe({
      next: (list) => {
        this.complaints.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.complaints.set(this.supportService.getDefaultComplaints());
        this.isLoading.set(false);
      },
    });
  }

  openDetails(item: ComplaintItem): void {
    this.selectedComplaint.set(item);
    this.isDetailsModalOpen.set(true);
  }

  closeDetails(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedComplaint.set(null);
  }
}

