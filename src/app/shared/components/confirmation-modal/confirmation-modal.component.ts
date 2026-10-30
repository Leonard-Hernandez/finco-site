import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

export interface TransactionSummary {
  operationType: 'deposit' | 'withdraw' | 'transfer' | 'deposit_goal' | 'withdraw_goal';
  sourceAccountName: string;
  sourceAccountCurrency: string;
  sourceAccountBalance?: number;
  targetAccountName?: string;
  targetAccountCurrency?: string;
  amount: number;
  fee: number;
  finalAmount: number;
  exchangeRate?: number;
  targetFee?: number;
  totalDeducted?: number;
  category?: string;
  description?: string;
  goalName?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './confirmation-modal.component.html'
})
export class ConfirmationModalComponent {
  @Input() visible: boolean = false;
  @Input() summary: TransactionSummary | null = null;
  @Input() isSubmitting: boolean = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get operationLabel(): string {
    switch (this.summary?.operationType) {
      case 'deposit': return 'Deposit';
      case 'withdraw': return 'Withdraw';
      case 'transfer': return 'Transfer';
      case 'deposit_goal': return 'Deposit to Goal';
      case 'withdraw_goal': return 'Withdraw from Goal';
      default: return '';
    }
  }

  get isTransfer(): boolean {
    return this.summary?.operationType === 'transfer';
  }

  get isWithdraw(): boolean {
    return this.summary?.operationType === 'withdraw';
  }

  get isGoalOperation(): boolean {
    return this.summary?.operationType === 'deposit_goal' || this.summary?.operationType === 'withdraw_goal';
  }

  get hasCurrencyConversion(): boolean {
    return !!this.summary?.exchangeRate && this.summary.exchangeRate > 0;
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
