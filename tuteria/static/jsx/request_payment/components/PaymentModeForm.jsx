var React = require('react');
import actions from './../actions.jsx';

export var Selection = React.createClass({
    setPrice(){
        console.log(this.props)
      actions.updatePrice(this.props.price,this.props.unique_id,this.props.label);
    },
    onComponentDidMount(){
        this.setState({initialChecked:this.props.checked})
    },
    render(){
        var id = `quote_request_frequecny_${this.props.unique_id}`;
        var currency = `₦${this.props.label}`;
        return (
            <div className="bb7">
                <p >{this.props.top}</p>
                <div className="radio-parent">
                    <input type="radio" id={id} value={this.props.unique_id} name="group4" onChange={this.setPrice}
                        defaultChecked={this.props.checked} />
                    <label onClick={this.setPrice} className="toggle-btn">{currency}</label>
                </div>
                <span>{this.props.bottom}</span>
            </div>
        )
    }
});
