import {EditCtrlDetail,MediaCtrlDetail,VerificationCtrlDetail,TutorEditDetail} from './controllers';
export default (ngModule) =>{
	ngModule.config(($stateProvider,$urlRouterProvider,formlyConfigProvider) => {
		$urlRouterProvider.otherwise('/edit');
		$stateProvider
			.state('home',{
				url:'',
				controller:'MainController',
				template: require('./views/user_edit.html'),
				resolve:{
					'setLink':['UserService',(UserService)=>{UserService.setSidebarUrl(EditCtrlDetail.url) }]
				}}
			)
			.state('home.edit',Object.assign(EditCtrlDetail,{
				resolve:{
					'setLink':['UserService',(UserService)=>{UserService.setSidebarUrl(EditCtrlDetail.url) }]
				}})
			)
			.state('home.media',Object.assign(MediaCtrlDetail,{
				resolve:{
					'setLink':['UserService',(UserService)=>{UserService.setSidebarUrl(MediaCtrlDetail.url) }]
				}})
			)
			.state('home.verification',Object.assign(VerificationCtrlDetail,{
				resolve:{
					'setLink':['UserService',(UserService)=>{UserService.setSidebarUrl(VerificationCtrlDetail.url) }]
				}})
			)
			.state('home.tutor_profile',Object.assign(TutorEditDetail,{
				resolve:{
					'setLink':['UserService',(UserService)=>{UserService.setSidebarUrl(TutorEditDetail.url) }]
				}})	
			)
		 formlyConfigProvider.setWrapper({
		      name: 'horizontalBootstrapLabel',
		      template: [
		        '<label for="{{::id}}" class="col-sm-3 control-label text-right">',
		          '{{to.label}} {{to.required ? "*" : ""}}',
		        '</label>',
		        '<div class="col-sm-9">',
		          '<formly-transclude></formly-transclude>',
		        '</div>'
		      ].join(' ')
		    });

		 formlyConfigProvider.setWrapper({
		      name: 'horizontalBootstrapSelectLabel',
		      template: [
		        '<label for="{{::id}}" class="col-sm-3 control-label text-right">',
		          '{{to.label}} {{to.required ? "*" : ""}}',
		        '</label>',
		        '<div class="col-sm-4">',
		          '<formly-transclude></formly-transclude>',
		        '</div>'
		      ].join(' ')
		    });

	    formlyConfigProvider.setType({
	      name: 'horizontalInput',
	      extends: 'input',
	      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
	    });
	    
	    formlyConfigProvider.setType({
	    	name:'horizontalSelect',
	    	extends: 'select',
	      	wrapper: ['horizontalBootstrapSelectLabel', 'bootstrapHasError']
	    })
	});
}