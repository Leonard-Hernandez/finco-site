import { Component, inject, signal } from '@angular/core';
import { TransactionService } from '../../../transaction/services/transaction.service';
import { TransactionFilter } from '../../../transaction/interface/transaction';
import { Total, TotalComponent } from "../../../shared/components/total/total.component";

@Component({
  selector: 'app-dashboard-page',
  imports: [TotalComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {

    total = signal<Total[]>([
      {
        total: 10000,
        currency: 'USD'
      },
      {
        total: 10000,
        currency: 'MXN'
      },
      {
        total: 100,
        currency: 'EUR'
      },
      {
        total: 100000,
        currency: 'GBP'
      }
    ]);

    transactionsService = inject(TransactionService);

    getCategories() {
        this.transactionsService.GetCategoriesByUser().subscribe((res) => {
            console.log(res);
        });
    }

    getTransactions() {
      const filter: TransactionFilter = {
        pagination: {
          page: 0,
          size: 10,
          sortBy: 'id',
          sortDirection: 'desc'
        }
      };
        this.transactionsService.getTransactions(filter).subscribe((res) => {
            console.log(res);
        });
    }

}
