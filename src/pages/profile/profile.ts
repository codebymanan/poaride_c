import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ClientService } from '../../providers/client.service';
import { FirebaseClient } from '../../providers/firebase.service';
import { Global } from '../../providers/global';
import { User } from '../../models/user.models';
import { Subscription } from 'rxjs/Subscription';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../../models/constants.models';
import { Helper } from '../../models/helper.models';
import { Review } from '../../models/review.models';
import { RatingSummary } from '../../models/rating-summary.models';
import { Rating } from '../../models/rating.models';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, Entry } from '@ionic-native/file';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [ClientService, FirebaseClient, Global]
})
export class ProfilePage {
  private user: User;
  private fileToUpload: any;
  private progress: boolean;
  private subscriptions: Array<Subscription> = [];

  private myprofile: string = "about";

  private reviews: Array<Review> = [];
  private isLoading: boolean;
  private doneAll = false;
  private pageNo = 1;
  private infiniteScroll: any;
  private rating: Rating;

  constructor(private navCtrl: NavController, private service: ClientService, private platform: Platform,
    private firebaseService: FirebaseClient, private translate: TranslateService, private camera: Camera,
    private global: Global, private ng2ImgMax: Ng2ImgMaxService, private file: File) {
    this.user = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.loadReviewSummary();
    this.loadReviews();
  }

  loadReviewSummary() {
    let subscription: Subscription = this.service.getRatings(window.localStorage.getItem(Constants.KEY_TOKEN), Number(this.user.id)).subscribe(res => {
      let ratingSummaries = RatingSummary.defaultArray();
      for (let ratingSummaryResult of res.summary) {
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
        ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / res.total_ratings) * 100);
      }
      res.summary = ratingSummaries;
      this.rating = res;
      this.user.ratings = Number(res.average_rating);
      this.user.ratingscount = res.total_ratings;
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(this.user));
    }, err => {
      console.log('rating_err', err);
    });
    this.subscriptions.push(subscription);
  }

  loadReviews() {
    this.isLoading = true;
    let subscription: Subscription = this.service.myReviews(window.localStorage.getItem(Constants.KEY_TOKEN), String(this.pageNo)).subscribe(res => {
      let reviews: Array<Review> = res.data;
      this.reviews = this.reviews.concat(reviews);
      this.global.dismissLoading();
      this.isLoading = false;
      this.doneAll = (!res.data || !res.data.length);
      if (this.infiniteScroll) {
        this.infiniteScroll.complete();
      }
    }, err => {
      console.log('review_list', err);
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
      this.loadReviews();
    }
  }

  pickPicker(num) {
    if (this.progress)
      return;
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
      // let fileInput = document.getElementById(num == 1 ? "profile-image" : "profile-doc");
      // fileInput.click();
    });
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
        this.progress = false;
        this.user.image_url = String(url);
        this.service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { image_url: String(url) }).subscribe(res => {
          console.log(res);
          window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res));
        }, err => {
          console.log('update_user', err);
        });
      }).catch(err => {
        this.progress = false;
        console.log(err);
        this.global.dismissLoading();
        this.translate.get("uploading_fail").subscribe(value => {
          this.global.presentErrorAlert(value);
        });
      })
    }).catch(err => {
      this.global.dismissLoading();
      this.global.showToast(JSON.stringify(err));
      console.log(err);
    })
  }

  update() {
    if (Helper.isEmpty(this.user.profession)) {
      this.global.showToast("Enter profession");
    } else {
      this.global.presentLoading("Just a moment");
      this.service.updateUser(window.localStorage.getItem(Constants.KEY_TOKEN), { profession: this.user.profession }).subscribe(res => {
        this.global.dismissLoading();
        console.log(res);
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(res));
        this.navCtrl.pop();
      }, err => {
        this.global.dismissLoading();
        console.log('update_user', err);
      });
    }
  }

}