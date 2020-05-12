import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, App, NavParams, Platform } from 'ionic-angular';
import { SignUpRequest } from '../../models/signup-request.models';
import { Global } from '../../providers/global';
import { ClientService } from '../../providers/client.service';
import { TranslateService } from '@ngx-translate/core';
import { OtpPage } from '../otp/otp';
import { FirebaseClient } from '../../providers/firebase.service';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, Entry } from '@ionic-native/file';

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html',
    providers: [ClientService, FirebaseClient, Global]
})
export class SignupPage {
    @ViewChild('inputfname') inputfname;
    @ViewChild('inputlname') inputlname;
    @ViewChild('inputphone') inputphone;
    @ViewChild('inputemail') inputemail;
    @ViewChild('inputpassword') inputpassword;
    @ViewChild('inputpasswordconfirm') inputpasswordconfirm;
    private signUpRequest = new SignUpRequest('', '', '', '');
    private phoneNumber: string;
    private countryCode: string;
    private phoneNumberFull: string;
    private fileToUpload: any;
    private progress: boolean;
    private countries: any;
    private firstName = "";
    private lastName = "";

    constructor(private navCtrl: NavController, private clientService: ClientService, private file: File,
        private alertCtrl: AlertController, private app: App, navParam: NavParams, private platform: Platform,
        private firebaseService: FirebaseClient, private translate: TranslateService,
        private global: Global, private ng2ImgMax: Ng2ImgMaxService, private camera: Camera) {
        let user = navParam.get("user");
        if (user && user.email) {
            let nameSplit = user.displayName.split(" ");
            if (nameSplit && nameSplit.length) {
                this.firstName = nameSplit[0];
                if (nameSplit.length > 1)
                    this.lastName = nameSplit[1];
            } else {
                this.firstName = user.displayName;
            }
            this.signUpRequest.email = user.email;
            this.signUpRequest.image_url = navParam.get("image_url");
            //this.signUpRequest.password = Math.random().toString(36).slice(-6);
            //this.passwordConfirm = this.signUpRequest.password;
        }
        this.getCountries();
    }

    focusPasswordConfirm() {
        this.inputpasswordconfirm.setFocus();
    }

    focusPassword() {
        this.inputpassword.setFocus();
    }

    focusPhone() {
        this.inputphone.setFocus();
    }

    focusEmail() {
        this.inputemail.setFocus();
    }

    focusFName() {
        this.inputfname.setFocus();
    }

    focusLName() {
        this.inputlname.setFocus();
    }

    pickImage() {
        const options: CameraOptions = {
            quality: 75,
            destinationType: this.platform.is("android") ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
        this.camera.getPicture(options).then((imageData) => {
            this.resolveUriPath(imageData);
        }, (err) => {
            this.translate.get('camera_err').subscribe(value => {
                this.global.showToast(value);
            });
            console.log("getPicture", JSON.stringify(err));
            // let fileInput = document.getElementById("register-image");
            // fileInput.click();
        });
    }

    getCountries() {
        this.clientService.getCountries().subscribe(data => {
            this.countries = data;
        }, err => {
            console.log(err);
        })
    }

    resolveUriPath(uri: string) {
        console.log('resolveUriPath:', uri);
        if (this.platform.is("android") && uri.startsWith('content://') && uri.indexOf('/storage/') != -1) {
            uri = "file://" + uri.substring(uri.indexOf("/storage/"), uri.length);
            console.log('file: ' + uri);
        }
        this.file.resolveLocalFilesystemUrl(uri).then((entry: Entry) => {
            console.log(entry);
            var fileEntry = entry as FileEntry;
            fileEntry.file(success => {
                var mimeType = success.type;
                console.log(mimeType);
                let dirPath = entry.nativeURL;
                this.upload(dirPath, entry.name, mimeType);
            }, error => {
                console.log(error);
            });
        })
    }

    upload(path, name, mime) {
        console.log('original: ' + path);
        let dirPathSegments = path.split('/');
        dirPathSegments.pop();
        path = dirPathSegments.join('/');
        console.log('dir: ' + path);
        this.file.readAsArrayBuffer(path, name).then(buffer => {
            this.translate.get("uploading_image").subscribe(value => {
                this.global.presentLoading(value);
            });
            this.progress = true;
            this.firebaseService.uploadBlob(new Blob([buffer], { type: mime })).then(url => {
                this.global.dismissLoading();
                this.signUpRequest.image_url = String(url);
                this.translate.get("uploading_success").subscribe(value => {
                    this.global.showToast(value);
                });
            }).catch(err => {
                this.progress = false;
                this.global.dismissLoading();
                this.translate.get("uploading_fail").subscribe(value => {
                    this.global.presentErrorAlert(value);
                });
                console.log(err);
            })
        }).catch(err => {
            this.global.dismissLoading();
            this.global.showToast(JSON.stringify(err));
            console.log(err);
        })
    }

    validateSignupForm() {
        //this.signUpRequest.name = this.firstName + " " + this.lastName;
        this.signUpRequest.name = this.firstName;
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.signUpRequest.image_url || !this.signUpRequest.image_url.length) {
            this.translate.get('err_choose_profile_image').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (!this.countryCode || !this.countryCode.length) {
            this.translate.get('select_country').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (!this.phoneNumber || !this.phoneNumber.length) {
            this.translate.get('phone_err').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (this.signUpRequest.name.length < 3) {
            this.translate.get('invalid_name').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
            this.translate.get('invalid_email').subscribe(value => {
                this.global.showToast(value);
            });
        } else if (this.signUpRequest.password.length < 6) {
            this.translate.get('invalid_password').subscribe(value => {
                this.global.showToast(value);
            });
        }
        // else if (this.signUpRequest.password != this.passwordConfirm) {
        //     this.translate.get('invalid_password1').subscribe(value => {
        //         this.global.showToast(value);
        //     });
        // }
        else {
            this.alertPhone();
        }
    }

    requestSignUp() {
        this.translate.get('signing_up').subscribe(value => {
            this.global.presentLoading(value);
        });
        this.clientService.signUp(this.signUpRequest).subscribe(res => {
            console.log("signupres", res);
            this.global.dismissLoading();
            this.app.getRootNav().setRoot(OtpPage, { phoneNumberFull: res.user.mobile_number });
        }, err => {
            console.log("signuperr", err);
            this.global.dismissLoading();
            let errMsg;
            this.translate.get('invalid_credentials').subscribe(value => {
                errMsg = value;
                if (err && err.error && err.error.errors) {
                    if (err.error.errors.email) {
                        errMsg = err.error.errors.email[0];
                    } else if (err.error.errors.mobile_number) {
                        errMsg = err.error.errors.mobile_number[0];
                    } else if (err.error.errors.password) {
                        errMsg = err.error.errors.password[0];
                    }
                }
                this.global.presentErrorAlert(errMsg);
            });
        });
    }

    alertPhone() {
        this.phoneNumberFull = "+" + this.countryCode + this.phoneNumber;
        this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
            let alert = this.alertCtrl.create({
                title: this.phoneNumberFull,
                message: text['alert_phone'],
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
                        this.signUpRequest.mobile_number = this.phoneNumberFull;
                        this.requestSignUp();
                    }
                }]
            });
            alert.present();
        })
    }

    login() {
        this.navCtrl.pop();
    }

}
