import { Component } from '@angular/core';
import { Helper } from '../../models/helper.models';

@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html'
})
export class TermsPage {
  private terms = "";

  constructor() {
    this.terms = Helper.getSetting("privacy_policy");
  }
}