import { Pipe, PipeTransform } from '@angular/core';
import { VentesService } from '../services/ventes.service';
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  constructor(private venteService: VentesService) {}

  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter((it) => {
      return (
        it.president.toLowerCase().includes(searchText) ||
        it.party.toLowerCase().includes(searchText) ||
        it.took_office.toLowerCase().includes(searchText)
      );
    });
  }
}
