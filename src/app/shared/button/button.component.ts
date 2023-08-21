import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() text = '';
  @Input() trailingIcon = '';
  @Input() state = '';
  @Input() styles: string = '';
  @Input() type = 'button';
  @Input() loading = false;
  @Input() blueLoading = false;
  @Input() fab = false;

  constructor() {}

  ngOnInit() {}
}
