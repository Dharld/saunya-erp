import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  @Output() searchText: EventEmitter<string> = new EventEmitter();

  focus = false;

  constructor() {}

  ngOnInit() {}

  handleInput(search: string) {
    this.searchText.next(search);
  }

  addFocus() {
    this.focus = true;
  }

  removeFocus() {
    this.focus = false;
  }
}
