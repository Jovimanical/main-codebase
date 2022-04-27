
const HTTP = new WeakMap();
class UserService{
	constructor($rootScope){
		// HTTP.set(this,$rootScope)
		this.current_url = '/edit';
	}
	setSidebarUrl(link){
		this.current_url = link;
		// HTTP.get(this).$broadcast('LinkChanged');
	}
	getCurrentSidebarUrl(){
		return this.current_url;
	}
	static initiate($rootScope){
		return new UserService($rootScope)
	}
}
class NigerianState{
	getStates(){
		var states = ["Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bayelsa", "Bauchi", "Benue",
          "Borno", "Cross River", "Delta", "Edo", "Ebonyi", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
          "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nassawara", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
          "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"]
         return states.map((x)=>{
         	return {name:x, value:x}
         });
	}
}
UserService.initiate.$inject = ['$rootScope']
export default (ngModule) =>{	
	ngModule.factory('UserService',UserService.initiate)
	.factory('NigerianStates',NigerianState)
	// require('./userNavigation')(ngModule);
	// require('./userProfileSidebar')(ngModule);
}