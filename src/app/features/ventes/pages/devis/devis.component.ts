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
  ToastController,
} from '@ionic/angular';
import { Observable, map, tap } from 'rxjs';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { ButtonComponent } from 'src/app/shared/button/button.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { States } from 'src/utils/states';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
})
export class DevisComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalComponent) modal!: ModalComponent;
  devisToDelete: Devis | null = null;

  @ViewChildren('container', { read: ElementRef })
  containers!: QueryList<ElementRef>;
  devis!: any[];
  devis$!: Observable<any[]>;
  loading = true;
  states = States;
  show_modal = false;
  loadingDelete = false;

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
    private ventesService: VentesService,
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController,
    private domCtrl: DomController,
    private toast: ToasterService
  ) {}

  ngOnInit() {
    this.devis$ = this.ventesService.devisAsObservable();

    this.ventesService.getAllDevis().subscribe((data) => {
      if (data.length != 0) {
        this.loading = false;
      }
    });
  }

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

  openModal(event: Event, devis: Devis) {
    event.stopPropagation();
    this.show_modal = true;
    this.devisToDelete = devis;
  }

  deleteDevis() {
    this.loadingDelete = true;
    this.ventesService.deleteDevis(this.devisToDelete!).subscribe((result) => {
      if (result) {
        this.loadingDelete = false;
        this.toast.showSuccess(
          `Le devis ${this.devisToDelete!.displayName} - ${
            this.devisToDelete!.client_name
          } a été supprimé avec succès`,
          'Succès'
        );
        this.devisToDelete = null;
        this.show_modal = false;
      }
    });
  }
}
