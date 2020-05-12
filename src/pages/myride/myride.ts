import { Component } from '@angular/core';
import { NavController, Loading, AlertController } from 'ionic-angular';
import { RateriderPage } from '../raterider/raterider';
import { ChattingPage } from '../chatting/chatting';
import { User } from '../../models/user.models';
import { Chat } from '../../models/chat.models';
import { Constants } from '../../models/constants.models';
import { Appointment } from '../../models/appointment.models';
import { Subscription } from 'rxjs/Subscription';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../models/helper.models';
import { RiderprofilePage } from '../riderprofile/riderprofile';
//import { CallNumber } from '@ionic-native/call-number';
import { RideMapPage } from '../ridemap/ridemap';
import { RideInfo } from '../../models/ride-info.models';

@Component({
  selector: 'page-myride',
  templateUrl: 'myride.html',
  providers: [ClientService, Global]
})
export class MyridePage {
  ride: string = "Pending";
  private currency: string;
  private loading: Loading;
  private isLoading: boolean;
  private loadingShown: Boolean = false;
  private pageNo: number = 1;
  private allDone = false;
  private refresher: any;
  private infiniteScroll: any;
  private subscriptions: Array<Subscription> = [];
  private toShow: Array<Appointment> = [];
  private upcoming: Array<Appointment> = [];
  private complete: Array<Appointment> = [];

  constructor(private navCtrl: NavController, private service: ClientService, private alertCtrl: AlertController,
    private global: Global, private translate: TranslateService) {
    this.loadRequests();
    this.currency = Helper.getSetting("currency");
  }

  onSegmentChange() {
    setTimeout(() => {
      this.toShow = this.ride == "Pending" ? this.upcoming : this.complete;
    }, 100);
  }

  doRefresh(refresher) {
    if (this.isLoading) refresher.complete();
    this.refresher = refresher;
    this.pageNo = 1;
    this.upcoming = new Array();
    this.complete = new Array();
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    let subscription: Subscription = this.service.appointments(window.localStorage.getItem(Constants.KEY_TOKEN), this.pageNo).subscribe(res => {
      let appointments: Array<Appointment> = res.data;
      this.allDone = (!appointments || !appointments.length);
      this.global.dismissLoading();
      let upcoming = new Array<Appointment>();
      let complete = new Array<Appointment>();
      for (let ap of appointments) {
        if (ap.status == 'complete' || ap.status == 'rejected' || ap.status == 'cancelled')
          complete.push(ap);
        else
          upcoming.push(ap);
      }
      if (upcoming.length || complete.length) {
        this.upcoming = this.upcoming.concat(upcoming);
        this.complete = this.complete.concat(complete);
        this.onSegmentChange();
      }
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
    }, err => {
      console.log('appointments', err);
      this.global.dismissLoading();
      if (this.infiniteScroll) this.infiniteScroll.complete();
      if (this.refresher) this.refresher.complete();
    });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    this.infiniteScroll = infiniteScroll;
    if (!this.allDone) {
      this.pageNo = this.pageNo + 1;
      this.loadRequests();
    } else {
      infiniteScroll.complete();
    }
  }

  ionViewDidEnter() {
    let ratecheckId = window.localStorage.getItem("ratecheck");
    if (ratecheckId) {
      let index = -1;
      for (let i = 0; i < this.toShow.length; i++) {
        if (Number(ratecheckId) == this.toShow[i].id) {
          index = i;
          break;
        }
      }
      if (index != -1) {
        let rating = window.localStorage.getItem("rate" + this.toShow[index].id);
        this.toShow[index].myRating = rating ? Number(rating) : -1;
      }
    }
    window.localStorage.removeItem("ratecheck");
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.global.dismissLoading();
  }

  raterider(appointment: Appointment) {
    this.navCtrl.push(RateriderPage, { appointment: appointment });
  }

  riderprofile(appointment: Appointment) {
    this.navCtrl.push(RiderprofilePage, { profile: appointment.provider });
  }

  shareJob(index) { }

  cancelJob(index) {
    this.translate.get(['cancelride_title', 'cancelride_message', 'no', 'yes']).subscribe(text => {
      let alert = this.alertCtrl.create({
        title: text['cancelride_title'],
        message: text['cancelride_message'],
        buttons: [{
          text: text['no'],
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: text['yes'],
          handler: () => {
            this.translate.get('just_moment').subscribe(value => {
              this.global.presentLoading(value);
            });
            let subscription: Subscription = this.service.appointmentCancel(window.localStorage.getItem(Constants.KEY_TOKEN), this.toShow[index].id).subscribe(res => {
              console.log(res);
              this.toShow[index] = res;
              this.global.dismissLoading();
            }, err => {
              console.log('cancel_err', err);
              this.global.dismissLoading();
            });
            this.subscriptions.push(subscription);
          }
        }]
      });
      alert.present();
    });
  }

  chatting(appointment: Appointment) {
    let userMe: User = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    let chat = new Chat();
    chat.chatId = appointment.provider.user.id + "vd";
    chat.chatImage = appointment.provider.user.image_url;
    chat.chatName = appointment.provider.user.name;
    chat.chatStatus = appointment.provider.profession;
    chat.myId = userMe.id + "vc";
    this.navCtrl.push(ChattingPage, { chat: chat });
  }

  // calling(appointment: Appointment) {
  //   this.callNumber.callNumber(appointment.provider.user.mobile_number, true).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
  // }

  rideMap(appointment: Appointment) {
    let rideInfo = new RideInfo();
    rideInfo.address_from = appointment.address_from;
    rideInfo.address_to = appointment.address_to;
    rideInfo.latitude_from = appointment.latitude_from;
    rideInfo.longitude_from = appointment.longitude_from;
    rideInfo.latitude_to = appointment.latitude_to;
    rideInfo.longitude_to = appointment.longitude_to;
    this.navCtrl.push(RideMapPage, { rideInfo: rideInfo });
  }

}
