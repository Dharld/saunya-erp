import { Pipe, PipeTransform } from '@angular/core';
import { VentesService } from '../services/ventes.service';
import {
  BehaviorSubject,
  Observable,
  debounce,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs';
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  devis!: any[];
  searchText: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private venteService: VentesService) {}

  transform(items: any[] | null, searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;
    this.searchText.next(searchText.toLowerCase());
    return this.devis;
  }
}
