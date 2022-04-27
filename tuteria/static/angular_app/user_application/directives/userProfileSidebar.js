export default (ngModule) =>{
	ngModule.directive('userProfileSidebar',['$rootScope','UserService',($rootScope,UserService)=>{
			require('./kcd-hello.scss');
			return {
				restrict: 'E',
				scopt: {},
				controllerAs: 'vm',
				template: require('./userProfileSidebar.html'),
				bindToController: true,
				controller:function(){
					const vm = this;
					vm.user_links = [{name:'Edit Profile',url:"/edit"},{name:'Photo and Video',url:"/edit-media"},
						{name:'Trust and Verification',url:"/edit-verification"},{name:"Edit Tutor Profile",url:"/edit-tutor-profile"},]
					vm.user = {}
					vm.isCurrentLink = (link) =>{
						if(link === UserService.getCurrentSidebarUrl()){
							return "true"
						}
						return "false";
					} 
				}
			}
		}])	
}