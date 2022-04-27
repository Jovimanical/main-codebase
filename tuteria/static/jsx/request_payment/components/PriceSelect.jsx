import React from "react";
import Reflux from "reflux";
var {CSSTransitionGroup} = React.addons;
import PaymentView from "./PaymentView.jsx"
import actions from './../actions.jsx';
import {Selection} from "./PaymentModeForm.jsx";
import {PriceSelectStore} from "./../stores.jsx";

module.exports = React.createClass({
    mixins:[Reflux.connect(PriceSelectStore)],
    selectPaymentOption(){

      actions.setPaymentOption({
        value:React.findDOMNode(this.refs.pay_later_option).value,
        csrftoken:this.props.csrftoken,
        url: this.props.url,
        redirect_url: this.props.details.user.redirect_url
      })
    },
    render(){
        var child ='';
        var display_third = this.props.details.user.wallet_amount > parseFloat(this.props.details.user.price) ?
          <option value="3">Use wallet balance</option> : null;
        if(this.state.pay_later){
          child = (
            <div key={23} >
            <div>
            <br/>
            <div className="well bg-info">
            {this.props.details.user.paid_before === false ? "Great, you can choose to pay later but please note that the discount offer will no longer apply. Most clients pay now to enjoy 5-10% discount. If you still prefer to pay later, please indicate if you'll be paying by bank or online."
            :"Great! Please indicate if you'll be paying by bank or online."}
            </div>
            <div className="form-group">
                <label className="control-label">How will you pay?</label>
                <select ref="pay_later_option" name="" id="" className="form-control" onChange={this.selectPaymentOption}>
                    <option value="">Select Payment Option</option>
                    <option value="1">Online Payment</option>
                    <option value="2">Bank Transfer</option>
                    {display_third}
                </select>
            </div>

            </div>
            </div>
        )
        }
        var new_price = parseFloat(this.props.details.user.price).toFixed(0);
        var price2 = 70000;
        var price3 = 150000;
        var text_price = `Choose your best discount package to help you save money on tutoring. Discounts can be used anytime and they never expire.`;
        
        return (

            <div className="panel">
                <div className="panel-body">
                {this.props.details.user.wallet_amount > 0 ? <div className="well bg-info">
                You have some money in your wallet. If it doesn't cover the cost of this lesson, you can add the ₦{new_price} to your account or click "I will pay later" to proceed.
                </div>:null}
                {this.props.details.user.paid_before === false ? <div>
                <h4 className="font-head">Select Discount</h4>
                <p>{text_price}</p>

                <div className="toggle-btn-grp cssonly row-space-32">
                        <Selection unique_id={1} label={new_price} price={new_price} checked={true} top={""} bottom={`You get ₦${new_price*1.05}`} />
                        <Selection unique_id={2} label={price2} price={price2} checked={false} top={"-- Most Popular --"} bottom={`You get ₦${price2*1.1}`} />
                        <Selection unique_id={4} label={price3} price={price3} checked={false}  top={""} bottom={`You get ₦${price3*1.15}`} />
                </div>
                <hr className="row hr-styled"/>
                </div>:null}
                    <PaymentView {...this.props}/>
                    <CSSTransitionGroup transitionName="slide" transitionAppear={true}>
                    {child}
                    </CSSTransitionGroup>
                </div>
            </div>
        )
    }
});
