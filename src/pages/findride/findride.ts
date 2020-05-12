import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListridePage } from '../listride/listride';
import { SelectareaPage } from '../selectarea/selectarea';
import { MyLocation } from '../../models/my-location.models';
import { Constants } from '../../models/constants.models';
import { Global } from '../../providers/global';
import { Helper } from '../../models/helper.models';
import moment from 'moment';

@Component({
  selector: 'page-findride',
  templateUrl: 'findride.html',
  providers: [Global]
})
export class FindridePage {
  private dateTime = "...";
  private seats = 1;
  private locationFrom = new MyLocation();
  private locationTo = new MyLocation();

  constructor(private navCtrl: NavController, private global: Global) {
    this.dateTime = moment().format();
  }

  ionViewDidEnter() {
    let locationFrom = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_FROM));
    let locationTo = JSON.parse(window.localStorage.getItem(Constants.KEY_LOCATION_TO));
    if (locationFrom) this.locationFrom = locationFrom;
    if (locationTo) this.locationTo = locationTo;
  }

  selectLocation(type) {
    console.log("selectLocation", type);
    this.navCtrl.push(SelectareaPage, { type: type });
  }

  seatDecrement() {
    if (this.seats > 0) {
      this.seats = this.seats - 1;
    }
  }

  seatIncrement() {
    this.seats = this.seats + 1;
  }

  listride() {
    console.log("locationFrom", this.locationFrom);
    console.log("locationTo", this.locationTo);
    if (!this.locationFrom || Helper.isEmpty(this.locationFrom.name)) {
      this.global.showToast("Select start location");
    } else if (!this.locationTo || Helper.isEmpty(this.locationTo.name)) {
      this.global.showToast("Select end location");
    } else if (Helper.isEmpty(this.dateTime)) {
      this.global.showToast("Select travel date and time");
    } else if (this.seats < 1) {
      this.global.showToast("Select desired seats");
    } else {
      console.log(this.dateTime);
      let dtMoment = moment(this.dateTime);
      let date = dtMoment.format("YYYY-MM-DD");
      let time = dtMoment.format("HH:mm");
      let days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
      this.navCtrl.push(ListridePage, {
        loc_name_from: this.locationFrom.name, loc_name_to: this.locationTo.name,
        lat_from: this.locationFrom.lat, long_from: this.locationFrom.lng,
        lat_to: this.locationTo.lat, long_to: this.locationTo.lng,
        day: days[dtMoment.day()], date: date, time: time, seats: this.seats
      });
    }
  }

  addZero(num) {
    return String(num < 10 ? ("0" + num) : (num));
  }

}