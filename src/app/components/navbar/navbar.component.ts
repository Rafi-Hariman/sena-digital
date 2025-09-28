import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'wc-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  Cssclass: boolean = false;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.Cssclass = false;
  }

  onClick(): void {
    // Toggle the Cssclass property to show/hide mobile menu
    this.Cssclass = !this.Cssclass;
  }

  // Function to navigate to a specific section on the page and hide the navbar
  navigate(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.Cssclass = false; // Hide the mobile menu after navigating
  }

  clickButton() {
    console.log('Button clicked');
    this.router.navigate(['/login']).then(success => {
      if (success) {
        console.log('Navigation successful!');
      } else {
        console.log('Navigation failed!');
      }
    });
  }
}
