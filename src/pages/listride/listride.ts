import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RiderprofilePage } from '../riderprofile/riderprofile';
import { ClientService } from '../../providers/client.service';
import { Global } from '../../providers/global';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Helper } from '../../models/helper.models';
import { Profile } from '../../models/profile.models';

@Component({
  selector: 'page-listride',
  templateUrl: 'listride.html',
  providers: [Global, ClientService]
})
export class ListridePage {
  private loc_name_from: string;
  private loc_name_to: string;
  private day: string;
  private date: string;
  private dateFormatted: string;
  private time: string;
  private seats: number;
  private queryParams: string;
  private currency: string;
  private rides: Array<Profile> = [];
  private subscriptions: Array<Subscription> = [];
  private isLoading: boolean;
  private doneAll = false;
  private pageNo = 1;
  private infiniteScroll: any;

  constructor(private navCtrl: NavController, navParam: NavParams,
    private global: Global, private service: ClientService) {
    this.currency = Helper.getSetting("currency");
    this.day = navParam.get("day");
    this.date = navParam.get("date");
    this.time = navParam.get("time");
    this.seats = navParam.get("seats");
    this.queryParams = "lat_from=" + navParam.get("lat_from")
      +
      "&long_from=" + navParam.get("long_from")
      +
      "&lat_to=" + navParam.get("lat_to")
      +
      "&long_to=" + navParam.get("long_to")
      +
      "&date=" + this.date
      +
      "&time=" + this.time
      +
      "&seats=" + this.seats;
    this.loc_name_from = navParam.get("loc_name_from");
    this.loc_name_to = navParam.get("loc_name_to");
    this.dateFormatted = this.formatDate(this.date);
    this.global.presentLoading("Loading rides");
    this.loadRides();
  }

  loadRides() {
    this.isLoading = true;
    let subscription: Subscription = this.service.listRides(window.localStorage.getItem(Constants.KEY_TOKEN),
      String(this.pageNo), this.queryParams).subscribe(res => {
        let reviews: Array<Profile> = res.data;
        this.rides = this.rides.concat(reviews);
        this.global.dismissLoading();
        this.isLoading = false;
        this.doneAll = (!res.data || !res.data.length);
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
      }, err => {
        console.log('ride_list', err);
        this.global.dismissLoading();
        this.isLoading = false;
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
      });
    this.subscriptions.push(subscription);
  }

  doInfinite(infiniteScroll: any) {
    if (this.doneAll) {
      infiniteScroll.complete();
    } else {
      this.infiniteScroll = infiniteScroll;
      this.pageNo = this.pageNo + 1;
      this.loadRides();
    }
  }

  riderprofile(profile) {
    this.navCtrl.push(RiderprofilePage, { profile: profile, time: this.time, date: this.date, seats: this.seats });
  }

  formatDate(date: string) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let dateArr = date.split("-");
    return dateArr[2] + " " + months[Number(dateArr[1]) - 1];
  }

}
