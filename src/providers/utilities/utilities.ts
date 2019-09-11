import { Injectable } from '@angular/core';
import { ModalController, Platform, ViewController, NavController, App, Events } from 'ionic-angular';
import { App as AppConfig } from './../app/app';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Clipboard } from '@ionic-native/clipboard';
import { ToastProvider } from '../toast/toast';

/*
  Generated class for the UtilitiesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilitiesProvider {
  AppConfig = AppConfig;

  constructor(
    private app: App,
    private modalCtrl: ModalController,
    private platform: Platform,
    private storage: Storage,
    private events: Events,
    private clipboard: Clipboard,
    private toastProvider: ToastProvider,
  ) {
    console.log('Hello UtilitiesProvider Provider');
  }

  setTabIndex(index) {
    return this.platform.registerBackButtonAction(() => {
      this.events.publish('tab:back', index);
    }, 0);
  }

  setHardwareBack(nav?: NavController) {
    return this.platform.registerBackButtonAction(() => {
      if (nav) nav.pop();
    }, 0);
  }

  disableHardwareBack() {
      this.platform.registerBackButtonAction((event)=>{
          console.log('Prevent Back Button Page Change');
      }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  }   

  setHardwareBackToPage(page: string) {
    return this.platform.registerBackButtonAction(() => {
      this.setRoot(page);
    }, 0);
  }

  setHardwareBackModal(viewCtrl: ViewController) {
    return this.platform.registerBackButtonAction(() => {
      viewCtrl.dismiss();
    }, 0);
  }

  setRoot(page: string, data = {}) {
    console.log(this.app.getActiveNavs());
    this.app.getRootNavs()[0].setRoot(page, data, {
      animate: true,
      // direction: 'backward'
    }).then(() =>{
      this.app.navPop();
      //....
  });;
  }

  copy(text: string, type: string) {
    let message: string = '';

    if (type === 'sender') {
      message = 'Sender\'s address copied successfully';
    } else if (type === 'receiver') {
      message = 'Receiver\'s address copied successfully';
    } else if (type === 'hash') {
      message = 'Hash copied successfully';
    } else if (type === 'message') {
      message = 'Message copied successfully';
    } else if (type === 'cosigner') {
      message = 'Cosigner\'s address copied successfully';
    }

    this.clipboard.copy(text).then(_ => {
      this.toastProvider.show(message, 3, true);
    });
  }

  /**
   * Get the logo of the mosaics
   * @param mosaic The mosaic object for querying the logo
   */
  getLogo(mosaic: any) {
    if (
      mosaic.namespaceId === 'prx' &&
      mosaic.mosaicId === 'xpx' || mosaic.mosaicId ===  '3c0f3de5298ced2d'
    ) {
      return AppConfig.LOGO.XPX;
    } else if (
      mosaic.namespaceId === 'pundix' &&
      mosaic.mosaicId === 'npxs' || mosaic.mosaicId === '1e29b3356f3e24e5'
    ) {
      return AppConfig.LOGO.NPXS;
    } else if (
      mosaic.namespaceId === 'sportsfix' &&
      mosaic.mosaicId === 'sft' || mosaic.mosaicId === '33b0efbf4a600cc9'
    ) {
      return AppConfig.LOGO.SFT;
    } else if (
      mosaic.namespaceId === 'xarcade' &&
      mosaic.mosaicId === 'xar' || mosaic.mosaicId === '59096674da68a7e5'
    ) {
      return AppConfig.LOGO.XAR;
    } else {
      return AppConfig.LOGO.DEFAULT;
    }
  }

    /**
   * Get the logo of the specified language
   * @param lange The language object for getting the logo
   */
  getFlag(lang) {
    if (lang.value == "cn") {
      return AppConfig.FLAGS.CN;
    } else if (lang.value == "en") {
      return AppConfig.FLAGS.EN;
    }  else if (lang.value == "es") {
      return AppConfig.FLAGS.ES;
    } else if (lang.value == "fr") {
      return AppConfig.FLAGS.FR;
    } else if (lang.value == "jp") {
      return AppConfig.FLAGS.JP;
    } else if (lang.value == "kr") {
      return AppConfig.FLAGS.KR;
    }
     else if (lang.value == "nl") {
      return AppConfig.FLAGS.NL;
    } else if (lang.value == "ru") {
      return AppConfig.FLAGS.RU;
    } 
  }

  /**
   * Show inset modal
   * @param page { Component || string } The page to set as modal.
   * @param data { Object } Any data to pass when modal is shown
   */
  showModal(page, data = {}): Observable<any> {
    const modal = this.modalCtrl.create(page, data, {
      enableBackdropDismiss: false,
      showBackdrop: true
    });

    this.storage.set('isModalShown', true).then(() => {
      modal.present();
    });

    return new Observable(observer => {
      modal.onDidDismiss(data => {
        observer.next(data);
      });
    });
  }

  /**
   * Show inset modal
   * @param page { Component || string } The page to set as modal.
   * @param data { Object } Any data to pass when modal is shown
   */
  showInsetModal(page, data = {}, size = ''): Observable<any> {
    const modal = this.modalCtrl.create(page, data, {
      cssClass: `inset-modal ${size}`,
      enableBackdropDismiss: true,
      showBackdrop: true
    });
    modal.present();

    return new Observable(observer => {
      modal.onDidDismiss(data => {
        observer.next(data);
      });
    });
  }
}
