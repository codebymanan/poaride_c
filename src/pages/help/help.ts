import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Faq } from '../../models/faq.models';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';


@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
  providers: [ClientService, Global]
})
export class HelpPage {
  private faqs = new Array<Faq>();
  private subscriptions: Array<Subscription> = [];
  private curFaqId;

  constructor(private navCtrl: NavController, private service: ClientService, private global: Global) {
    let savedFaqs: Array<Faq> = JSON.parse(window.localStorage.getItem(Constants.KEY_FAQS));
    if (savedFaqs) {
      this.faqs = savedFaqs;
    } else {
      this.global.presentLoading("Just a moment");
    }
    this.refreshFaqs();
  }

  refreshFaqs() {
    let subscription: Subscription = this.service.faqs().subscribe(res => {
      this.faqs = res;
      window.localStorage.setItem(Constants.KEY_FAQS, JSON.stringify(this.faqs));
      this.global.dismissLoading();
    }, err => {
      console.log('faqs', err);
      this.global.dismissLoading();
    });
    this.subscriptions.push(subscription);
  }

  expandFaq(faq: Faq) {
    this.curFaqId = faq.id;
  }

}