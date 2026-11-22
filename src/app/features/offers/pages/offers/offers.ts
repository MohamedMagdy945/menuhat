import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-offers',
  styleUrl: './offers.css',
  templateUrl: './offers.html',
})
export class Offers {}
