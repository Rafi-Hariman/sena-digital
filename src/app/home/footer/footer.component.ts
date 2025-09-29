import { Component, OnInit } from '@angular/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'; 
import { far } from '@fortawesome/free-regular-svg-icons'; 
import { fab } from '@fortawesome/free-brands-svg-icons'; 
@Component({
  selector: 'wc-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  Cssclass: boolean = false;

  constructor() {
    library.add(fas,fab,far)
  }

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
}
