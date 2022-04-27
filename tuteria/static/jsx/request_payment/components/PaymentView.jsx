import React from 'react/addons';

import Reflux from 'reflux';
import actions from './../actions.jsx';
import {PriceUpdateMixin} from './../mixins.jsx';
import {PagaFormStore} from './../stores.jsx';
var BankView = React.createClass({
    mixins:[Reflux.connect(PagaFormStore),PriceUpdateMixin],    
    render(){
        var hide_or_show = this.props.display == 2 ? "payment_method2" : "payment_method2 hidden"
        
        return (
            <div className={hide_or_show}>
                <h4 className="no-margin-top font-head"><b>Bank Payment</b></h4>

                <p>Pay into one of the banks below, then please call Godwin on 07083266188 or 
                email info@tuteria.com to confirm receipt of payment.</p>

                <div className="font-head pad-up-18 blue-font">Supported banks</div>
                <hr className="hr-styled"/>


                <div className="bank_payment_method1">
                    <div className="media">
                        <div className="media-left">
                                <img className="media-object" width="50" height="50"
                                     src="/static/img/cards/UBA-PAY.png" />
                        </div>
                        <div className="media-body">
                            <ul className="list-unstyled">
                                <li>Name: <span className="font-head"><b>Tuteria Company</b></span></li>
                                <li>Acct. No: <span className="font-head"><b>1018919564</b></span></li>                                
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="hr-styled"/>
                <div className="bank_payment_method2">
                    <div className="media">
                        <div className="media-left">
                                <img className="media-object" width="50" height="50"
                                     src="/static/img/cards/GTB-PAY.jpg" alt="..." />
                        </div>
                        <div className="media-body">
                            <ul className="list-unstyled">

                                <li>Name: <span className="font-head"><b>Tuteria Company</b></span></li>
                                <li>Acct. No: <span className="font-head"><b>0169418080</b></span></li>                            </ul>
                        </div>
                    </div>
                </div>
            </div>  
        )
    }
});
var PayPalView = React.createClass({
    mixins:[Reflux.connect(PagaFormStore),PriceUpdateMixin],
    render(){
        var hide_or_show = this.props.display == 3 ? "payment_method3" : "payment_method3 hidden"
        var amount = this.state.new_price / parseInt(this.props.paypal_dict.dollar_rate)
        amount = amount.toFixed(2)
        return (
            <div className={hide_or_show}>
                <h4 className="no-margin-top font-head"><b>Pay with PayPal</b></h4>
                <p>By clicking the button below, you'll be directed to PayPal website where you can pay securely with your local debit card or your PayPal email. You'll return here afterwards.</p>

                <small>Payment is charged in dollars, so exchange rate may apply.</small>

                <div className="padding-top-25"></div>


                <form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post" >
                    <input id="id_business" name="business" type="hidden" value={this.props.paypal_dict.business} />
                    <input id="id_amount" name="amount" type="hidden" value={amount} />
                    <input id="id_custom" name="custom" type="hidden" value={this.props.paypal_dict.custom} />
                    <input id="id_item_name" name="item_name" type="hidden" value={this.props.details.user.description}/>
                    <input id="id_notify_url" name="notify_url" type="hidden" value={this.props.paypal_dict.notify_url} />
                    <input id="id_cancel_return" name="cancel_return" type="hidden" value={this.props.paypal_dict.cancel_return} />
                    <input id="id_return_url" name="return" type="hidden" value={this.props.paypal_dict.return_url} />
                    <input id="id_invoice" name="invoice" type="hidden" value={this.props.paypal_dict.invoice} />
                    <input id="id_cmd" name="cmd" type="hidden" value="_xclick" />
                    <input id="id_charset" name="charset" type="hidden" value="utf-8" />
                    <input id="id_currency_code" name="currency_code" type="hidden" value="USD" />
                    <input id="id_no_shipping" name="no_shipping" type="hidden" value="1" />
                    <input id="id_image" name="image" type="hidden" value={this.props.paypal_dict.image} />
                    <input type="image" src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_pponly_142x27.png" border="0" name="submit" alt="Buy it Now" />
                </form>
            </div>
            
        )
    }
})
var PagaView = React.createClass({
    mixins:[Reflux.connect(PagaFormStore),PriceUpdateMixin],
    render(){
        var hide_or_show = this.props.display == 1 ? "payment_method1" : "payment_method1 hidden"
        return (
            <div className={hide_or_show}>
                <h4 className="no-margin-top font-head"><b>Secure Payment</b></h4>
                <form>
                    <input id="id_account_number" name="account_number" type="hidden"
                           value={this.props.details.user.id}/>
                    <input id="id_description" name="description" type="hidden"
                                             value={this.props.details.user.description}/>
                    <input id="id_subtotal" name="subtotal" type="hidden"
                      value={this.state.new_price}/>
                    <input id="id_phoneNumber" name="phoneNumber" type="hidden" value={this.props.details.user.number}/>
                    <input id="id_email" name="email" type="hidden" value={this.props.details.user.email}/>
                    <input id="id_tax" name="tax" type="hidden"/>
                    <input id="id_surcharge" name="surcharge" type="hidden" value="0"/>
                    <input id="id_surcharge_description" name="surcharge_description" type="hidden" value="Booking Fee"/>
                    <input id="id_quantity" name="quantity" type="hidden"/>
                    <input id="id_product_code" name="product_code" type="hidden"/>
                    <input id="id_invoice" name="invoice" type="hidden" value={this.props.details.user.order_id}/>
                    <input id="id_return_url" name="return_url" type="hidden" value={this.props.paga.redirect_url}/>
                    <input id="id_test" name="test" type="hidden" value={this.props.paga.test}/>
                </form>
                <script type="text/javascript"
                        src="https://www.mypaga.com/paga-web/epay/ePay-button.paga?k=bffe463e-d4f8-4b16-a2eb-6a54a0d614c0&e=false&layout=V"></script>
            </div>
        )
    }
});
module.exports = React.createClass({
    getInitialState() {
        return {
            paymentOption:1  
        };
    },
    onPaymentChanged(e){
        var selected = e.currentTarget.value;
        var result = 1;
        if (selected == 'credit_card'){
            result = 1;
        }
        if (selected == 'bank_transfer'){
            result = 2;
        }
        if (selected == 'paypal'){
            result = 3;
        }
        this.setState({paymentOption:result});
    },
    render(){
        return (
            <div>
            <h4 className="font-head row-space-top-4">Load Wallet</h4>
            <p className="row-space-4">Load amount into your wallet and your discount will be applied automatically which you can use to pay for lessons with any tutor on Tuteria.</p>
                <div className="">
                    <div className="col-sm-3 col-xs-12">
                        <form className="form">
                            <label className="radio">
                                <input name="payment_method" type="radio"
                                       value="credit_card"
                                       id="payment_method1"
                                       defaultChecked={true}
                                       onChange={this.onPaymentChanged}  />
                                Pay Online
                            </label>

                            <label className="radio">
                                    <input type="radio" name="payment_method"
                                           value="paypal" id="payment_method3" 
                                           onChange={this.onPaymentChanged} />
                                    Use Paypal
                            </label>

                            <label className="radio">
                                    <input type="radio" name="payment_method"
                                           value="bank_transfer"
                                           id="payment_method2"
                                           onChange={this.onPaymentChanged}
                                           />
                                    Pay to Bank
                            </label>                                                        
                        </form>
                    </div> 
                    <div className="col-xs-12 col-sm-9">
                        <div className="row well credit-card-option">
                            <PagaView display={this.state.paymentOption} {...this.props}/>
                            <BankView display={this.state.paymentOption} {...this.props}/>
                            <PayPalView display={this.state.paymentOption} {...this.props}/>
                        </div>
                    </div>
                    
                </div>
            </div>
        )
    }
});
