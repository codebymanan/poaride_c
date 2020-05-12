import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignInRequest } from '../models/signin-request.models';
import { SignUpRequest } from '../models/signup-request.models';
import { Setting } from '../models/setting.models';
import { BaseListResponse } from '../models/base-list.models';
import { RefineSetting } from '../models/refine-setting.models';
import { MyLocation } from '../models/my-location.models';
import { Address } from '../models/address.models';
import { Constants } from '../models/constants.models';
import { Review } from '../models/review.models';
import { SupportRequest } from '../models/support-request.models';
import { Rating } from '../models/rating.models';
import { User } from '../models/user.models';
import { Appointment } from '../models/appointment.models';
import { AppointmentRequest } from '../models/appointment-request.models';
import { RateRequest } from '../models/rate-request.models';
import { WalletResponse } from '../models/wallet-response.models';
import { BankDetail } from '../models/bank-detail.models';
import { Faq } from '../models/faq.models';
import { RideLocation } from '../models/ride-location.models';
import { Helper } from '../models/helper.models';

@Injectable()
export class ClientService {

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {

  }

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
      return Observable.of(data);
    });
  }

  public walletHistory(token, pageNo): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/wallet/transactions?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let wh of data.data) {
        wh.amount = Number(wh.amount.toFixed(0));
        wh.created_at = Helper.formatTimestampDateTime(wh.created_at);
        wh.updated_at = Helper.formatTimestampTime(wh.updated_at);
      }
      return Observable.of(data);
    });
  }

  public getUser(token: string): Observable<User> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<User>(this.config.apiBase + "api/user", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public logActivity(token: string): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<{}>(this.config.apiBase + 'api/activity-log', {}, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public signUp(signUpRequest: SignUpRequest): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/register", JSON.stringify(signUpRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public userReviews(token: string, pageNo: string, userId: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/user/ratings/" + userId + "?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let review of data.data) {
        review.created_at = Helper.formatTimestampDate(review.created_at);
      }
      return Observable.of(data);
    });
  }

  public getRatings(token: string, userId: number): Observable<Rating> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<Rating>(this.config.apiBase + "api/user/ratings/" + userId + "/summary", { headers: myHeaders }).concatMap(data => {
      data.average_rating = Number(data.average_rating).toFixed(2);
      return Observable.of(data);
    });
  }

  public myReviews(token: string, pageNo: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/user/ratings?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let review of data.data) {
        review.created_at = Helper.formatTimestampDate(review.created_at);
      }
      return Observable.of(data);
    });
  }

  public rateUser(token: string, uId: number, rateRequest: RateRequest): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<{}>(this.config.apiBase + "api/user/ratings/" + uId, JSON.stringify(rateRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateUser(token: string, requestBody: any): Observable<User> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.put<User>(this.config.apiBase + "api/user", requestBody, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public forgetPassword(resetRequest: any): Observable<ResetPasswordResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<ResetPasswordResponse>(this.config.apiBase + "api/forgot-password", JSON.stringify(resetRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public verifyMobile(verifyRequest: any): Observable<AuthResponse> {
    let api = this.config.apiBase + "api/verify-mobile";
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(api, JSON.stringify(verifyRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public appointments(token: string, pageNo: number): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/ride?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
      for (let ap of data.data) {
        this.presetAppointment(ap);
      }
      return Observable.of(data);
    });
  }

  public appointmentCancel(token: string, apId: number): Observable<Appointment> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<Appointment>(this.config.apiBase + "api/customer/ride/" + apId + '/cancel/', {}, { headers: myHeaders }).concatMap(ap => {
      this.presetAppointment(ap);
      return Observable.of(ap);
    });
  }

  public loginSocial(socialLoginRequest: any): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/social/login", JSON.stringify(socialLoginRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public login(loginRequest: SignInRequest): Observable<AuthResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(this.config.apiBase + "api/login", JSON.stringify(loginRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public listRides(token: string, pageNo: string, queryParams: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/providers?page=" + pageNo + "&" + queryParams, { headers: myHeaders }).concatMap(data => {
      for (let ride of data.data) {
        ride.created_at = Helper.formatTimestampDate(ride.created_at);
        if (ride.time_return) {
          let timeReturnSplit = ride.time_return.split(":");
          let timeReturnHour = Number(timeReturnSplit[0]);
          ride.time_return = this.addZero(timeReturnHour > 11 ? Math.abs(12 - timeReturnHour) : timeReturnHour) + ":" + this.addZero(Number(timeReturnSplit[1])) + (timeReturnHour > 11 ? " pm" : " am");
        }
        if (ride.time_start) {
          let timeStartSplit = ride.time_start.split(":");
          let timeStartHour = Number(timeStartSplit[0]);
          ride.time_start = this.addZero(timeStartHour > 11 ? Math.abs(12 - timeStartHour) : timeStartHour) + ":" + this.addZero(Number(timeStartSplit[1])) + (timeStartHour > 11 ? " pm" : " am");
        }
        ride.locationsToShow = new Array<RideLocation>();
        if (ride.locations) {
          for (let location of ride.locations) {
            if (!ride.pickup_location && location.id == ride.pickup_location_id) ride.pickup_location = location;
            if (location.is_return == 0 && location.type == "pickup") ride.locationsToShow.push(location);
          }
          for (let location of ride.locations) {
            if (!ride.drop_location && location.id == ride.drop_location_id) ride.drop_location = location;
            if (location.is_return == 0 && location.type == "drop") ride.locationsToShow.push(location);
          }
        }
        if (ride.travel_days) ride.travel_days_array = ride.travel_days.split(",");
        if (ride.vehicle_details) ride.vehicle_details_array = ride.vehicle_details.split("|");
        if (!ride.user.ratings) ride.user.ratings = 0;
      }
      return Observable.of(data);
    });
  }

  public faqs(): Observable<Array<Faq>> {
    const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
    return this.http.get<Array<Faq>>(this.config.apiBase + 'api/faq-help', { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public ridePrice(token: string, appointmentRequest: AppointmentRequest): Observable<{ price: number }> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<{ price: number }>(this.config.apiBase + "api/customer/ride/estimate/" + appointmentRequest.provider_id + "?latitude_from=" + appointmentRequest.latitude_from + "&longitude_from=" + appointmentRequest.longitude_from + "&latitude_to=" + appointmentRequest.latitude_to + "&longitude_to=" + appointmentRequest.longitude_to + "&seats=" + appointmentRequest.seats, { headers: myHeaders }).concatMap(data => {
      data.price = data.price ? Number(data.price.toFixed(2)) : 0;
      return Observable.of(data);
    });
  }

  public createAppointment(token: string, appointmentRequest: AppointmentRequest): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<{}>(this.config.apiBase + "api/customer/ride", appointmentRequest, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public referralRefer(token: string, code: string): Observable<{}> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<{}>(this.config.apiBase + "api/user/refer", { "code": code }, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public walletWithdraw(token, amount): Observable<WalletResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<WalletResponse>(this.config.apiBase + "api/wallet/withdraw/", JSON.stringify({ "amount": amount }), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public bankDetailUpdate(token, bankDetailUpdateRequest): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<BankDetail>(this.config.apiBase + "api/bank-detail/", JSON.stringify(bankDetailUpdateRequest), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public bankDetail(token): Observable<BankDetail> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BankDetail>(this.config.apiBase + "api/bank-detail/", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public walletBalance(token): Observable<WalletResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<WalletResponse>(this.config.apiBase + "api/wallet/check-balance/", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public walletRecharge(token, amount, stripeToken): Observable<WalletResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.post<WalletResponse>(this.config.apiBase + "api/wallet/recharge/", JSON.stringify({ "token": stripeToken, "amount": amount }), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getSettings(): Observable<Array<Setting>> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
    return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  private presetAppointment(ap: Appointment) {
    ap.created_at = Helper.formatTimestampDateTime(ap.created_at);
    ap.updated_at = Helper.formatTimestampTime(ap.updated_at);
    ap.ride_on_time = Helper.formatTimestampTime(ap.ride_on);
    ap.ride_on_date = Helper.formatTimestampDate(ap.ride_on);
    ap.ride_on = Helper.formatTimestampDateTime(ap.ride_on);
    ap.provider.created_at = Helper.formatTimestampDateTime(ap.provider.created_at);

    ap.provider.locationsToShow = new Array<RideLocation>();
    if (ap.provider.locations) {
      for (let location of ap.provider.locations) {
        if (!ap.provider.pickup_location && location.id == ap.provider.pickup_location_id) ap.provider.pickup_location = location;
        if (location.is_return == 0 && location.type == "pickup") ap.provider.locationsToShow.push(location);
      }
      for (let location of ap.provider.locations) {
        if (!ap.provider.drop_location && location.id == ap.provider.drop_location_id) ap.provider.drop_location = location;
        if (location.is_return == 0 && location.type == "drop") ap.provider.locationsToShow.push(location);
      }
    }

    if (ap.provider.time_return) ap.provider.time_return = ap.provider.time_return.substring(0, ap.provider.time_return.lastIndexOf(":"));
    if (ap.provider.time_start) ap.provider.time_start = ap.provider.time_start.substring(0, ap.provider.time_start.lastIndexOf(":"));
    if (ap.provider.travel_days) ap.provider.travel_days_array = ap.provider.travel_days.split(",");
    if (ap.provider.vehicle_details) ap.provider.vehicle_details_array = ap.provider.vehicle_details.split("|");
    if (!ap.provider.user.ratings) ap.provider.user.ratings = 0;
    if (!ap.user.ratings) ap.user.ratings = 0;
    ap.provider.user.ratings = Number(ap.provider.user.ratings.toFixed(1));
    ap.user.ratings = Number(ap.user.ratings.toFixed(1));
    let rating = window.localStorage.getItem("rate" + ap.id);
    ap.myRating = rating ? Number(rating) : -1;
  }



  public contactUs(adminToken: string, obj): Observable<SupportRequest> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .post<SupportRequest>(this.config.apiBase + 'api/support', obj, { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public saveAddress(adminToken: string, obj): Observable<Address> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .post<Address>(this.config.apiBase + 'api/customer/address', obj, { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public tougleFavourite(adminToken: string, id, value): Observable<{}> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    let obj = { "favourite": (value == 0 ? 1 : 0) };
    return this.http.post<{}>(this.config.apiBase + 'api/customer/favourite/' + id, obj, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getFavourites(adminToken: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .get<BaseListResponse>(this.config.apiBase + 'api/customer/favourite', { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public getOrders(adminToken: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .get<BaseListResponse>(this.config.apiBase + 'api/customer/order', { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public createOrder(adminToken: string, obj): Observable<Address> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .post<Address>(this.config.apiBase + 'api/customer/order', obj, { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public stripePayment(adminToken: string, orderId, token): Observable<{}> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http.post<{}>(this.config.apiBase + 'api/customer/order/' + orderId + '/payment/stripe', JSON.stringify(token), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public updateAddress(adminToken: string, obj: Address): Observable<Address> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    var url = this.config.apiBase + 'api/customer/address/' + obj.id + '/update';
    delete (obj.id);
    return this.http
      .post<Address>(url, obj, { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public getAddressList(adminToken: string): Observable<Array<Address>> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + adminToken
    });
    return this.http
      .get<Array<Address>>(this.config.apiBase + 'api/customer/address', { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }

  public postReview(review, id): Observable<Review> {
    const myHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem(Constants.KEY_TOKEN)
    });
    return this.http
      .post<Review>(this.config.apiBase + 'api/customer/rating/' + id, review, { headers: myHeaders })
      .concatMap(data => {
        return Observable.of(data);
      });
  }











  public categories(token: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/category", { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  public getStoreRatings(token: string, id): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/rating/" + id, { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }













  public searchStores(token: string, query: string, location: MyLocation, refineSetting: RefineSetting, category_id: string, page: string): Observable<BaseListResponse> {
    const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    let urlParams = new URLSearchParams();
    if (query && query.length)
      urlParams.append("search", query);
    if (category_id && category_id.length)
      urlParams.append("category_id", category_id);
    urlParams.append("lat", location.lat);
    urlParams.append("long", location.lng);
    urlParams.append("cost_for_two_min", String(refineSetting.cost_for_two_min));
    urlParams.append("cost_for_two_max", String(refineSetting.cost_for_two_max));
    urlParams.append("veg_only", refineSetting.vegOnly ? "1" : "0");
    urlParams.append("cost_for_two_sort", String(refineSetting.cost_for_two_sort));
    urlParams.append("page", page);
    console.log('url', this.config.apiBase + "customer/store?" + urlParams.toString());
    console.log('header', token);
    return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/store?" + urlParams.toString(), { headers: myHeaders }).concatMap(data => {
      return Observable.of(data);
    });
  }

  private addZero(num) {
    return String(num < 10 ? ("0" + num) : (num));
  }

}