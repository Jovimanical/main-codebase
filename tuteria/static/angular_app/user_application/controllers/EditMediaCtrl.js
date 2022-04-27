
const SERVICE = new WeakMap();
class UserEditController{
	constructor(UserService){
		this.name = "Biola";
		console.log(this.name);
		SERVICE.set(this,UserService);
	}
}
export default (ngModule) =>{	
	ngModule.controller('UserMediaController',UserEditController);
}

export  var MediaCtrlDetail = {
	url:'/edit-media',
	controller:'UserMediaController',
	template: require('./user_media.html'),
	controllerAs:"mc",
	data:{
		pageTitle:'Edit Media'
	}
}