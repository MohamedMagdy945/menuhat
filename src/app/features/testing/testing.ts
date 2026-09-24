import { Component } from '@angular/core';

@Component({
  selector: 'app-test-loading',
  templateUrl: './testing.html',
  styleUrls: ['./testing.css']
})
export class TestLoadingComponent {

  
  // Loading state variable
  isLoading: boolean = true;

  // Toggle loading state on and off manually
  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  // Simulate a 3-second API request to test auto-hide
  triggerLoadingTest(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
    }, 3000); // Automatically hides after 3 seconds
  }
}