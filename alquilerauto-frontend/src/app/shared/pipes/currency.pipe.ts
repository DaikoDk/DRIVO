import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPEN',
  standalone: true
})
export class CurrencyPENPipe implements PipeTransform {
  transform(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'S/ 0.00';
    return `S/ ${num.toFixed(2)}`;
  }
}
