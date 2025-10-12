import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Transaction } from '@app/transaction/interface/transaction';
import { Chart } from 'chart.js/auto';
import { ExchangeRateService } from '@app/shared/services/exchange-rate.service';
import { ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-income-expense-pie-chart',
  imports: [],
  templateUrl: './income-expense-pie-chart.component.html'
})
export class IncomeExpensePieChartComponent implements AfterViewInit {

  viewInit = signal<boolean>(false);

  @ViewChild('incomeChart') incomeChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expenseChart') expenseChartCanvas!: ElementRef<HTMLCanvasElement>;

  transactions = input<Transaction[]>();
  _transactions = computed(() => {
    return structuredClone(this.transactions());
  });
  exchangeService = inject(ExchangeRateService);

  incomeChart: Chart | undefined;
  expenseChart: Chart | undefined;

  chartEffect = effect(() => {
    if (this.transactions() && this.transactions()!.length > 0 && this.viewInit()) {
      this.generateCharts();
    }
  });

  ngAfterViewInit(): void {
    this.viewInit.set(true);
  }

  generateCharts() {
    if (this.incomeChart) {
      this.incomeChart.destroy();
    }
    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    let { incomeData, expenseData } = this.generateData();

    this.incomeChart = new Chart(this.incomeChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: incomeData.map((data) => data.label),
        datasets: [{
          label: 'Income',
          data: incomeData.map((data) => data.value),
          backgroundColor: ['#A8E6CE', '#6FFFB0', '#4CAF50', '#FFD700', '#87CEFA'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Income',
            color: '#6FFFB0',
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: '#6FFFB0',
            },

          },
        },
      },
    });

    this.expenseChart = new Chart(this.expenseChartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: expenseData.map((data) => data.label),
        datasets: [{
          label: 'Expense',
          data: expenseData.map((data) => data.value),
          backgroundColor: ['#A8E6CE', '#6FFFB0', '#4CAF50', '#FFD700', '#87CEFA'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Expense',
            color: '#6FFFB0',
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: '#6FFFB0',
            },
          },
        },
      },
    });


  }

  generateData() {
    let incomeTransactions = this._transactions()!.filter((transaction) => transaction.type === 'DEPOSIT' || transaction.type === 'DEPOSIT_GOAL');
    let expenseTransactions = this._transactions()!.filter((transaction) => transaction.type === 'WITHDRAW' || transaction.type === 'WITHDRAW_GOAL');

    let incomeMap = new Map<string, number>();
    let expenseMap = new Map<string, number>();

    incomeTransactions.forEach((transaction) => {
      transaction.amount = this.exchangeService.convert(transaction.account.currency, transaction.amount);
      if (incomeMap.has(transaction.category)) {
        incomeMap.set(transaction.category, incomeMap.get(transaction.category)! + transaction.amount);
      } else {
        incomeMap.set(transaction.category, transaction.amount);
      }
    });

    expenseTransactions.forEach((transaction) => {
      transaction.amount = this.exchangeService.convert(transaction.account.currency, transaction.amount);
      if (expenseMap.has(transaction.category)) {
        expenseMap.set(transaction.category, expenseMap.get(transaction.category)! + transaction.amount);
      } else {
        expenseMap.set(transaction.category, transaction.amount);
      }
    });

    let incomeData: { label: string; value: number }[] = [];
    let expenseData: { label: string; value: number }[] = [];

    incomeMap.forEach((value, key) => {
      incomeData.push({ label: key, value });
    });

    expenseMap.forEach((value, key) => {
      expenseData.push({ label: key, value });
    });

    incomeData.sort((a, b) => b.value - a.value);
    expenseData.sort((a, b) => a.value - b.value);

    return { incomeData: incomeData.slice(0, 5), expenseData: expenseData.slice(0, 5) };
  }

}
