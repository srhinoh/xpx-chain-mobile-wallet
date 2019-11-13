import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { App } from '../../../../providers/app/app';
import { UtilitiesProvider } from '../../../../providers/utilities/utilities';
import { SharedService, ConfigurationForm } from '../../../../providers/shared-service/shared-service';

/**
 * Generated class for the WalletAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-wallet-add',
  templateUrl: 'wallet-add.html'
})
export class WalletAddPage {
  App = App;
  formGroup: FormGroup;
  PASSWORD: string;

  walletColor: string = "wallet-4";
  walletName: string = "Primary";

  tablet: boolean = false;
  configurationForm: ConfigurationForm = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private utils: UtilitiesProvider,
    private translateService: TranslateService,
    private sharedService: SharedService
  ) {

    this.configurationForm = this.sharedService.configurationForm;
    this.walletColor = "wallet-1";
    this.walletName = `<${this.translateService.instant("WALLETS.COMMON.LABEL.WALLET_NAME")}>`;
    this.init();
  }

  changeWalletColor(color) {
    this.walletColor = color;
  }

  ionViewWillEnter() {
    this.utils.setHardwareBack(this.navCtrl);

    // Hide Tabs
    let tabs = document.querySelectorAll('.tabbar');
    if (tabs !== null) {
      Object.keys(tabs).map((key) => {
        // tabs[ key ].style.transform = 'translateY(56px)';
        tabs[key].style.display = 'none';
      });
    } // end if
  }

  ionViewDidLeave() {
    let tabs = document.querySelectorAll('.tabbar');
    if (tabs !== null) {
      Object.keys(tabs).map((key) => {
        tabs[key].style.display = 'flex';
      });
    } // end if
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad WalletAddPage');
  }

  init() {

    if (window.screen.width >= 768) { // 768px portrait
      this.tablet = true;
    }

    this.formGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.nameWallet.minLength),
          Validators.maxLength(this.configurationForm.nameWallet.maxLength)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.minLength(this.configurationForm.passwordWallet.minLength)
        ]
      ]
    });

    // this.authProvider.getPassword().then(password => {
    //   this.PASSWORD = password;
    // });
  }

  gotoBackup(wallet) {
    return this.navCtrl.push('WalletBackupPage', wallet);
  }

  goHome() {
    this.navCtrl.setRoot(
      'TabsPage',
      {
        animate: true
      }
    );
  }

  onSubmit(form) {
    //RJ
    /*this.walletProvider.checkIfWalletNameExists(form.name, '').then(value => {
      if (value) {
        const title = `<${this.translateService.instant("WALLETS.IMPORT.NAME_EXISTS")}>`
        this.alertProvider.showMessage(title);
      } else {


        const newWallet = this.walletProvider.createSimpleWallet({ walletName: form.name, password: form.password });

        // console.log("LOG: WalletAddPage -> onSubmit -> newWallet", newWallet);
this.walletProvider.storeWallet(newWallet, this.walletColor, );
        this.walletProvider.storeWallet({ wallet: newWallet, walletColor: this.walletColor }).then(value => {

          newWallet.walletColor = this.walletColor;
          // console.log("New wallet:", newWallet);
          return this.walletProvider.setSelectedWallet(newWallet);
        }).then(() => {
          this.haptic.notification({ type: 'success' });
          delete newWallet.total;
          delete newWallet.walletColor;
          this.gotoBackup(newWallet);
        });
      }
    });*/
  }

  updateName() {
    let name = this.formGroup.value.name
    // console.log("LOG: WalletAddPage -> updateName -> name", name);
    if (name) {
      this.walletName = name;
    } else {
      this.walletName = `<${this.translateService.instant("WALLETS.COMMON.LABEL.WALLET_NAME")}>`;
    }
  }
}
