import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AlertProvider } from '../../../../providers/alert/alert';
import { App } from '../../../../providers/app/app';
import { ContactsProvider } from '../../../../providers/contacts/contacts';
import { ProximaxProvider } from '../../../../providers/proximax/proximax';
import { TranslateService } from '@ngx-translate/core';
import { WalletProvider } from '../../../../providers/wallet/wallet';

/**
 * Generated class for the ContactAddPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contact-add',
  templateUrl: 'contact-add.html'
})
export class ContactAddPage {
  msgErrorUnsupported: string;
  App = App;
  alfaNumberPattern = '^[a-zA-Z0-9\-\]+$';
  userTelegram = '^[a-zA-Z0-9@]+$';
  formGroup: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public alertProvider: AlertProvider,
    public contactsProvider: ContactsProvider,
    private viewCtrl: ViewController,
    private proximaxProvider: ProximaxProvider,
    private translateService: TranslateService,
    private walletProvider: WalletProvider
  ) {
    this.init();
    this.subscribeValue();

    console.log(this.walletProvider.selectesAccount.account.address.address);
    
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactAddPage');
  }

  init() {
    this.formGroup = this.formBuilder.group({
      name: ['', [Validators.minLength(3), Validators.required]],
      address: ['', [Validators.minLength(40), Validators.maxLength(46),Validators.required, Validators.pattern(this.alfaNumberPattern)]],
      telegram: ['', [Validators.pattern(this.alfaNumberPattern)]]
    });

    if (this.navParams.data) {
      console.log(this.navParams.get('data'));
      this.formGroup.setValue(this.navParams.get('data'));
    }
  }

  gotoHome() {
    this.navCtrl.pop();
  }

  subscribeValue() {
    // Account recipient
    this.formGroup.get('address').valueChanges.subscribe(
      value => {
        const accountRecipient = (value !== undefined && value !== null && value !== '') ? value.split('-').join('') : '';

        if (accountRecipient !== null && accountRecipient !== undefined && accountRecipient.length === 40) {
          if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(this.walletProvider.selectesAccount.account.address.address, accountRecipient)) {
            // this.blockSendButton = true;
            this.msgErrorUnsupported = this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED");
          } else {
            // this.blockSendButton = false;
            this.msgErrorUnsupported = '';
          }
        } else if (!this.formGroup.get('address').getError("required") && this.formGroup.get('address').valid) {
          // this.blockSendButton = true;
          this.msgErrorUnsupported = this.translateService.instant("WALLETS.SEND.ADDRESS.UNSOPPORTED");
        } else {
          // this.blockSendButton = false;
          this.msgErrorUnsupported = '';
        }
      }
    );
  }
  onSubmit(form) {
    const CONTACT_ADDRESS = this.formGroup.get('address').value.toUpperCase().replace('-', '');
   
    const DATA = form;
    if (!this.proximaxProvider.isValidAddress(CONTACT_ADDRESS)) {
      this.alertProvider.showMessage(this.translateService.instant("SERVICES.ADDRESS_BOOK.ADD_ERROR"));
    } else {
      DATA.address = CONTACT_ADDRESS;
      this.contactsProvider.push(DATA).then(result => {
        if(!result){
          this.gotoHome();
        } else{
          this.alertProvider.showMessage(this.translateService.instant("SERVICES.ADDRESS_BOOK.ADD_EXISTS"));
        }
      });
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
