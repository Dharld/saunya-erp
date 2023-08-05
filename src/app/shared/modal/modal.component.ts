import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() show_modal: boolean = false;

  constructor() {}

  ngOnInit() {}

  closeModal() {
    this.show_modal = false;
  }

  openModal() {
    this.show_modal = true;
    console.log("I'm opened");
  }
}
