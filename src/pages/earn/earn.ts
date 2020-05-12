import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { User } from '../../models/user.models';
import { Constants } from '../../models/constants.models';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';
import { CodePage } from '../code/code';
import { Clipboard } from '@ionic-native/clipboard';
import { Global } from '../../providers/global';
import { Helper } from '../../models/helper.models';

@Component({
  selector: 'page-earn',
  templateUrl: 'earn.html',
  providers: [Global]
})
export class EarnPage {
  private userMe: User;
  private shareMessage: string;
  private refer_amount: string;
  private currency: string;

  constructor(private socialSharing: SocialSharing, private clipboard: Clipboard,
    private translate: TranslateService, private modalCtrl: ModalController, private global: Global) {
    this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.translate.get('share_message').subscribe(value => {
      this.shareMessage = value + " ";
    });
    this.refer_amount = Helper.getSetting("refer_amount");
    this.currency = Helper.getSetting("currency");
  }

  copyCode() {
    if (this.userMe.refer_code) {
      this.clipboard.copy(this.userMe.refer_code);
      this.translate.get('copied_code').subscribe(value => {
        this.global.showToast(value);
      });
    }
  }

  shareFacebook() {
    this.socialSharing.shareViaFacebook(this.shareMessage + this.userMe.refer_code).then(() => {
      // Sharing via email is possible
    }).catch((err) => {
      console.log("shareErr", err);
      this.translate.get('share_error_facebook').subscribe(value => {
        this.global.showToast(value);
      });
      setTimeout(() => {
        this.translate.get('click_to_copy').subscribe(value => {
          this.global.showToast(value);
        });
      }, 3500);
    });
  }

  shareWhatsapp() {
    this.socialSharing.shareViaWhatsApp(this.shareMessage + this.userMe.refer_code).then(() => {
      // Sharing via email is possible
    }).catch((err) => {
      console.log("shareErr", err);
      this.translate.get('share_error_whatsapp').subscribe(value => {
        this.global.showToast(value);
      });
      setTimeout(() => {
        this.translate.get('click_to_copy').subscribe(value => {
          this.global.showToast(value);
        });
      }, 3500);
    });
  }

  shareTwitter() {
    this.socialSharing.shareViaTwitter(this.shareMessage + this.userMe.refer_code).then(() => {
      // Sharing via email is possible
    }).catch((err) => {
      console.log("shareErr", err);
      this.translate.get('share_error_twitter').subscribe(value => {
        this.global.showToast(value);
      });
      setTimeout(() => {
        this.translate.get('click_to_copy').subscribe(value => {
          this.global.showToast(value);
        });
      }, 3500);
    });
  }

  share() {
    this.socialSharing.share(this.shareMessage + this.userMe.refer_code).then(() => {
      // Sharing via email is possible
    }).catch((err) => {
      console.log("shareErr", err);
      this.translate.get('share_error').subscribe(value => {
        this.global.showToast(value);
      });
      setTimeout(() => {
        this.translate.get('click_to_copy').subscribe(value => {
          this.global.showToast(value);
        });
      }, 3500);
    });
  }

  enterReferral() {
    let modal = this.modalCtrl.create(CodePage);
    modal.present();
  }

}