import { Component } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { NotificationPage } from '../notification/notification';
import { TermsPage } from '../terms/terms';
import { Change_languagePage } from '../change_language/change_language';
import { EarnPage } from '../earn/earn';
import { HelpPage } from '../help/help';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { LoginPage } from '../login/login';
import { User } from '../../models/user.models';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';

@Component({
     selector: 'page-more',
     templateUrl: 'more.html'
})
export class MorePage {
     private user: User;

     constructor(private navCtrl: NavController, private alertCtrl: AlertController, private app: App,
          private translate: TranslateService, private appVersion: AppVersion, private market: Market) {

     }

     ionViewDidEnter() {
          this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
     }

     profileDetail() {
          this.navCtrl.push(ProfilePage);
     }
     notification() {
          this.navCtrl.push(NotificationPage);
     }
     terms() {
          this.navCtrl.push(TermsPage);
     }
     change_language() {
          this.navCtrl.push(Change_languagePage);
     }
     earn() {
          this.navCtrl.push(EarnPage);
     }
     ratevroom() {
          this.appVersion.getPackageName().then(pn => this.market.open(pn));
     }
     help() {
          this.navCtrl.push(HelpPage);
     }

     alertLogout() {
          this.translate.get(['logout_title', 'logout_message', 'no', 'yes']).subscribe(text => {
               let alert = this.alertCtrl.create({
                    title: text['logout_title'],
                    message: text['logout_message'],
                    buttons: [{
                         text: text['no'],
                         role: 'cancel',
                         handler: () => {
                              console.log('Cancel clicked');
                         }
                    }, {
                         text: text['yes'],
                         handler: () => {
                              window.localStorage.removeItem(Constants.KEY_USER);
                              window.localStorage.removeItem(Constants.KEY_TOKEN);
                              window.localStorage.removeItem(Constants.KEY_NOTIFICATIONS);
                              window.localStorage.removeItem(Constants.KEY_CARD_INFO);
                              this.app.getRootNav().setRoot(LoginPage);
                         }
                    }]
               });
               alert.present();
          });
     }

}
