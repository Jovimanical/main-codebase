
const SERVICE = new WeakMap();
class UserEditController{
	constructor(UserService){
		this.user = {};
		this.userFormFields = [
			{
				className:"row-space-4 row",
		        key: 'first_name',
		        type: 'horizontalInput',
		        templateOptions: {
		          label: 'First name',
		          type: 'input',
		          placeholder: 'Enter your first name e.g John',
		          required: true,
		          description: 'Please write only one name'
		        }
		      },
		      {
		      	className:"row-space-4 row",
		      	key: 'last_name',
		        type: 'horizontalInput',
		        templateOptions: {
		          label: 'Last name',
		          type: 'input',
		          placeholder: 'Enter your last name e.g Smith',
		          required: true,
		          description: 'This is only shared when you have a confirmed lesson with another Tuteria user. Please double-check to ensure it is correct.'
		        }
		      },
		      {
		      	className:"row-space-4 row",
		      	key: 'gender',
		        type: 'horizontalSelect',
		        templateOptions: {
		          label: 'I am',
		          type: 'select',
		          required: true,
		          description: 'This is never shared, only used for analysis',
		          options: [{"name": "Gender", "value": ""}, {"name": "Male", "value": "M"}, {name:"Female", value:"F"} ]
		        }
		      }	,
		      {
		      	className:"row-space-4 row",
		      	fieldGroups:[
		      		{
		      			key:'dob',
		      			type: 'select'
		      		}
		      	]
		      	
		      }	     
		];
		console.log(this.name);
		SERVICE.set(this,UserService);
	}
}
export default (ngModule) =>{	
	ngModule.controller('UserEditController',UserEditController);
}

export  var EditCtrlDetail = {
	url:'/edit',
	controller:'UserEditController',
	template: require('./user_edit.html'),
	controllerAs:"ec",
	data:{
		pageTitle:'Edit Profile'
	}
}