import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  startWith,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  filter,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  AnimationController,
  DomController,
  GestureController,
} from '@ionic/angular';
import { Customer } from 'src/app/core/model/customer.model';
import { Devis } from 'src/app/core/model/devis.model';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ToasterService } from 'src/app/core/services/toastr.service';
import { VentesService } from 'src/app/core/services/ventes.service';
import { ModalComponent } from 'src/app/shared/modal/modal.component';
import { States } from 'src/utils/states';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.scss'],
})
export class CommandeComponent implements OnInit {
  @ViewChild(ModalComponent) modal!: ModalComponent;
  devisToDelete: Devis | null = null;

  @ViewChildren('container', { read: ElementRef })
  containers!: QueryList<ElementRef>;
  order!: any[];
  order$!: Observable<any[]>;
  loading = true;
  states = States;
  show_modal = false;
  loadingDelete = false;
  clients: Customer[] = [];
  searchText: BehaviorSubject<string> = new BehaviorSubject('');
  activeClient: Customer | any = null;
  clientChange: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
    this.order$ = this.ventesService.commandeAsObservable();

    const loadingDevis$ = this.ventesService.loading;
    const getCustomers$ = this.ventesService.getAllCustomers();

    loadingDevis$.subscribe((loading) => {
      getCustomers$.subscribe((customers) => {
        this.clients = customers;
        this.loading = loading;
      });
    });

    const search$ = this.searchText.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((text) => this.ventesService.getAllCommande(text ? text : ''))
    );

    search$.subscribe();

    const clientChange$ = this.clientChange.pipe(
      filter((change) => change === true),
      switchMap(() =>
        this.ventesService.getAllCommande(
          this.searchText.getValue(),
          this.activeClient.id
        )
      )
    );
    clientChange$.subscribe();
  }

  ngAfterViewInit(): void {
    // const itemsArr = this.containers.toArray();
    // for (let el of itemsArr) {
    //   const containerEl = el.nativeElement;
    //   let containerSibling = (containerEl as HTMLDivElement)
    //     .nextSibling as HTMLDivElement;
    //   const itemEl = el.nativeElement.childNodes[0];
    //   const deleteAnimation = this.animationCtrl
    //     .create()
    //     .addElement(containerEl)
    //     .duration(200)
    //     .easing('cubic-bezier(.25,.1,.25,1)')
    //     .fromTo('height', '55px', '0')
    //     .beforeAddClass('to-delete')
    //     .afterAddClass('deleted')
    //     .afterRemoveClass('to-delete');
    //   const gesture = this.gestureCtrl.create({
    //     el: itemEl,
    //     threshold: 0,
    //     gestureName: 'swipe-delete',
    //     onStart: () => {
    //       console.log('Gesture started');
    //     },
    //     onMove: (ev) => {
    //       const currentX = ev.deltaX;
    //       if (ev.deltaX < -50) {
    //         return;
    //       }
    //       this.domCtrl.write(() => {
    //         itemEl.style.transform = `translate3d(${currentX}px,0,0)`;
    //       });
    //     },
    //     // onEnd: (ev) => {
    //     //   itemEl.style.transition = '0.2s ease-out';
    //     //   if (ev.deltaX < -50) {
    //     //     this.domCtrl.write(() => {
    //     //       confirm('Do you want to delete this Devis ?');
    //     //       deleteAnimation.play();
    //     //       deleteAnimation.onFinish(() => {
    //     //         (containerEl as HTMLDivElement).remove();
    //     //         containerSibling = containerEl.nextSibling;
    //     //       });
    //     //     });
    //     //   } else {
    //     //     this.domCtrl.write(() => {
    //     //       itemEl.style.transform = `translateX(0)`;
    //     //     });
    //     //   }
    //     // },
    //   });
    //   gesture.enable(true);
    // }
  }

  createNewOrder() {
    this.navigation.navigateTo(['new'], this.route);
  }

  editOrder(order: any) {
    this.ventesService.nextEditedDevis(order);
    this.navigation.navigateWithParams(['new'], { mode: 'edit' }, this.route);
  }

  openModal(order: any) {
    this.show_modal = true;
    this.devisToDelete = order;
  }

  deleteDevis() {
    this.loadingDelete = true;
    this.ventesService.deleteDevis(this.devisToDelete!).subscribe((result) => {
      if (result) {
        this.ventesService.getAllDevis().subscribe(() => {
          this.loadingDelete = false;
          this.toast.showSuccess(
            `Le devis ${this.devisToDelete!.displayName} - ${
              this.devisToDelete!.client?.name
            } a été supprimé avec succès`,
            'Succès'
          );
          this.devisToDelete = null;
          this.show_modal = false;
        });
      }
    });
  }

  setSearchText(text: string) {
    this.searchText.next(text);
  }

  setActiveClient(c: Customer) {
    this.activeClient = c;
    this.clientChange.next(true);
  }
}
