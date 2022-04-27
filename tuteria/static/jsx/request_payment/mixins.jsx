export var PriceUpdateMixin = {
  componentDidMount(){
      this.setState({new_price: parseFloat(this.props.details.user.price).toFixed(0)})
  },
}
export var PriceUpdateStoreMixin = {
  data: {new_price: 0},
  getInitialState(){
      return this.data;
  },

}
