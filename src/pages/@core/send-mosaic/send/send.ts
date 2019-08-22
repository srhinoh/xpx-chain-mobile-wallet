import { GetBalanceProvider } from './../../../../providers/get-balance/get-balance';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, Platform } from 'ionic-angular';
import {
  SimpleWallet,
  Password,
  Account,
  AccountInfo
} from 'tsjs-xpx-chain-sdk';

import { App } from '../../../../providers/app/app';
import { NemProvider } from './../../../../providers/nem/nem';
import { WalletProvider } from './../../../../providers/wallet/wallet';
import { UtilitiesProvider } from '../../../../providers/utilities/utilities';
import { AlertProvider } from '../../../../providers/alert/alert';

import { CoingeckoProvider } from '../../../../providers/coingecko/coingecko';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { AuthProvider } from '../../../../providers/auth/auth';
import { MosaicsProvider } from '../../../../providers/mosaics/mosaics';
import { ProximaxProvider } from '../../../../providers/proximax/proximax';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the SendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-send',
  templateUrl: 'send.html'
})
export class SendPage {

  wallet: string;
  msgErrorBalance: any;
  msgErrorUnsupported: any;
  mosaicWallet: any[];
  mosaics: any = [];
  App = App;
  addressSourceType: { from: string; to: string };
  currentWallet: SimpleWallet;
  selectedMosaic: any;
  selectedCoin: any;
  form: FormGroup;
  fee: number = 0;
  amount: number;
  mosaicSelectedName: string;
  amountPlaceholder: string = "0";
  periodCount = 0;
  decimalCount: number = 0;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public nemProvider: NemProvider,
    public getBalanceProvider: GetBalanceProvider,
    public walletProvider: WalletProvider,
    public utils: UtilitiesProvider,
    public alertProvider: AlertProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private coingeckoProvider: CoingeckoProvider,
    private barcodeScanner: BarcodeScanner,
    private storage: Storage,
    public platform: Platform,
    private authProvider: AuthProvider,
    public mosaicsProvider: MosaicsProvider,
    private proximaxProvider: ProximaxProvider,
    private translateService: TranslateService,
  ) {
    this.mosaicSelectedName = this.navParams.get('mosaicSelectedName');

    console.log('this.mosaicSelectedName', this.mosaicSelectedName)
    // If no mosaic selected, fallback to xpx
    if (!this.mosaicSelectedName) {
      this.mosaicSelectedName = 'xpx';
    }

    this.init();
    this.subscribeValue();
  }

  ionViewWillEnter() {
    this.utils.setHardwareBack(this.navCtrl);
    this.walletProvider.getSelectedWallet().then(currentWallet => {
      console.log('currentWallet ', currentWallet)
      
      if (!currentWallet) {
        this.navCtrl.setRoot(
          'TabsPage',
          {},
          {
            animate: true,
            direction: 'backward'
          }
        );
      } else {
        if (this.selectedMosaic) {
          this.selectedMosaic;
          this.form.get('amount').setValue(null);
        } else {
          // this.mosaics = [{
          //   mosaicId: "xpx", 
          //   namespaceId: "prx", 
          //   hex: "3c0f3de5298ced2d", 
          //   amount: "0.000000"
          // }]
          // console.log('por defecto', this.mosaics)
          this.currentWallet = currentWallet;
          this.getAccount(this.currentWallet).subscribe(account => {
            this.wallet = account.address.plain()
            this.getAccountInfo(account).subscribe(async accountInfo => {
              this.mosaicWallet = accountInfo.mosaics
              this.selectedMosaic = accountInfo.mosaics
              await this.mosaicsProvider.getArmedMosaic( this.selectedMosaic ).then(result => {
                result.forEach(mosaics => {
                    if (mosaics.mosaicId === 'xpx') {
                      this.mosaics = mosaics
                      this.selectedMosaic = mosaics
                    }
    
                    let mosaic = this.mosaics.mosaicId;
                    let coinId: string;
    
                    if (mosaic === 'xpx') {
                      coinId = 'proximax';
                    } else if (mosaic === 'npxs') {
                      coinId = 'pundi-x';
                    }
                    // Get coin price
                    if (coinId) {
                      this.coingeckoProvider.getDetails(coinId).subscribe(coin => {
                        this.selectedCoin = coin;
                      });
                    }
                  })
              })
            });
          });
        }
        // Set sender address to currenWallet.address
        this.form.get('senderName').setValue(this.currentWallet.name);
        this.form
          .get('senderAddress')
          .setValue(this.currentWallet.address);
      }
    });
  }

  private getAccountInfo(account: Account): Observable<AccountInfo> {
    return new Observable(observer => {
      const accountInfo = this.walletProvider.getAccountInfo(account);
      accountInfo.subscribe(accountInfo => {
        observer.next(accountInfo);
      });
    });
  }

  private getAccount(wallet: SimpleWallet): Observable<Account> {
    return new Observable(observer => {
      // Get user's password and unlock the wallet to get the account
      this.authProvider
        .getPassword()
        .then(password => {
          // Get user's passwordmosaics
          const myPassword = new Password(password);

          // Convert current wallet to SimpleWallet
          const myWallet = this.walletProvider.convertToSimpleWallet(wallet)

          // Unlock wallet to get an account using user's password 
          const account = myWallet.open(myPassword);

          observer.next(account);
        });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendPage');
    this.storage.set('isQrActive', true);
  }

  ionViewDidLeave() {
    this.storage.set('isQrActive', false);
  }

  init() {
    // Initialize form
    this.form = this.formBuilder.group({
      senderName: '',
      senderAddress: [''],
      recipientName: '',
      recipientAddress: ['', Validators.required],
      isMosaicTransfer: [false, Validators.required],
      message: [''],
      amount: ['', Validators.required],
      fee: ['']
    });

    // Initialize source type of NEM address in from and to
    this.addressSourceType = {
      from: 'contact',
      to: 'contact'
    };

    // Defaults to manual contact input
    this.addressSourceType.to = 'manual';
    if (this.addressSourceType.to === 'manual') {
      this.form.get('recipientAddress').setValue('');
    }

    this.fee = 0;
    this.amount = null;
  }

  subscribeValue() {
    // Account recipient
    // this.form.get('recipientAddress').valueChanges.subscribe(
    //   value => {
    //     const accountRecipient = (value !== undefined && value !== null && value !== '') ? value.split('-').join('') : '';

    //     if (accountRecipient !== null && accountRecipient !== undefined && accountRecipient.length === 40) {
    //       if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(this.wallet, accountRecipient)) {
    //         this.msgErrorUnsupported = this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED");
    //       } else {
    //         this.msgErrorUnsupported = '';
    //       }
    //     } else if (!this.form.get('recipientAddress').getError("required") && this.form.get('recipientAddress').valid) {
    //       this.msgErrorUnsupported = this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED");
    //     } else {
    //       this.msgErrorUnsupported = '';
    //     }
    //   }
    // );

    this.form.get('amount').valueChanges.subscribe(
      value => {
        console.log('value', String(value))
        console.log('value', typeof(this.mosaics.amount))
        if (value > this.mosaics.amount) {
          this.msgErrorBalance = this.translateService.instant("WALLETS.SEND.ERROR.BALANCE");
        } else {
          this.msgErrorBalance = '';
        }
      }
    );
  }

  onChangeFrom(val) {
    if (val === 'manual') {
      this.form.get('senderName').setValue(null);
      this.form.get('senderAddress').setValue(null);
    } else {
      this.form.get('senderName').setValue('Current wallet');
      this.form
        .get('senderAddress')
        .setValue(this.currentWallet.address.plain());
    }
  }

  onChangeTo(val) {
    if (val === 'manual') {
      this.form.get('recipientName').setValue(null);
      this.form.get('recipientAddress').setValue(null);
    }
    if (val === 'qrcode') {
      this.scan();
    }
  }

  selectMosaic() {
    this.utils
      .showInsetModal('SendMosaicSelectPage', {
        selectedMosaic: this.mosaicWallet,
        walletAddress: this.currentWallet.address.plain()
      })
      .subscribe(data => {
        if (data) {
          this.optionsXPX = {
            prefix: '',
            thousands: ',',
            decimal: '.',
            precision: data.disivitity
          };
          console.log('mosaics retornado', data)
          this.selectedMosaic = data;
          this.mosaics = data;
        }
      });
  }

  selectContact(title) {
    this.utils
      .showInsetModal('SendContactSelectPage', { title: title })
      .subscribe(data => {
        if (data != undefined || data != null) {
          this.form.get('recipientName').setValue(data.name);
          this.form.get('recipientAddress').setValue(data.address);
        }
      });
  }

  /**
   * Sets transaction amount and determine if it is mosaic or xem transaction, updating fees
   */
  onSubmit() {
    if (!this.form.get('amount').value) this.form.get('amount').setValue(0);
    if (
      !this.form.get('senderAddress').value ||
      !this.form.get('recipientAddress').value
    ) {
      if (this.addressSourceType.to === 'contact') {
        this.alertProvider.showMessage('Please select a recipient first.');
      } else {
        this.alertProvider.showMessage(
          "Please enter the recipient's address first."
        );
      }
      return;
    }

    try {
      let recipient = (
        this.form
          .get('recipientAddress')
          .value.toUpperCase()
          .replace('-', '')
      );

      // Check the validity of an address
      // if (this.proximaxProvider.isValidAddress(recipient)) {
      //   console.log('-------------' )
      //   this.alertProvider.showMessage(
      //     this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED")
      //   );
      // } else {
        // Compute total
        // let total = this.selectedCoin.market_data.current_price.usd * Number(this.form.get('amount').value);
        const prueba = this.selectedCoin.market_data.current_price.usd;
        console.log('por este multiploca', prueba)
        let total = this.selectedCoin.market_data.current_price.usd * Number(this.form.get('amount').value);

        // Show confirm transaction
        let page = "SendMosaicConfirmationPage";
        const modal = this.modalCtrl.create(page, {
          ...this.form.value,
          mosaic: this.selectedMosaic,
          currentWallet: this.currentWallet,
          transactionType: 'normal',
          total: total
        }, {
            enableBackdropDismiss: false,
            showBackdrop: true
          });
        modal.present();
      // }
    } catch (err) {
      console.log('puto')
      this.alertProvider.showMessage(
        this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED")
      );
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  scan() {
    this.storage.set("isQrActive", true);
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      barcodeData.format = "QR_CODE";
      let payload = JSON.parse(barcodeData.text);
      this.form.patchValue({ recipientName: payload.data.name })
      this.form.patchValue({ recipientAddress: payload.data.addr })
      // this.storage.set('isModalShown', false);
    }).catch(err => {
      console.log('Error', err);
      if (err.toString().indexOf(this.translateService.instant("WALLETS.SEND.ERROR.CAMERA1")) >= 0) {
        let message = this.translateService.instant("WALLETS.SEND.ERROR.CAMERA2")
        this.alertProvider.showMessage(message);
        // this.storage.set('isModalShown', false);
      }
    });
  }

  clearPlaceholder() {
    this.amountPlaceholder = "";
  }

  countDecimals(value) {
    if (Math.floor(value) !== value)
      return value.toString().split(".")[1].length || 0;
    return 0;
  }

  checkAllowedInput(e) {
    const AMOUNT = this.form.get('amount').value;
    console.log("LOG: SendPage -> checkAllowedInput -> AMOUNT", AMOUNT);

    // Prevent "+" and "-"
    if (e.key === "-" || e.key === "+" || e.charCode === 43 || e.charCode === 45 || e.keyCode === 189 || e.keyCode === 187 || e.key === "Unindentified" || e.keyCode === 229) {
      e.preventDefault();
      if (AMOUNT == null) {
        this.form.get('amount').setValue("")
        this.form.get('amount').reset();
        this.periodCount = 0
      }
    }

    if (AMOUNT == null) {
      this.periodCount = 0;
    }

    if (this.decimalCount >= 6 && e.key !== "Backspace") {
      e.preventDefault();
    }

    if ((e.charCode >= 48 && e.charCode <= 57) || (e.key == "." || e.charCode == 46 || e.keyCode == 8 || e.key == "Backspace")) {

      // Check for "." or char code "46"
      if (e.key == "." || e.charCode == 46) {
        ++this.periodCount;
      }

      if (this.periodCount > 1) {
        e.preventDefault();
        --this.periodCount;
      }
      console.log("LOG: SendPage -> checkAllowedInput -> this.periodCount", this.periodCount);
    }
  }
}
