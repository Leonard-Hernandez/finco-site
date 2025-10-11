import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { createChart, IChartApi, LineData, LineSeries } from 'lightweight-charts';
import { Transaction, TransactionChartOptions } from '../../interface/transaction';
import { AuthService } from '@app/auth/services/auth.service';
import { ExchangeRateService } from '@app/shared/services/exchange-rate.service';

@Component({
  selector: 'app-transaction-chart',
  imports: [],
  templateUrl: './transaction-chart.component.html'
})
export class TransactionChartComponent {

  transactionChartOptions = input.required<TransactionChartOptions>();
  transactions = computed(() => {
    if (!this.transactionChartOptions().transactions) {
      return [];
    }
    console.log(this.transactionChartOptions().transactions);
    return [...this.transactionChartOptions().transactions];
  });
  series = signal<string[]>([]);
  defaultCurrency = inject(AuthService).user()?.defaultCurrency;
  exchangeService = inject(ExchangeRateService);
  transactionsCount = signal<number>(0);

  chart!: IChartApi;

  classColors = ['text-finco-primary-color', 'text-finco-secondary-color', 'text-finco-button-bg-color', 'text-finco-gold-color', 'text-finco-light-blue-color'];
  chartColors = ['#A8E6CE', '#6FFFB0', '#4CAF50', '#FFD700', '#87CEFA'];

  eff = effect(() => {
    if (this.transactions() && this.transactions().length > 0) {
      console.log(this.transactions());
      this.generateChart();
    }
  })

  priceFormat = (value: number) => value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  generateChart() {
    if (this.chart) {
      this.chart.remove();
      this.series.set([]);
      this.transactionsCount.set(0);
    }

    this.chart = createChart(document.getElementById('statusChart')!, {
      layout: {
        background: { color: '#1B2A34' },
        textColor: '#6FFFB0',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    this.chart.applyOptions({
      localization: {
        priceFormatter: this.priceFormat,
      },
    });

    const areaSeries = this.chart.addSeries(LineSeries, { color: this.chartColors[0] });
    const areaSeries2 = this.chart.addSeries(LineSeries, { color: this.chartColors[1] });
    const areaSeries3 = this.chart.addSeries(LineSeries, { color: this.chartColors[2] });
    const areaSeries4 = this.chart.addSeries(LineSeries, { color: this.chartColors[3] });
    const areaSeries5 = this.chart.addSeries(LineSeries, { color: this.chartColors[4] });

    let seriesMap = this.getSeriesMap();

    let limit = this.transactionChartOptions().limitSeries;

    seriesMap.forEach((value, key) => {
      if (this.series().length < limit) {
        this.series.update((series) => {
          series.push(key);
          return series;
        });
      }
    });

    this.series()[0] ? areaSeries.setData(this.getSeriesData(seriesMap.get(this.series()[0])!)) : null;
    this.series()[1] ? areaSeries2.setData(this.getSeriesData(seriesMap.get(this.series()[1])!)) : null;
    this.series()[2] ? areaSeries3.setData(this.getSeriesData(seriesMap.get(this.series()[2])!)) : null;
    this.series()[3] ? areaSeries4.setData(this.getSeriesData(seriesMap.get(this.series()[3])!)) : null;
    this.series()[4] ? areaSeries5.setData(this.getSeriesData(seriesMap.get(this.series()[4])!)) : null;

    this.chart.timeScale().fitContent();
  }

  getSeriesMap(): Map<string, Transaction[]> {
    let seriesMap = new Map<string, Transaction[]>();

    this.transactions().forEach((transaction) => {

      if (this.transactionChartOptions().convertToDefaultCurrency) {
        transaction.amount = this.exchangeService.convert(transaction.account.currency, transaction.amount);
      }

      if (transaction.type === 'WITHDRAW' || transaction.type === 'DEPOSIT_GOAL') {
        transaction.amount = transaction.amount * -1;
      }
      transaction.date = transaction.date.split('T')[0];

      if (this.transactionChartOptions().splitBy === 'defaultCurrency') {
        if (seriesMap.has(this.defaultCurrency!)) {
          let transactions: Transaction[] = seriesMap.get(this.defaultCurrency!)!;
          transactions.push(transaction);
          seriesMap.set(this.defaultCurrency!, transactions);
        } else {
          seriesMap.set(this.defaultCurrency!, [transaction]);
        }
      } else {
        let key = this.getSeriesKey(transaction);

        if (seriesMap.has(key)) {
          let transactions: Transaction[] = seriesMap.get(key)!;
          transactions.push(transaction);
          seriesMap.set(key, transactions);
        } else {
          seriesMap.set(key, [transaction]);
        }
      }


    });

    return seriesMap;
  }

  getSeriesData(transaction: Transaction[]): LineData[] {
    this.transactionsCount.update((count) => count + transaction.length);

    let map = new Map<string, number>();

    transaction.sort((a, b) => {
      return a.id - b.id;
    });

    transaction.forEach((transaction) => {
      if (map.has(transaction.date)) {
        map.set(transaction.date, map.get(transaction.date)! + transaction.amount);
      } else {
        map.set(transaction.date, transaction.amount);
      }
    });

    let data: LineData[] = [];

    map.forEach((value, key) => {
      data.push({ time: key, value });
    });

    return data;
  }

  getSeriesKey(transaction: Transaction): string {
    if (this.transactionChartOptions().splitBy === 'account') {
      return transaction.account.name;
    } else if (this.transactionChartOptions().splitBy === 'category') {
      return transaction.category;
    } else if (this.transactionChartOptions().splitBy === 'goal') {
      return transaction.goal.name;
    }

    return transaction.account.currency;
  }

}
