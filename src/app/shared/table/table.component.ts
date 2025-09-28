import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface TableColumn {
  name: string;
  prop: string;
  type?: 'text' | 'html' | 'boolean';
}

@Component({
  selector: 'wc-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() rows: Array<any> = [];
  @Input() columns: TableColumn[] = [];
  @Input() actionTitle: string = '';

  @Output() confirmClicked = new EventEmitter<any>();
  @Output() editClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();

  rowsPerPageOptions: number[] = [5, 10, 20, 50, 100, 500];
  rowsPerPage: number = 5;
  currentPage: number = 1;

  constructor() {}

  ngOnInit(): void {}

  // Hitung total halaman
  get totalPages(): number {
    return Math.ceil(this.rows.length / this.rowsPerPage);
  }

  // Dapatkan data sesuai halaman yang dipilih
  get paginatedRows(): Array<any> {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.rows.slice(start, end);
  }

  // Navigasi halaman
  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Ubah jumlah baris per halaman
  onRowsPerPageChange(newRowsPerPage: number): void {
    this.rowsPerPage = newRowsPerPage;
    this.currentPage = 1; // Reset ke halaman pertama
  }
}
