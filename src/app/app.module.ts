import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { MyridePage } from '../pages/myride/myride';
import { ChatsPage } from '../pages/chats/chats';
import { FindridePage } from '../pages/findride/findride';
import { WalletPage } from '../pages/wallet/wallet';
import { MorePage } from '../pages/more/more';
import { Change_languagePage } from '../pages/change_language/change_language';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { PasswordPage } from '../pages/password/password';
import { CodePage } from '../pages/code/code';
import { ListridePage } from '../pages/listride/listride';
import { RiderprofilePage } from '../pages/riderprofile/riderprofile';
import { ConfirmridePage } from '../pages/confirmride/confirmride';
import { RateriderPage } from '../pages/raterider/raterider';
import { ChattingPage } from '../pages/chatting/chatting';
import { ProfilePage } from '../pages/profile/profile';
import { NotificationPage } from '../pages/notification/notification';
import { TermsPage } from '../pages/terms/terms';
import { EarnPage } from '../pages/earn/earn';
import { HelpPage } from '../pages/help/help';
import { AddMoneyPage } from '../pages/addmoney/addmoney';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { APP_CONFIG, BaseAppConfig } from "./app.config";
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Globalization } from '@ionic-native/globalization';
import { OtpPage } from '../pages/otp/otp';
import { SelectareaPage } from '../pages/selectarea/selectarea';
import { BankTransfer } from '../pages/banktransfer/banktransfer';
import { GoogleMaps } from '../providers/google-maps';
import { Network } from '@ionic-native/network';
import { Connectivity } from '../providers/connectivity-service';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { Geolocation } from '@ionic-native/geolocation';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import { OneSignal } from '@ionic-native/onesignal';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { Stripe } from '@ionic-native/stripe';
import { CallNumber } from '@ionic-native/call-number';
import { RideMapPage } from '../pages/ridemap/ridemap';
import { Diagnostic } from '@ionic-native/diagnostic';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    MyridePage,
    ChatsPage,
    FindridePage,
    WalletPage,
    MorePage,
    LoginPage,
    PasswordPage,
    SignupPage,
    Change_languagePage,
    CodePage,
    ListridePage,
    RiderprofilePage,
    ConfirmridePage,
    RateriderPage,
    ChattingPage,
    ProfilePage,
    NotificationPage,
    TermsPage,
    EarnPage,
    HelpPage,
    OtpPage,
    SelectareaPage,
    BankTransfer,
    AddMoneyPage,
    RideMapPage
  ],
  imports: [
    Ng2ImgMaxModule,
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    MyridePage,
    ChatsPage,
    FindridePage,
    WalletPage,
    MorePage,
    LoginPage,
    PasswordPage,
    SignupPage,
    CodePage,
    ListridePage,
    RiderprofilePage,
    ConfirmridePage,
    Change_languagePage,
    RateriderPage,
    ChattingPage,
    ProfilePage,
    NotificationPage,
    TermsPage,
    EarnPage,
    HelpPage,
    OtpPage,
    SelectareaPage,
    BankTransfer,
    AddMoneyPage,
    RideMapPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Globalization,
    OneSignal,
    GoogleMaps,
    NativeGeocoder,
    Network,
    Connectivity,
    Geolocation,
    GooglePlus,
    Facebook,
    Stripe,
    CallNumber,
    Diagnostic,
    SocialSharing,
    Clipboard,
    AppVersion,
    Market,
    InAppBrowser,
    Camera,
    File,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: APP_CONFIG, useValue: BaseAppConfig }
  ]
})
export class AppModule { }
