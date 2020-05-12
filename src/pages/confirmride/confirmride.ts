import { Component } from '@angular/core';
import { NavParams, ToastController, App } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Helper } from '../../models/helper.models';
import { Global } from '../../providers/global';
import { AppointmentRequest } from '../../models/appointment-request.models';
import { Constants } from '../../models/constants.models';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../tabs/tabs';
import { Profile } from '../../models/profile.models';
import moment from 'moment';

@Component({
  selector: 'page-confirmride',
  templateUrl: 'confirmride.html',
  providers: [ClientService, Global]
})
export class ConfirmridePage {
  private profile: Profile;
  private currency: string;
  private price: number;
  private date: string;
  private dateFormatted: string;
  private time: string;
  private seats = 0;
  private subscriptions: Array<Subscription> = [];
  private car: AppointmentRequest;
  private finalPrice: number = 0;

  constructor(navParam: NavParams, private app: App, private translate: TranslateService,
    private service: ClientService, private toastCtrl: ToastController, private global: Global) {
    this.profile = navParam.get("profile");
    this.price = this.profile.price;
    this.date = navParam.get("date");
    this.time = navParam.get("time");
    this.seats = navParam.get("seats");
    this.dateFormatted = moment(this.date).format("DD MMM");
    this.currency = Helper.getSetting("currency");

    this.car = new AppointmentRequest();
    this.car.provider_id = this.profile.id;
    this.car.ride_on = this.date + " " + this.time;
    this.car.seats = this.seats;
    this.car.address_from = this.profile.pickup_location.address;
    this.car.address_to = this.profile.drop_location.address;
    this.car.latitude_from = this.profile.pickup_location.latitude;
    this.car.longitude_from = this.profile.pickup_location.longitude;
    this.car.latitude_to = this.profile.drop_location.latitude;
    this.car.longitude_to = this.profile.drop_location.longitude;

    this.translate.get("ride_fare_calc").subscribe(value => {
      this.global.presentLoading(value);
      this.getRidePrice();
    });
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  getRidePrice() {
    let subscription: Subscription = this.service.ridePrice(window.localStorage.getItem(Constants.KEY_TOKEN), this.car).subscribe(res => {
      this.global.dismissLoading();
      this.finalPrice = res.price;
    }, err => {
      this.global.dismissLoading();
      let errMsg;
      this.translate.get('smthng_wrng').subscribe(value => {
        errMsg = value;
        if (err && err.error && err.error.errors) {
          if (err.error.errors.balance) {
            errMsg = err.error.errors.balance[0];
          }
        }
        this.global.showToast(errMsg);
      });
      console.log('ridePrice', err);
    });
    this.subscriptions.push(subscription);
  }

  seatDecrement() {
    if (this.seats > 0) {
      this.seats = this.seats - 1;
      this.price = this.profile.price * this.seats;
    }
  }

  seatIncrement() {
    if (this.seats < this.profile.seats_available) {
      this.seats = this.seats + 1;
      this.price = this.profile.price * this.seats;
    } else {
      this.showToast("Max seats available: " + this.profile.seats_available);
    }
  }

  confirm() {
    if (this.seats < 1) {
      this.showToast("No seats selected");
      return;
    }
    this.translate.get("appointment_creating").subscribe(value => {
      this.global.presentLoading(value);
    });
    let subscription: Subscription = this.service.createAppointment(window.localStorage.getItem(Constants.KEY_TOKEN), this.car).subscribe(res => {
      this.global.dismissLoading();
      this.translate.get("appointment_creating_success").subscribe(value => {
        this.showToast(value);
      });
      this.app.getRootNav().setRoot(TabsPage);
    }, err => {
      let errMsg;
      this.translate.get('appointment_creating_fail').subscribe(value => {
        errMsg = value;
        if (err && err.error && err.error.errors) {
          if (err.error.errors.balance) {
            errMsg = err.error.errors.balance[0];
          }
        }
        this.global.showToast(errMsg);
      });
      this.global.dismissLoading();
      console.log('book', err);
    });
    this.subscriptions.push(subscription);
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

}