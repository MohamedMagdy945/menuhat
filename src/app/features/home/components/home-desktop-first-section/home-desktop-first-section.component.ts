import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

@Component({
  selector: 'app-home-desktop-first-section',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home-desktop-first-section.component.html',
  styleUrl: './home-desktop-first-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeDesktopFirstSection {}

