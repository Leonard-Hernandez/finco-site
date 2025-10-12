import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  imports: [],
  templateUrl: './toggle-switch.component.html'
})
export class ToggleSwitchComponent {

  label = input<string>('');

  checked = input<boolean>(false);

  changed = output<boolean>();

  onToggle() {
    this.changed.emit(!this.checked());
  }

}
