import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'wc-footer-hero',
  templateUrl: './footer-hero.component.html',
  styleUrls: ['./footer-hero.component.scss']
})
export class FooterHeroComponent implements OnInit {

  constructor(
    private route: Router
  ) { }

  ngOnInit(): void {
  }

  clickGenerateUndangan (): void {
    this.route.navigate(['buat-undangan']);
  }

}
