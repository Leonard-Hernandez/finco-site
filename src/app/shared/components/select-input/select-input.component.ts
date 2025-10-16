import { Component, input, output } from '@angular/core';

export type selectInput = {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-input',
  imports: [],
  templateUrl: './select-input.component.html'
})
export class SelectInputComponent {

  label = input<string>('');

  values = input<selectInput[]>([]);

  value = output<string>();

  updateValue(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.value.emit(value);
  }


}
