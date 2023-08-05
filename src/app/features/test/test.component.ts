import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AnimationController,
  DomController,
  GestureController,
  IonHeader,
  ToastController,
} from '@ionic/angular';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit, AfterViewInit {
  @ViewChildren('container', { read: ElementRef })
  itemContainer!: QueryList<ElementRef>;
  myArr = [1, 2, 3, 4, 5, 6, 7, 8];

  constructor(
    private gestureCtrl: GestureController,
    private animationCtr: AnimationController,
    private domCtrl: DomController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    const windowWidth = window.innerWidth;
    const containerArray = this.itemContainer.toArray();

    for (let el of containerArray) {
      const containerElement = el.nativeElement;
      const itemElement = containerElement.childNodes[0];

      const deleteAnimation = this.animationCtr
        .create()
        .addElement(containerElement)
        .duration(200)
        .easing('ease-out')
        .fromTo('height', '48px', '0');

      const swipeGesture = this.gestureCtrl.create({
        el: itemElement,
        threshold: 15,
        direction: 'x',
        gestureName: 'swipe-delete',
        onMove: (ev) => {
          const currentX = ev.deltaX;

          this.domCtrl.write(() => {
            itemElement.style.zIndex = 2;
            itemElement.style.transform = `translateX(${currentX}px)`;
          });
        },

        onEnd: (ev) => {
          itemElement.style.transition = '0.2s ease-out';

          if (ev.deltaX < -150) {
            this.domCtrl.write(() => {
              itemElement.style.transform = `translate3d(-${windowWidth}px, 0, 0)`;
            });
            deleteAnimation.play();
          }
        },
      });
    }
  }

  increasePower(timeout = 200) {}
}
