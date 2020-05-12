import { Component, Inject, ViewChild } from '@angular/core';
import { NavController, Platform, App, AlertController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { TabsPage } from '../tabs/tabs';
import { APP_CONFIG, AppConfig } from '../../app/app.config';
import { Constants } from '../../models/constants.models';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { SignInRequest } from '../../models/signin-request.models';
import { OtpPage } from '../otp/otp';
import { PasswordPage } from '../password/password';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';
import firebase from 'firebase';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [ClientService, Global]
})
export class LoginPage {
    @ViewChild('inputemail') inputemail;
    @ViewChild('inputpassword') inputpassword;
    private signInRequest = new SignInRequest('', '');
    private image_url: string;

    constructor(@Inject(APP_CONFIG) private config: AppConfig, private app: App, private global: Global,
        private navCtrl: NavController, private clientService: ClientService, private translate: TranslateService,
        private platform: Platform, private facebook: Facebook, private google: GooglePlus, private alertCtrl: AlertController) {

    }

    focusEmail() {
        this.inputemail.setFocus();
    }

    focusPassword() {
        this.inputpassword.setFocus();
    }

    requestSignIn() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (this.signInRequest.email.length <= 5 || !reg.test(this.signInRequest.email)) {
            this.translate.get('invalid_email').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (!this.signInRequest.password.length) {
            this.translate.get('enter_password').subscribe(value => {
                this.global.showToast(value);
            });
        } else {
            this.translate.get('loging_in').subscribe(value => {
                this.global.presentLoading(value);
            });
            this.clientService.login(this.signInRequest).subscribe(res => {
                this.global.dismissLoading();
                if (res.user.mobile_verified == 1) {
                    window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
                    window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
                    this.app.getRootNav().setRoot(TabsPage);
                } else {
                    this.app.getRootNav().setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number });
                }
            }, err => {
                console.log(err);
                this.global.dismissLoading();
                this.translate.get('invalid_credentials').subscribe(value => {
                    this.global.presentErrorAlert(value);
                });
            });
        }
    }

    signInFacebook() {
        this.translate.get('login_facebook').subscribe(value => {
            this.global.presentLoading(value);
        });
        if (this.platform.is('cordova')) {
            this.fbOnPhone();
        }
    }

    fbOnPhone() {
        this.facebook.login(["public_profile", 'email']).then(response => {
            // this.presentLoading('Facebook signup success, authenticating with firebase');
            console.log("fb_success", response);
            let userId = response.authResponse.userID;
            const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
            this.image_url = "https://graph.facebook.com/" + userId + "/picture?height=500";
            firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential).then((success) => {
                this.global.dismissLoading();
                console.log("fb_fire_success", success);
                this.getFireUserToken(success.user);
            }).catch((error) => {
                console.log("fb_fire_error", error);
                this.global.showToast("Error in Facebook login");
                this.global.dismissLoading();
            });
        }).catch((error) => {
            console.log("fb_error", error);
            this.global.dismissLoading();
        });
    }

    signInGoogle() {
        this.translate.get('login_google').subscribe(value => {
            this.global.presentLoading(value);
        });
        if (this.platform.is('cordova')) {
            this.googleOnPhone();
        } else {
            this.googleOnBrowser();
        }
    }

    googleOnPhone() {
        const provider = {
            'webClientId': this.config.firebaseConfig.webApplicationId,
            'offline': false,
            'scopes': 'profile email'
        };
        this.google.login(provider).then((res) => {
            // this.presentLoading('Google signup success, authenticating with firebase');
            console.log('google_success', res);
            this.image_url = String(res.imageUrl).replace("s96-c", "s500-c");
            const googleCredential = firebase.auth.GoogleAuthProvider.credential(res.idToken);
            firebase.auth().signInAndRetrieveDataWithCredential(googleCredential).then((response) => {
                console.log('google_fire_success', response);
                this.global.dismissLoading();
                this.getFireUserToken(response.user);
            }, (err) => {
                console.log('google_fire_error', err);
                this.global.dismissLoading();
            })
        }, (err) => {
            console.log('google_success', err);
            this.global.dismissLoading();
        })
    }

    googleOnBrowser() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then((result) => {
                this.global.dismissLoading();
                console.log('google_fire_success', result);
                this.getFireUserToken(result.user);
            }).catch((error) => {
                console.log('google_fire_error', error);
                this.global.dismissLoading();
            });
        } catch (err) {
            this.global.dismissLoading();
            console.log(err);
        }
    }

    getFireUserToken(user) {
        user.getIdToken(false).then(token => {
            console.log('fire_token', token);
            this.requestSignSocialIn(user, { token: token });
        }).catch(err => {
            console.log('fire_token_err', err);
        });
    }

    requestSignSocialIn(user, socialRequest) {
        this.translate.get('verify_usr').subscribe(value => {
            this.global.presentLoading(value);
        });
        this.clientService.loginSocial(socialRequest).subscribe(res => {
            this.global.dismissLoading();
            if (res.user.mobile_verified == 1) {
                window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res.user));
                window.localStorage.setItem(Constants.KEY_TOKEN, res.token);
                this.app.getRootNav().setRoot(TabsPage);
            } else {
                this.app.getRootNav().setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number });
            }
        }, err => {
            this.global.dismissLoading();
            console.log(err);
            this.presentSocialErrorAlert(user);
        });
    }

    presentSocialErrorAlert(user) {
        this.translate.get(['social_create_title', 'social_create_message', 'okay']).subscribe(text => {
            let alert = this.alertCtrl.create({
                title: text['social_create_title'],
                subTitle: text['social_create_message'],
                buttons: [{
                    text: text['okay'],
                    handler: () => {
                        this.navCtrl.push(SignupPage, { user: user, image_url: this.image_url });
                    }
                }]
            });
            alert.present();
        });
    }

    signup() {
        this.app.getRootNav().push(SignupPage);
    }

    passwordRecovery() {
        this.app.getRootNav().push(PasswordPage);
    }

}