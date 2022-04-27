export default (ngModule) =>{
	ngModule.directive('userNavigation',()=>{
		require('./kcd-hello.scss');
		return {
			restrict: 'E',
			scopt: {},
			controllerAs: 'vm',
			template: require('./navigation.html'),
			controller:function(){
				const vm = this;
				vm.url_sections = [{name:'Dashboard',url:""},{name:'My Subjects',url:""},
					{name:'My Requests',url:""},{name:"My Lessons",url:""},{name:"Profile",url:""},
					{name:'Account',url:""}]
			}

		}
	})
	.directive('title', ['$rootScope', '$timeout', ($rootScope, $timeout) =>{
	    return {
	      link: function() {
	        var listener = function(event, toState) {
	          $timeout(function() {
	            $rootScope.title = (toState.data && toState.data.pageTitle) 
	            ? toState.data.pageTitle 
	            : 'Default title';
	          });
	        };
	        $rootScope.$on('$stateChangeSuccess', listener);
	      }
	    };
	  }
	])	
}