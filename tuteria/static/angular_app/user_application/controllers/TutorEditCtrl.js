
const SERVICE = new WeakMap();
class UserEditController{
	constructor(UserService){
		this.name = "Biola";
		console.log(this.name);
		SERVICE.set(this,UserService);
	}
}
export default (ngModule) =>{	
	ngModule.controller('UserTutorController',UserEditController);
}

export  var TutorEditDetail = {
	url:'/edit-tutor-profile',
	template: require('./tutor-profile.html'),
	controller:'UserTutorController',
	controllerAs:"tp",
	data:{
		pageTitle:'Edit Tutor Profile'
	}
	
}
