import { Component } from '@angular/core';
import { MyridePage } from '../myride/myride';
import { ChatsPage } from '../chats/chats';
import { FindridePage } from '../findride/findride';
import { WalletPage } from '../wallet/wallet';
import { MorePage } from '../more/more';
import { ModalController, Platform } from 'ionic-angular';
import { Constants } from '../../models/constants.models';
import { CodePage } from '../code/code';
import { OneSignal } from '@ionic-native/onesignal';
import { ClientService } from '../../providers/client.service';
import { User } from '../../models/user.models';
import firebase from 'firebase';

@Component({
  templateUrl: 'tabs.html',
  providers: [ClientService]
})
export class TabsPage {
  tab1Root = MyridePage;
  tab2Root = ChatsPage;
  tab3Root = FindridePage;
  tab4Root = WalletPage;
  tab5Root = MorePage;

  constructor(oneSignal: OneSignal, service: ClientService, platform: Platform, modalCtrl: ModalController) {
    let userMe: User = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    if (platform.is('cordova')) {
      oneSignal.getIds().then((id) => {
        if (id && id.userId) {
          firebase.database().ref(Constants.REF_USERS_FCM_IDS).child(userMe.id + "vc").set(id.userId);
          service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { fcm_registration_id: id.userId }).subscribe(res => {
            console.log(res);
          }, err => {
            console.log('update_user', err);
          });
        }
      });
    }
    service.logActivity(window.localStorage.getItem(Constants.KEY_TOKEN)).subscribe(res => {
      console.log(res);
    }, err => {
      console.log('logActivity', err);
    });
    if (!window.localStorage.getItem(Constants.KEY_ASKED_REFERRAL)) {
      let modal = modalCtrl.create(CodePage);
      modal.present();
      window.localStorage.setItem(Constants.KEY_ASKED_REFERRAL, "true");
    }
  }
}
