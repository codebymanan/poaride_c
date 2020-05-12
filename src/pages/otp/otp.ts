import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Loading, AlertController, LoadingController, ToastController, Tabs } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Constants } from '../../models/constants.models';
import { TabsPage } from '../tabs/tabs';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html',
  providers: [ClientService, Global]
})
export class OtpPage {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  private loading: Loading;
  private loadingShown: boolean = false;
  private captchanotvarified: boolean = true;
  private result: any;
  private buttonDisabled: any = true;
  private otp: any = '';
  private component: any;
  private captchaVerified: boolean = false;
  private verfificationId: any;
  private timer: any;
  private minutes: number = 0;
  private seconds: number = 0;
  private totalSeconds: number = 0;
  private intervalCalled: boolean = false;
  private dialCode: string;
  private resendCode: boolean = false;
  private otpNotSent: boolean = true;
  private phoneNumberFull: string;

  constructor(private global: Global, private translate: TranslateService, params: NavParams, private navCtrl: NavController,
    private alertCtrl: AlertController, private platform: Platform, private clientService: ClientService) {
    this.phoneNumberFull = params.get('phoneNumberFull');
  }

  ionViewDidEnter() {
    if (!(this.platform.is('cordova'))) {
      this.makeCaptcha();
    }
    this.sendOTP();
  }

  setUserVerified() {
    this.translate.get('just_a_mmnt').subscribe(text => {
      this.global.presentLoading(text);
    })
    let input = { mobile_number: this.phoneNumberFull };
    this.clientService.verifyMobile(input).subscribe(res => {
      this.global.dismissLoading();
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
      window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
      this.navCtrl.setRoot(TabsPage);
    }, err => {
      console.log(JSON.stringify(err));
      this.global.dismissLoading();
      this.translate.get('smthng_wrng').subscribe(text => {
        this.global.presentErrorAlert(text);
      })
      // this.presentErrorAlert('Something went wrong');
    });
  }

  sendOTP() {
    this.resendCode = false;
    this.otpNotSent = true;
    if (this.platform.is('cordova')) {
      this.sendOtpPhone(this.phoneNumberFull);
    } else {
      this.sendOtpBrowser(this.phoneNumberFull);
    }
    if (this.intervalCalled) {
      clearInterval(this.timer);
    }
  }

  createTimer() {
    this.intervalCalled = true;
    this.totalSeconds--;
    if (this.totalSeconds == 0) {
      this.otpNotSent = true;
      this.resendCode = true;
      clearInterval(this.timer);
    } else {
      this.seconds = (this.totalSeconds % 60);
      if (this.totalSeconds >= this.seconds) {
        this.minutes = (this.totalSeconds - this.seconds) / 60
      } else {
        this.minutes = 0;
      }
    }
  }

  createInterval() {
    this.totalSeconds = 120;
    this.createTimer();
    this.timer = setInterval(() => {
      this.createTimer();
    }, 1000);
  }

  sendOtpPhone(phone) {
    this.translate.get('sending_otp').subscribe(text => {
      this.global.presentLoading(text);
    });
    const component = this;
    (<any>window).FirebasePlugin.verifyPhoneNumber(phone, 60, function (credential) {
      console.log("verifyPhoneNumber", JSON.stringify(credential));
      component.verfificationId = credential.verificationId ? credential.verificationId : credential;
      // if instant verification is true use the code that we received from the firebase endpoint, otherwise ask user to input verificationCode:
      //var code = credential.instantVerification ? credential.code : inputField.value.toString();
      if (component.verfificationId) {
        if (credential.instantVerification && credential.code) {
          component.otp = credential.code;
          component.global.showToast("Verified automatically");
          component.verifyOtpPhone();
        } else {
          component.translate.get("otp_sent").subscribe(value => {
            component.global.showToast(value);
          });
          component.otpNotSent = false;
          component.createInterval();
        }
      }
      component.global.dismissLoading();
    }, function (error) {
      console.log("otp_send_fail", error);
      component.otpNotSent = true;
      component.resendCode = true;
      component.global.dismissLoading();
      component.translate.get('otp_fail').subscribe(text => {
        component.global.showToast(text);
      });
    });
  }

