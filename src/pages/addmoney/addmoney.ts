import { Component, Inject } from '@angular/core';
import { NavController, LoadingController, ToastController, Loading, AlertController } from 'ionic-angular';
import { CardInfo } from '../../models/card-info.models';
import { Constants } from '../../models/constants.models';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Stripe, StripeCardTokenParams } from '@ionic-native/stripe';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';

@Component({
  selector: 'page-addmoney',
  templateUrl: 'addmoney.html',
  providers: [ClientService]
})
export class AddMoneyPage {
  private cardInfo = new CardInfo();
  private loading: Loading;
  private loadingShown: Boolean = false;
  private subscriptions: Array<Subscription> = [];
  private amount: number;

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private toastCtrl: ToastController,
    private translate: TranslateService, private navCtrl: NavController, private alertCtrl: AlertController,
    private stripe: Stripe, private loadingCtrl: LoadingController, private service: ClientService) {
    let savedCardInfo = JSON.parse(window.localStorage.getItem(Constants.KEY_CARD_INFO));
    if (savedCardInfo) {
      this.cardInfo.name = savedCardInfo.name;
      this.cardInfo.number = savedCardInfo.number;
      this.cardInfo.expMonth = savedCardInfo.expMonth;
      this.cardInfo.expYear = savedCardInfo.expYear;
    }
  }

  confirm() {
    if (this.amount && this.amount > 0) {
      if (this.cardInfo.areFieldsFilled()) {
        this.translate.get('verifying_card').subscribe(text => {
          this.presentLoading(text);
        });
        this.stripe.setPublishableKey(this.config.stripeKey);
        this.stripe.createCardToken(this.cardInfo as StripeCardTokenParams).then(token => {
          this.dismissLoading();
          window.localStorage.setItem(Constants.KEY_CARD_INFO, JSON.stringify(this.cardInfo));
          this.addMoney(token.id);
        }).catch(error => {
          this.dismissLoading();
          this.presentErrorAlert(error);
          this.translate.get('invalid_card').subscribe(text => {
            this.showToast(text);
          });
          console.error(error);
        });
      } else {
        this.translate.get('fill_valid_card').subscribe(text => {
          this.showToast(text);
        });
      }
    } else {
      this.translate.get('fill_valid_amount').subscribe(text => {
        this.showToast(text);
      });
    }
  }

  addMoney(stripeToken) {
    let subscription: Subscription = this.service.walletRecharge(window.localStorage.getItem(Constants.KEY_TOKEN), this.amount, stripeToken).subscribe(res => {
      this.dismissLoading();
      this.translate.get(res && res.status ? 'amount_add_success' : 'smthng_wrng').subscribe(text => {
        this.showToast(text);
      });
      this.navCtrl.pop();
    }, err => {
      console.log('smthng_wrng', err);
      this.dismissLoading();
      this.navCtrl.pop();
    });
    this.subscriptions.push(subscription);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.dismissLoading();
  }

  private presentErrorAlert(msg: string) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: msg,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

  private presentLoading(message: string) {
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.onDidDismiss(() => { });
    this.loading.present();
    this.loadingShown = true;
  }

  private dismissLoading() {
    if (this.loadingShown) {
      this.loadingShown = false;
      this.loading.dismiss();
    }
  }

}
