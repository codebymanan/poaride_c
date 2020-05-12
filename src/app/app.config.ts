import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
  apiKey: string,
  authDomain: string,
  databaseURL: string,
  projectId: string,
  storageBucket: string,
  messagingSenderId: string,
  webApplicationId: string
}

export interface AppConfig {
  appName: string;
  apiBase: string;
  googleApiKey: string;
  oneSignalAppId: string;
  oneSignalGPSenderId: string;
  stripeKey: string;
  availableLanguages: Array<any>;
  firebaseConfig: FirebaseConfig;
}

export const BaseAppConfig: AppConfig = {
  appName: "PoaRide",
  apiBase: "http://3.130.209.37/",
  googleApiKey: "AIzaSyDkyIvLQUgGocXk7KSrASNc7wD_5bdWZvI",
  oneSignalAppId: "3bbff114-e1c8-4aa3-a226-7b82f632b76c",
  oneSignalGPSenderId: "975656214703",
  stripeKey: "",
  availableLanguages: [{
    code: 'en',
    name: 'English'
  }, {
    code: 'id',
    name: 'Indonesian'
  }],
  firebaseConfig: {
    webApplicationId: "975656214703-292srdgdb2fu43tt2bbroe04ueiub7hg.apps.googleusercontent.com",
    apiKey: "AIzaSyDkyIvLQUgGocXk7KSrASNc7wD_5bdWZvI",
    authDomain: "poaride.firebaseapp.com",
    databaseURL: "https://poaride.firebaseio.com",
    projectId: "poaride",
    storageBucket: "poaride.appspot.com",
    messagingSenderId: "975656214703"
  }
};