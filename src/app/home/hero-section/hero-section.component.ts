import { Component, OnInit } from '@angular/core';
import { Router, NavigationError, NavigationEnd } from '@angular/router';

@Component({
  selector: 'wc-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Navigation End:', event);
      }
      if (event instanceof NavigationError) {
        console.error('Navigation Error:', event.error);
      }
    });
  }

  clickGenerateUndangan(){
    this.router.navigate(['/buat-undangan']).then(success => {
      if (success) {
        console.log('Navigation successful!');
      } else {
        console.log('Navigation failed!');
      }
    });
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
