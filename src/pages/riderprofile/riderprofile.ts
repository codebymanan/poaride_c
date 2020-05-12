import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ConfirmridePage } from '../confirmride/confirmride';
import { ChattingPage } from '../chatting/chatting';
import { Helper } from '../../models/helper.models';
import { Day } from '../../models/day.models';
import { ClientService } from '../../providers/client.service';
import { Subscription } from 'rxjs/Subscription';
import { Constants } from '../../models/constants.models';
import { Review } from '../../models/review.models';
import { RatingSummary } from '../../models/rating-summary.models';
import { Rating } from '../../models/rating.models';
import { User } from '../../models/user.models';
import { Chat } from '../../models/chat.models';
import { Profile } from '../../models/profile.models';
import { RideMapPage } from '../ridemap/ridemap';
import { RideInfo } from '../../models/ride-info.models';

@Component({
  selector: 'page-riderprofile',
  templateUrl: 'riderprofile.html',
  providers: [ClientService]
})
export class RiderprofilePage {
  rideprofile: string = "about";
  private profile: Profile;
  private currency: string;
  private days: Array<Day>;
  private reviews: Array<Review> = [];
  private subscriptions: Array<Subscription> = [];
  private isLoading: boolean;
  private doneAll = false;
  private pageNo = 1;
  private infiniteScroll: any;
  private rating: Rating;
  private date: string;
  private time: string;
  private seats: number;

  constructor(private navCtrl: NavController, navParam: NavParams, private service: ClientService) {
    this.profile = navParam.get("profile");
    this.date = navParam.get("date");
    this.time = navParam.get("time");
    this.seats = navParam.get("seats");
    this.currency = Helper.getSetting("currency");
    this.days = Day.getDays();
    if (this.profile.travel_days) {
      for (let d of this.days) {
        d.selected = this.profile.travel_days.includes(d.name);
      }
    }
    this.loadReviewSummary();
    this.loadReviews();
    console.log("profile", this.profile);
  }

  ionViewWillLeave() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  loadReviewSummary() {
    let subscription: Subscription = this.service.getRatings(window.localStorage.getItem(Constants.KEY_TOKEN), this.profile.user_id).subscribe(res => {
      let ratingSummaries = RatingSummary.defaultArray();
      for (let ratingSummaryResult of res.summary) {
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / res.total_ratings) * 100);
      }
      res.summary = ratingSummaries;
      this.rating = res;
    }, err => {
      console.log('rating_err', err);
    });
    this.subscriptions.push(subscription);
  }

  loadReviews() {
    this.isLoading = true;
    let subscription: Subscription = this.service.userReviews(window.localStorage.getItem(Constants.KEY_TOKEN), String(this.pageNo), String(this.profile.user_id)).subscribe(res => {
      let reviews: Array<Review> = res.data;
      this.reviews = this.reviews.concat(reviews);
      this.isLoading = false;
      this.doneAll = (!res.data || !res.data.length);
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
    }, err => {
      console.log('review_list', err);
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
      this.loadReviews();
    }
  }

  continueride() {
    this.navCtrl.push(ConfirmridePage, { profile: this.profile, time: this.time, date: this.date, seats: this.seats });
  }

  chatting() {
    let userMe: User = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    let chat = new Chat();
    chat.chatId = this.profile.user.id + "vd";
    chat.chatImage = this.profile.user.image_url;
    chat.chatName = this.profile.user.name;
    chat.chatStatus = this.profile.profession;
    chat.myId = userMe.id + "vc";
    this.navCtrl.push(ChattingPage, { chat: chat });
  }

  rideMap() {
    if (this.profile.locations) {
      this.navCtrl.push(RideMapPage, { locations: this.profile.locations });
    }
  }

}