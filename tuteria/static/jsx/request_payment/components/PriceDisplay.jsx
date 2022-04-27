import React from "react"
import actions from './../actions.jsx';
import {PriceUpdateMixin} from './../mixins.jsx';
import {ViewStore} from './../stores.jsx';
import Reflux from "reflux";

var MobilePriceDisplay = React.createClass({
    render(){
        var new_price = `${this.props.new_price}`;
        return (
            <div id="mobile_navigation"
                 className="price-display navbar navbar-subnav-1 visible-xs navbar-fixed-top"
                 style={{top:"0",height:"54px"}}>
                <div className="container-fluid">
                    <div className="navbar-header">

                        <button type="button" className="hidden search toggle-right navbar-toggle"
                                data-toggle="sidebar" data-target=".sidebar">
                            <span className="glyphicon glyphicon-search"></span>
                        </button>

                        <div className="col-xs-7" style={{fontSize: "14px", paddingTop: "10px"}}>
                            <div className="font-head">Discount Purchase</div>
                            <div>Pay less, Learn More</div>
                        </div>
                        <div className="col-xs-5">
                            <span className="brightblue font-head pull-right" style={{fontSize:"30px"}}>&#x20A6;{new_price}</span>
                        </div>


                    </div>

                </div>
            </div>
        )
    }
});
var RegularPriceDisplay = React.createClass({
    render(){
        var new_price = `${this.props.new_price}`;
        var available_days = `${this.props.available_days} time${this.props.available_days > 1 ?"s":""} a week `
        return (
            <div className="panel-body no-padding-total img-resize">
                <div className="">
                    <div className="bb322 margin-top-15 font-head margin-bottom-5">
                                    <span className="fa-stack">
                                      <i className="glyphicon glyphicon-bookmark lightblue"></i>
                                    </span>
                        Discount Purchase
                    </div>
                    <div className="bb322 margin-bottom-5">
                                    <span className="fa-stack">
                                      <i className="glyphicon glyphicon-time lightblue"></i>
                                    </span>
                        Pay less, Learn more
                    </div>
                </div>
                <hr className="row hr-styled"/>
                <div className="row font-head">
                    <div className="col-xs-3"><h4 className="font-head">TOTAL</h4></div>
                    <div className="col-xs-6 col-xs-offset-3 brightblue"><h3 className="margin-top-0 font-head">&#x20A6;{new_price}</h3></div>
                </div>
            </div>
        )
    }
});
module.exports = React.createClass({
    mixins: [Reflux.connect(ViewStore),PriceUpdateMixin],
    render(){
        var {hours_per_day,is_parent_request,no_of_students,is_parent,no_of_subjects,days_per_week,subject_name,available_days} = this.props.details.user;
        var price_display = `${hours_per_day} hour${hours_per_day > 1?'s':''} for ${days_per_week}`;
        var students = `${no_of_students} student${no_of_students > 1?'s':''}`;
        var default_text = is_parent_request ? `${no_of_subjects} subject${no_of_subjects > 1?'s':''}` : subject_name;

        return (
            <div>
                <div className="col-sm-4 col-xs-12 hidden-xs">
                    <div className="panel">
                        <RegularPriceDisplay {...this.state} duration={price_display}
                          students={students} subject_display={default_text} available_days={available_days}/>
                    </div>

                    <div id="help" className="panel">
                        <div className="panel-body no-padding-total">
                            <div className="media">
                              <div className="media-left">
                                <div>
                                  <img className="media-object img-circle" src="/static/img/gallery/godwin.jpg" width="45"/>
                                </div>
                              </div>
                              <div className="media-body">
                                <h4 className="media-heading">Have Questions?</h4>
                                <small>I am Godwin, Tuition Manager</small>
                                </div>
                                <hr className="hr-styled row margin-top-0"/>
                                    <small>If you need any help to purchase a discount or require further clarification, 
                                    please call me on 07083266188 or 01-2930329</small>                                        
                            </div>
                        </div>
                    </div>
                </div>



                <div id="help" className="panel visible-xs">
                        <div className="panel-body no-padding-total">
                            <div className="media">
                              <div className="media-left">
                                <div>
                                  <img className="media-object img-circle" src="/static/img/gallery/godwin.jpg" width="45"/>
                                </div>
                              </div>
                              <div className="media-body">
                                <h4 className="media-heading">Have Questions?</h4>
                                <small>I am Godwin, Tuition Manager</small>
                                </div>
                                <hr className="hr-styled row margin-top-0"/>
                                    <small>If you need any help to purchase a discount or require further clarification, 
                                    please call me on 07083266188 or 01-2930329</small>                                        
                            </div>
                        </div>
                    </div>
                <MobilePriceDisplay {...this.state} duration={price_display}
                  students={students} subject_display={default_text}/>
            </div>
        )
    }
});
