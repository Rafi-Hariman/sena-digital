import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'wc-data-website',
  templateUrl: './data-website.component.html',
  styleUrls: ['./data-website.component.scss']
})
export class DataWebsiteComponent implements OnInit {

  brideData = {
    fullName: '',
    nickname: '',
    fatherName: '',
    motherName: '',
  };

  groomData = {
    fullName: '',
    nickname: '',
    fatherName: '',
    motherName: '',
  };
  
  constructor() { }

  ngOnInit(): void {
  }
 

  uploadPhoto(section: string): void {
    console.log(`Uploading photo for ${section}`);
  }

  saveData(section: string): void {
    console.log(`Saving data for ${section}`);
    if (section === 'wanita') {
      console.log(this.brideData);
    } else if (section === 'pria') {
      console.log(this.groomData);
    }
  }
}