  sendOtpBrowser(phone) {
    const component = this;
    this.global.dismissLoading();
    component.translate.get('sending_otp').subscribe(text => {
      component.global.presentLoading(text);
    })
    // component.global.presentLoading("Sending otp");
    firebase.auth().signInWithPhoneNumber(phone, this.recaptchaVerifier).then((confirmationResult) => {
      console.log("otp_send_success", confirmationResult);
      component.otpNotSent = false;
      component.result = confirmationResult;
      component.global.dismissLoading();
      component.translate.get('otp_sent').subscribe(text => {
        component.global.showToast(text);
      })
      // component.global.showToast("OTP Sent");
      if (component.intervalCalled) {
        clearInterval(component.timer);
      }
      component.createInterval();
    }).catch(function (error) {
      console.log("otp_send_fail", error);
      component.resendCode = true;
      component.global.dismissLoading();
      if (error.message) {
        component.global.showToast(error.message);
      } else {
        component.translate.get('otp_fail').subscribe(text => {
          component.global.showToast(text);
        })
        // component.global.showToast("OTP Sending failed");
      }
    });
  }

  verify() {
    this.otpNotSent = true;
    if (this.platform.is('cordova')) {
      this.verifyOtpPhone();
    } else {
      this.verifyOtpBrowser();
    }
  }

  verifyOtpPhone() {
    const credential = firebase.auth.PhoneAuthProvider.credential(this.verfificationId, this.otp);
    this.translate.get('verifying_otp').subscribe(text => {
      this.global.presentLoading(text);
    })
    // this.presentLoading("Verifying otp");
    firebase.auth().signInAndRetrieveDataWithCredential(credential).then((info) => {
      console.log('otp_verify_success', info);
      this.global.dismissLoading();
      this.translate.get('otp_verified').subscribe(text => {
        this.global.showToast(text);
      })
      // this.global.showToast("otp_verified");
      this.setUserVerified();
    }, (error) => {
      console.log('otp_verify_fail', error);
      if (error.message) {
        this.global.showToast(error.message);
      } else {
        this.translate.get('verify_otp_err').subscribe(text => {
          this.global.showToast(text);
        })
        // this.global.showToast("OTP Verification failed");
      }
      this.global.dismissLoading();
    })
  }

  verifyOtpBrowser() {
    const component = this;
    component.global.presentLoading("Verifying otp");
    this.result.confirm(this.otp).then(function (response) {
      console.log('otp_verify_success', response);
      response.user.getIdToken(false).then(res => {
        console.log('user_token_success', res);
      }).catch(err => {
        console.log('user_token_failure', err);
      });
      component.global.dismissLoading();
      component.translate.get('otp_verified').subscribe(text => {
        component.global.showToast(text);
      })
      // component.global.showToast("OTP Verified");
      component.setUserVerified();
    }).catch(function (error) {
      console.log('otp_verify_fail', error);
      if (error.message) {
        component.global.showToast(error.message);
      } else {
        component.translate.get('verify_otp_err').subscribe(text => {
          component.global.showToast(text);
        })
        // component.global.showToast("OTP Verification failed");
      }
      component.global.dismissLoading();
    });
  }

  makeCaptcha() {
    const component = this;
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      // 'size': 'normal',
      'size': 'invisible',
      'callback': function (response) {
        component.captchanotvarified = true;
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    this.recaptchaVerifier.render();
  }

  makeExitAlert() {
    const alert = this.alertCtrl.create({
      title: 'App termination',
      message: 'Do you want to close the app?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Application exit prevented!');
        }
      }, {
        text: 'Close App',
        handler: () => {
          this.platform.exitApp(); // Close this application
        }
      }]
    });
    alert.present();
  }

}
