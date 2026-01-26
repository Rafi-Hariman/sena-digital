import { Component, OnInit, Input } from '@angular/core';
import { WeddingData, BankAccount } from '../../../services/wedding-data.service';

@Component({
  selector: 'wc-gift-view',
  templateUrl: './gift-view.component.html',
  styleUrls: ['./gift-view.component.scss']
})
export class GiftViewComponent implements OnInit {
  @Input() weddingData: WeddingData | undefined;

  constructor() { }

  ngOnInit(): void {
    console.log('GiftViewComponent initialized with weddingData:', this.weddingData);
  }

  getBankAccounts(): BankAccount[] {
    return this.weddingData?.bank_accounts || [];
  }

  hasBankAccounts(): boolean {
    return !!(this.weddingData?.bank_accounts && this.weddingData.bank_accounts.length > 0);
  }

  getCoupleNames(): string {
    const groomName = this.weddingData?.mempelai?.pria?.nama_panggilan || 'Mempelai Pria';
    const brideName = this.weddingData?.mempelai?.wanita?.nama_panggilan || 'Mempelai Wanita';
    return `${groomName} & ${brideName}`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Account number copied to clipboard');
      // Show a brief visual feedback
      this.showCopyFeedback();
    }).catch(err => {
      console.error('Could not copy text: ', err);
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    });
  }

  private showCopyFeedback(): void {
    // Simple feedback - could be enhanced with toast service later
    // For now, we'll rely on the CSS hover/active states
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('Account number copied using fallback method');
      this.showCopyFeedback();
    } catch (err) {
      console.error('Fallback copy failed:', err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  trackByBankId(index: number, item: BankAccount): number {
    return item.id;
  }
}
