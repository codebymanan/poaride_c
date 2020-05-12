import { NavController, MenuController, ToastController, NavParams } from 'ionic-angular';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMaps } from '../../providers/google-maps';
import { RideInfo } from '../../models/ride-info.models';
import { } from '@types/googlemaps';
import { RideLocation } from '../../models/ride-location.models';

@Component({
  selector: 'page-ridemap',
  templateUrl: 'ridemap.html'
})
export class RideMapPage {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('pleaseConnect') pleaseConnect: ElementRef;
  private rideInfo: RideInfo;
  private initialized: boolean;
  private markerFrom: google.maps.Marker;
  private markerTo: google.maps.Marker;
  private markerMe: google.maps.Marker;
  private posBonds: google.maps.LatLngBounds;
  private locations: Array<RideLocation>;
  private locationsMarkers: Array<google.maps.Marker>;

  constructor(private navCtrl: NavController, private menuCtrl: MenuController,
    navParam: NavParams, private maps: GoogleMaps, private toastCtrl: ToastController) {
    this.menuCtrl.enable(false, 'myMenu');
    this.rideInfo = navParam.get("rideInfo");
    if (!this.rideInfo) this.locations = navParam.get("locations");
    if (this.locations) {
      let locations = new Array<RideLocation>();
      for (let loc of this.locations) {
        if ((!loc.is_return || loc.is_return != 1) && loc.type == "pickup") {
          locations.push(loc);
        }
      }
      for (let loc of this.locations) {
        if ((!loc.is_return || loc.is_return != 1) && loc.type == "drop") {
          locations.push(loc);
        }
      }
      this.locations = locations;
      this.locationsMarkers = new Array<google.maps.Marker>();
    }
  }

  ionViewDidLoad(): void {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement).then(() => {
        this.initialized = true;
        this.plotMarkers();
      }).catch(err => {
        console.log(err);
        this.navCtrl.pop();
      });
      mapLoaded.catch(err => {
        console.log(err);
        this.navCtrl.pop();
      });
    }
  }

  plotMarkers() {
    const component = this;
    this.posBonds = new google.maps.LatLngBounds();
    let posFrom = new google.maps.LatLng(Number(this.rideInfo ? this.rideInfo.latitude_from : (this.locations && this.locations[0]) ? this.locations[0].latitude : 0), Number(this.rideInfo ? this.rideInfo.longitude_from : (this.locations && this.locations[0]) ? this.locations[0].longitude : 0));
    let posTo = new google.maps.LatLng(Number(this.rideInfo ? this.rideInfo.latitude_to : (this.locations && this.locations.length >= 2) ? this.locations[this.locations.length - 1].latitude : 0), Number(this.rideInfo ? this.rideInfo.longitude_to : (this.locations && this.locations.length) ? this.locations[this.locations.length - 1].longitude : 0));
    if (this.rideInfo) {
      this.posBonds.extend(posFrom);
      this.posBonds.extend(posTo);
      if (!this.markerFrom) {
        this.markerFrom = new google.maps.Marker({
          position: posFrom,
          map: this.maps.map,
          icon: 'assets/imgs/ic_pickup.png'
        });
        let infoMe = new google.maps.InfoWindow({
          content: this.rideInfo.address_from
        });
        this.markerFrom.addListener('click', function () {
          infoMe.open(component.maps.map, component.markerFrom);
        });
      }
      else {
        this.markerFrom.setPosition(posFrom);
      }

      if (!this.markerTo) {
        this.markerTo = new google.maps.Marker({
          position: posTo,
          map: this.maps.map,
          icon: 'assets/imgs/ic_drop.png'
        });
        let infoMe = new google.maps.InfoWindow({
          content: this.rideInfo.address_to
        });
        this.markerTo.addListener('click', function () {
          infoMe.open(component.maps.map, component.markerTo);
        });
      }
      else {
        this.markerTo.setPosition(posTo);
      }

      setTimeout(() => {
        this.maps.map.panTo(this.posBonds.getCenter());
      }, 200);
    } else if (this.locations && this.locations.length >= 2) {
      for (let loc of this.locations) {
        let locMark = new google.maps.Marker({
          position: new google.maps.LatLng(Number(loc.latitude), Number(loc.longitude)),
          map: this.maps.map,
          icon: loc.type == "pickup" ? "assets/imgs/ic_pickup.png" : "assets/imgs/ic_drop.png"
        });
        let infoMe = new google.maps.InfoWindow({
          content: loc.address
        });
        locMark.addListener('click', function () {
          infoMe.open(component.maps.map, locMark);
        });
      }
    }

    if (this.rideInfo || (this.locations && this.locations.length >= 2)) {
      let directionsService = new google.maps.DirectionsService();
      let directionsDisplay = new google.maps.DirectionsRenderer({
        map: this.maps.map,
        polylineOptions: {
          strokeColor: '#000000',
          strokeOpacity: 1.0,
          strokeWeight: 5
        },
        markerOptions: {
          opacity: 0,
          clickable: false,
          position: posFrom
        }
      });
      let dirReq: any = {
        origin: posFrom,
        destination: posTo,
        travelMode: google.maps.TravelMode.DRIVING
      };
      if (this.locations && this.locations.length > 2) {
        let waypoints = new Array<{ location: google.maps.LatLng, stopover: boolean }>();
        for (let i = 1; i < this.locations.length - 1; i++) {
          waypoints.push({ stopover: false, location: new google.maps.LatLng(Number(this.locations[i].latitude), Number(this.locations[i].longitude)) });
        }
        dirReq = {
          origin: posFrom,
          destination: posTo,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING
        };
      }
      directionsService.route(dirReq, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
        }
      });

    }

  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }

}