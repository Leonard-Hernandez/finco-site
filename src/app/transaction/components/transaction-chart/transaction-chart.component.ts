import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { AreaData, AreaSeries, createChart, IChartApi, LineData, LineSeries } from 'lightweight-charts';
import { Transaction, TransactionChartOptions } from '../../interface/transaction';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transaction-chart',
  imports: [],
  templateUrl: './transaction-chart.component.html'
})
export class TransactionChartComponent {

  transactionChartOptions = input.required<TransactionChartOptions>();
  series = signal<string[]>([]);
  transactionsCount = computed(() => {
    if (this.transactionChartOptions().transactions !== undefined && this.transactionChartOptions().transactions.length > 0) {
      return this.transactionChartOptions().transactions.length;
    }
    return 0;
  });

  chart: IChartApi | undefined;
  classColors = ['text-finco-primary-color', 'text-finco-secondary-color', 'text-finco-button-bg-color'];
  chartColors = ['#A8E6CE', '#6FFFB0', '#4CAF50'];

  eff = effect(() => {
    if (this.transactionChartOptions().transactions !== undefined && this.transactionChartOptions().transactions.length > 0) {
      this.createChart(this.transactionChartOptions());
    }
  })

  createChart(transactionChartOptions: TransactionChartOptions) {
    const firstChart: IChartApi = createChart(document.getElementById('statusChart')!, {
      layout: {
        background: { color: '#1B2A34' },
        textColor: '#6FFFB0',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
    });

    const areaSeries = firstChart.addSeries(LineSeries, { color: this.chartColors[0] });
    const areaSeries2 = firstChart.addSeries(LineSeries, { color: this.chartColors[1] });
    const areaSeries3 = firstChart.addSeries(LineSeries, { color: this.chartColors[2] });

    let mapCurrency = this.getCurrencyMap();

    mapCurrency.forEach((value, key) => {
      this.series().push(key);
    });

    this.series()[0] ? areaSeries.setData(this.getSeriesData(mapCurrency.get(this.series()[0])!)) : null;
    this.series()[1] ? areaSeries2.setData(this.getSeriesData(mapCurrency.get(this.series()[1])!)) : null;
    this.series()[2] ? areaSeries3.setData(this.getSeriesData(mapCurrency.get(this.series()[2])!)) : null;

    firstChart.timeScale().fitContent();

    return firstChart;
  }

  getCurrencyMap(): Map<string, Transaction[]> {
    let mapCurrency = new Map<string, Transaction[]>();
    this.transactionChartOptions().transactions.forEach((transaction) => {
      if (transaction.type === 'WITHDRAW' || transaction.type === 'DEPOSIT_GOAL') {
        transaction.amount = transaction.amount * -1;
      }
      transaction.date = transaction.date.split('T')[0];

      if (mapCurrency.has(transaction.currency)) {
        let transactions: Transaction[] = mapCurrency.get(transaction.currency)!;
        transactions.push(transaction);
        mapCurrency.set(transaction.currency, transactions);
      } else {
        mapCurrency.set(transaction.currency, [transaction]);
      }

    });

    return mapCurrency;
  }

  getSeriesData(transaction: Transaction[]): LineData[] {

    let map = new Map<string, number>();

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

}
