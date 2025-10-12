import { effect, inject, Injectable, signal } from "@angular/core";
import { AuthService } from "@app/auth/services/auth.service";
import { environment } from "@src/environments/environment.local";

@Injectable({
    providedIn: 'root'
})
export class ExchangeRateService {

    baseurl = environment.exchangeApiUrl;
    defaultCurrency = signal<string>(inject(AuthService).user()?.defaultCurrency! || 'USD');

    exchangeRate = signal<any>(null);

    exchangeRateEffec = effect(
        () => {
            const response = fetch(`${this.baseurl}${this.defaultCurrency().toLowerCase()}.min.json`);
            response.then((resp) => resp.json()).then((data) => this.exchangeRate.set(data));
        }
    )

    convert(fromCurrency: string, amount: number): number {

        if (fromCurrency === this.defaultCurrency() || this.exchangeRate() === null) {
            return amount;
        }

        return amount / this.exchangeRate()?.[this.defaultCurrency().toLowerCase()]?.[fromCurrency.toLowerCase()];

    }

}
