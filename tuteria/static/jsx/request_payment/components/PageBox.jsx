var React = require('react');
var $ = require('jquery');
import PriceSelect from "./PriceSelect.jsx"
import PriceDisplay from "./PriceDisplay.jsx"
import Reflux from "reflux";
import actions from "./../actions.jsx";
import {newStore} from "./../stores.jsx"
//var CommentForm = require('./CommentForm.jsx');
//var helpers = require('./../helpers/csrf.js');

module.exports = React.createClass({
    mixins: [Reflux.connect(newStore)],
    func(){
        actions.updateAge(this.props)
    },
    render: function () {
        return (
            <div id="base" className="container">
                <div className="row">
                    <div className="col-md-10 col-xs-12 col-md-offset-1 col-xs-offset-0 col-sm-12 col-sm-offset-0">
                        <div className="row padding-top-50">
                            <div className="select-page-css ">
                                <PriceSelect script={true} {...this.props}/>
                            </div>
                            <PriceDisplay {...this.props}/>

                        </div>

                    </div>

                </div>

            </div>
        );
    }
});