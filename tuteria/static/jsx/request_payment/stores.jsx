import Reflux from "reflux";
import axios from "axios";
import actions from "./actions.jsx";
import {PriceUpdateStoreMixin} from "./mixins.jsx";
export var store = Reflux.createStore({
    data: {
        message: "Hello world"
    },
    //init(){
    //    this.listenTo(actions.updateAge, this.onUpdateAge);
    //},
    listenables: [actions],
    onUpdateAge(props){
        this.data.message = "Biola was here";
        console.log(this.data);
        console.log(props);
        this.trigger(this.data);
    },
    getInitialState(){
        return this.data;
    }
});


export var newStore = Reflux.createStore({
    getInitialState(){
        return {}
    },
    init(){
        this.listenTo(store, this.onStoreChange)
    },
    onStoreChange(data){
        console.log(data);
    }
});
export var ViewStore = Reflux.createStore({
    mixins: [PriceUpdateStoreMixin],
    listenables: [actions],
    onUpdatePrice(price,option = 1,new_price=0){
        var result = price * option;
        console.log(result);
        if(new_price > 0){
          this.data.new_price = new_price;
        }else{
          this.data.new_price = price;
        }
        this.trigger(this.data);
    },
    onSetPaymentOption(details){
      if(details.value){
        console.log(details.value);
        axios({
          url:details.url,
          data:{
            selection:details.value
          },
          method:'post',
          headers: {'X-CSRFToken': details.csrftoken},}
        ).then(function(data){
          console.log(data);
          window.location.href = details.redirect_url;
        })
      }
    }
});

export var PagaFormStore = Reflux.createStore({
  mixins:[PriceUpdateStoreMixin],
  init(){
      this.listenTo(ViewStore, this.onStoreChange)
  },
  onStoreChange(data){
      this.data = data;
      console.log(data);
      console.log(this.data);
      this.trigger(this.data);
  },
})

export var PriceSelectStore = Reflux.createStore({
  data:{ pay_later:false },
  getInitialState(){
    return this.data;
  },
  listenables:[actions],
  onShowPayLaterForm(){
    this.data.pay_later = !this.data.pay_later;
    this.trigger(this.data);
  }
})
