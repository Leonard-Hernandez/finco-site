import { Component, input, OnInit } from '@angular/core';
import { AreaData, AreaSeries, createChart, IChartApi, LineData, LineSeries } from 'lightweight-charts';
import { Transaction } from '../../interface/transaction';

@Component({
  selector: 'app-transaction-chart',
  imports: [],
  templateUrl: './transaction-chart.component.html'
})
export class TransactionChartComponent implements OnInit{

  transactions = input.required<Transaction[]>();

  ngOnInit(): void {
    this.createChart();
  }

  createChart() {
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

    const areaSeries = firstChart.addSeries(AreaSeries, { lineColor: '#A8E6CE', topColor: '#6FFFB0', bottomColor: 'rgba(41, 98, 255, 0.28)' });

    let map = new Map<string, number>();

    this.transactions().forEach((transaction) => {
      let amount = transaction.amount;
      if(transaction.type === 'WITHDRAW' || transaction.type === 'DEPOSIT_GOAL'){
        amount = transaction.amount * -1;
      }
      const date = transaction.date.split('T')[0];

      if(map.has(date)){
        map.set(date, map.get(date)! + amount);
      }else{
        map.set(date, amount);
      }
    });

    const data: AreaData[] = [];

    map.forEach((value, key) => {
      data.push({ time: key, value });
    });

    areaSeries.setData(data);

    firstChart.timeScale().fitContent();

    return firstChart;
  }

}
