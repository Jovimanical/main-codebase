
const angular = require('angular');
const ngModule = angular.module('userApp',[require('ui-router'),require('angular-formly'),require('angular-formly-templates-bootstrap')])
.controller('MainController',['$state',($state)=>{
	$state.transitionTo('home.edit');
}])
// .run(['formlyConfig',(formlyConfig)=>{
// 	formlyConfig.setType({
// 		name:'input',
// 		template:`<div class="row row-space-4">
// 		  <label for="{{id}}" class="control-label col-md-3 col-sm-3 text-right {{to.labelSrOnly ? 'sr-only' : ''}}" ng-if="to.label">
// 		    {{to.label}}
// 		    {{to.required ? '*' : ''}}
// 		  </label>
// 		  <div class="col-md-9 col-sm-9">
// 		  	<input class="form-control" ng-model="model[options.key]">
// 		  </div>		  
// 		</div>`
// 	})
// }]);
	

require('./directives')(ngModule);
require('./config')(ngModule);
require('./services')(ngModule);
var x = require('./controllers')
require('./controllers').default(ngModule);