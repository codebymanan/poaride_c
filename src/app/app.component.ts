import { Nav, Platform, Events } from 'ionic-angular';
import { TabsPage } from '../pages/tabs/tabs';
import { AppConfig, APP_CONFIG } from './app.config';
import { Component, ViewChild, Inject } from '@angular/core';
import { ClientService } from '../providers/client.service';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Constants } from '../models/constants.models';
import { Globalization } from '@ionic-native/globalization';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { User } from '../models/user.models';
import { OneSignal } from '@ionic-native/onesignal';
import { LoginPage } from '../pages/login/login';
import { MyNotification } from '../models/notification.models';
import firebase from 'firebase';
import moment from 'moment';

@Component({
  templateUrl: 'app.html',
  providers: [ClientService]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  private userMe: User;
  rtlSide: string = "left";

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private platform: Platform,
    private oneSignal: OneSignal, private globalization: Globalization, events: Events,
    private translate: TranslateService, private statusBar: StatusBar, private splashScreen: SplashScreen,
    private clientService: ClientService) {
    this.initializeApp();
    this.refreshSettings();
    events.subscribe('language:selection', (language) => {
      this.clientService.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { language: language }).subscribe(res => {
        console.log(res);
      }, err => {
        console.log('update_user', err);
      });
      this.globalize(language);
    });
  }

  getSuitableLanguage(language) {
    window.localStorage.setItem("locale", language);
    language = language.substring(0, 2).toLowerCase();
    console.log('check for: ' + language);
    return this.config.availableLanguages.some(x => x.code == language) ? language : 'en';
  }

  refreshSettings() {
    this.clientService.getSettings().subscribe(res => {
      console.log('setting_setup_success', res);
      window.localStorage.setItem(Constants.KEY_SETTING, JSON.stringify(res));
    }, err => {
      console.log('setting_setup_error', err);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });
      this.statusBar.styleDefault();
      this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
      this.nav.setRoot(this.userMe ? TabsPage : LoginPage);
      this.splashScreen.hide();
      if (this.platform.is('cordova')) {
        this.initOneSignal();
      }
      let defaultLang = window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
      this.globalize(defaultLang);
    });
  }

  globalize(languagePriority) {
    console.log("globalaizing...");
    if (this.platform.is('cordova')) {
      console.log("cordova detected");
      if (languagePriority && languagePriority.length) {
        console.log(languagePriority);
        this.translate.use(languagePriority);
        this.setDirectionAccordingly(languagePriority);
      } else {
        this.globalization.getPreferredLanguage().then(result => {
          console.log("language detected:----" + JSON.stringify(result));
          let suitableLang = this.getSuitableLanguage(result.value);
          console.log(suitableLang);
          this.translate.use(suitableLang);
          this.setDirectionAccordingly(suitableLang);
          window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, suitableLang);
        }).catch(e => {
          console.log(e);
          this.translate.use(languagePriority && languagePriority.length ? languagePriority : 'en');
          this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : 'en');
        });
      }
    } else {
      console.log("cordova not detected");
      this.translate.use(languagePriority && languagePriority.length ? languagePriority : 'en');
      this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : 'en');
      // this.translate.use('ar');
      // this.setDirectionAccordingly('ar');
    }
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.platform.setDir('ltr', false);
        this.platform.setDir('rtl', true);
        this.rtlSide = "right";
        break;
      }
      default: {
        this.platform.setDir('rtl', false);
        this.platform.setDir('ltr', true);
        this.rtlSide = "left";
        break;
      }
    }
  }

  initOneSignal() {
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length && this.config.oneSignalGPSenderId && this.config.oneSignalGPSenderId.length) {
      this.oneSignal.startInit(this.config.oneSignalAppId, this.config.oneSignalGPSenderId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log("handleNotificationReceived", JSON.stringify(data));
        let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
        if (!notifications) notifications = new Array<MyNotification>();
        notifications.push(new MyNotification((data.payload.additionalData && data.payload.additionalData.title) ? data.payload.additionalData.title : data.payload.title,
          (data.payload.additionalData && data.payload.additionalData.body) ? data.payload.additionalData.body : data.payload.body,
          moment().format("DD MMM YYYY")));
        window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        noti_ids_processed.push(data.payload.notificationID);
        window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        console.log("handleNotificationOpened", JSON.stringify(data));
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        let index = noti_ids_processed.indexOf(data.notification.payload.notificationID);
        if (index == -1) {
          let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
          if (!notifications) notifications = new Array<MyNotification>();
          notifications.push(new MyNotification((data.notification.payload.additionalData && data.notification.payload.additionalData.title) ? data.notification.payload.additionalData.title : data.notification.payload.title,
            (data.notification.payload.additionalData && data.notification.payload.additionalData.body) ? data.notification.payload.additionalData.body : data.notification.payload.body,
            moment().format("DD MMM YYYY")));
          window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
        } else {
          noti_ids_processed.splice(index, 1);
          window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
        }
      });
      this.oneSignal.endInit();
    }
  }

}
