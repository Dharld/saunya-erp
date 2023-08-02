import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from 'src/app/core/services/api.service';
import { AlertButton, AlertController } from '@ionic/angular';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ServerValidator } from 'src/app/core/validators/server.validator';

@Component({
  selector: 'app-log-with-server',
  templateUrl: './log-with-server.component.html',
  styleUrls: ['./log-with-server.component.scss'],
})
export class LogWithServerComponent implements OnInit {
  serverControl: FormControl;
  loading = false;
  isAlertOpen = false;
  public alertButtons: AlertButton[] = [
    {
      text: 'OK',
    },
  ];
  message = 'Veuillez entrer une addresse de serveur valide';

  constructor(
    private alertController: AlertController,
    private navigationService: NavigationService,
    private route: ActivatedRoute,
    private serverValidator: ServerValidator,
    private api: ApiService
  ) {
    this.serverControl = new FormControl('', {
      asyncValidators: [
        this.serverValidator.validate.bind(this.serverValidator),
      ],
      updateOn: 'change',
    });
    this.alertButtons[0].handler = () => {
      this.navigationService.navigateTo(['../login'], this.route);
    };
  }

  ngOnInit() {
    this.serverControl.statusChanges
      .pipe(
        map((status) => {
          if (status === 'INVALID') {
            const errors = this.serverControl.errors;
            if (errors && errors['serverInexistant'] === true) {
              this.message = "Ce addresse de serveur n'existe pas.";
            }
          } else if (status === 'VALID') {
            this.message = 'Cette addresse de serveur est valide.';
          }
        })
      )
      .subscribe();
  }

  onSubmit() {
    if (this.serverControl.valid) {
      this.presentAlert();
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Succès',
      message:
        'Nous avons trouvé votre serveur\n ! Maintenant entrez vos informations pour pouvoir vous connecter.',
      buttons: this.alertButtons,
      cssClass: 'custom-alert',
    });

    await alert.present();
  }
}
