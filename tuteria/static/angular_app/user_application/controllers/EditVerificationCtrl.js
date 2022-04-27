
const SERVICE = new WeakMap();
class UserEditController{
	constructor(UserService){
		this.name = "Biola";
		console.log(this.name);
		SERVICE.set(this,UserService);
	}
}
export default (ngModule) =>{	
	ngModule.controller('UserVerificationController',UserEditController);
}

export  var VerificationCtrlDetail = {
	url:'/edit-verification',
	controller:'UserVerificationController',
	template: require('./user_verification.html'),
	controllerAs:"uv",
	data:{
		pageTitle:'Edit Verification'
	}
}