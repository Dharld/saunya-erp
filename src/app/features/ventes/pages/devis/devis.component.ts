import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import {
  AnimationController,
  DomController,
  GestureController,
} from '@ionic/angular';
import { map } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { OdooService } from 'src/app/core/services/odoo.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
})
export class DevisComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalComponent) modal!: ModalComponent;
  @ViewChildren('container', { read: ElementRef })
  containers!: QueryList<ElementRef>;
  devis$ = this.ventesService.devisAsObservable().pipe(
    map((arr) =>
      arr.sort((d1, d2) => {
        return d1.client_name.localeCompare(d2.client_name);
      })
    )
  );

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private ventesService: VentesService,
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController,
    private domCtrl: DomController,
    private odooService: OdooService
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    const itemsArr = this.containers.toArray();

    for (let el of itemsArr) {
      const containerEl = el.nativeElement;
      let containerSibling = (containerEl as HTMLDivElement)
        .nextSibling as HTMLDivElement;

      const itemEl = el.nativeElement.childNodes[0];

      const deleteAnimation = this.animationCtrl
        .create()
        .addElement(containerEl)
        .duration(200)
        .easing('cubic-bezier(.25,.1,.25,1)')
        .fromTo('height', '55px', '0')
        .beforeAddClass('to-delete')
        .afterAddClass('deleted')
        .afterRemoveClass('to-delete');

      const gesture = this.gestureCtrl.create({
        el: itemEl,
        threshold: 0,
        gestureName: 'swipe-delete',
        onStart: () => {
          console.log('Gesture started');
        },
        onMove: (ev) => {
          const currentX = ev.deltaX;
          if (ev.deltaX < -50) {
            return;
          }
          this.domCtrl.write(() => {
            itemEl.style.transform = `translate3d(${currentX}px,0,0)`;
          });
        },
        // onEnd: (ev) => {
        //   itemEl.style.transition = '0.2s ease-out';

        //   if (ev.deltaX < -50) {
        //     this.domCtrl.write(() => {
        //       confirm('Do you want to delete this Devis ?');
        //       deleteAnimation.play();
        //       deleteAnimation.onFinish(() => {
        //         (containerEl as HTMLDivElement).remove();
        //         containerSibling = containerEl.nextSibling;
        //       });
        //     });
        //   } else {
        //     this.domCtrl.write(() => {
        //       itemEl.style.transform = `translateX(0)`;
        //     });
        //   }
        // },
      });
      gesture.enable(true);
    }
  }

  createNewDevis() {
    this.navigation.navigateTo(['new'], this.route);
  }

  editDevis(devis: Devis) {
    this.ventesService.nextEditedDevis(devis);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }
}
