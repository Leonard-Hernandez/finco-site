import { Component, computed, effect, inject, input } from '@angular/core';
import { Transaction } from '../../interface/transaction';
import { Chart, ChartOptions } from 'chart.js/auto';
import { ExchangeRateService } from '../../../shared/services/exchange-rate.service';

@Component({
  selector: 'app-income-expense-pie-chart',
  imports: [],
  templateUrl: './income-expense-pie-chart.component.html'
})
export class IncomeExpensePieChartComponent {

  transactions = input<Transaction[]>();
  _transactions = computed(() => {
    return structuredClone(this.transactions());
  });
  exchangeService = inject(ExchangeRateService);

  incomeChart: Chart | undefined;
  expenseChart: Chart | undefined;

  chartEffect = effect(() => {
    if (this.transactions() && this.transactions()!.length > 0) {
      this.generateCharts();
    }
  });

  generateCharts() {
    if (this.incomeChart) {
      this.incomeChart.destroy();
    }
    if (this.expenseChart) {
      this.expenseChart.destroy();
    }
    
    let { incomeData, expenseData } = this.generateData();

    this.incomeChart = new Chart(document.getElementById('incomeChart')! as HTMLCanvasElement, {
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

    this.expenseChart = new Chart(document.getElementById('expenseChart')! as HTMLCanvasElement, {
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

    let incomeTransactions = this._transactions()!.filter((transaction) => transaction.type === 'DEPOSIT');
    let expenseTransactions = this._transactions()!.filter((transaction) => transaction.type === 'WITHDRAW');

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
