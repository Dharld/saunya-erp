import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  show_modal: boolean = false;

  constructor() {}

  ngOnInit() {}

  closeModal() {
    this.show_modal = false;
    console.log('CLOSE MODAL');
    console.log('this.show_modal', this.show_modal);
  }

  openModal() {
    this.show_modal = true;
    console.log('OPEN MODAL');
    console.log('this.show_modal', this.show_modal);
  }
}
