import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-password',
  templateUrl: 'password.html',
  providers: [ClientService, Global]
})
export class PasswordPage {
  private email = "";

  constructor(private global: Global, private translate: TranslateService,
    private navCtrl: NavController, private clientService: ClientService) {

  }

  requestReset() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.email.length <= 5 || !reg.test(this.email)) {
      this.translate.get('invalid_email').subscribe(text => {
        this.global.showToast(text);
      })
      // this.global.showToast('Enter valid email address');
    } else {
      this.translate.get('rqst_reset_password').subscribe(text => {
        this.global.presentLoading(text);
      })
      // this.global.presentLoading('Requesting password reset');
      this.clientService.forgetPassword({ email: this.email }).subscribe(res => {
        this.global.dismissLoading();
        this.translate.get('check_mail').subscribe(text => {
          this.global.showToast(text);
        })
        // this.global.showToast('Check your mail.');
      }, err => {
        this.global.dismissLoading();
      });
    }
  }

  signin() {
    this.navCtrl.pop();
  }

}
