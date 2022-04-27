/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(457);


/***/ },

/***/ 2:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },

/***/ 5:
/***/ function(module, exports) {

	module.exports = Urls;

/***/ },

/***/ 129:
/***/ function(module, exports) {

	'use strict';
	
	function ToObject(val) {
		if (val == null) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	module.exports = Object.assign || function (target, source) {
		var from;
		var keys;
		var to = ToObject(target);
	
		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));
	
			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}
	
		return to;
	};


/***/ },

/***/ 457:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var assign = __webpack_require__(129);
	var Urls = __webpack_require__(5);
	var CATEGORIES = [{
		label: 'Select Category', value: ''
	}];
	// skills: [
	//   {label: 'Select Skill', value: ''},
	// ]
	
	var Answer = function Answer(option) {
		_classCallCheck(this, Answer);
	
		this.text = option.content;
		this.valid = option.correct;
	};
	
	var Question = (function () {
		function Question(question) {
			_classCallCheck(this, Question);
	
			this.id = question.id;
			this.question = question.content;
			this.answer = null;
			this.options = question.answer_set.map(function (option) {
				return new Answer(option);
			});
		}
	
		_createClass(Question, [{
			key: 'answerQuestion',
			value: function answerQuestion(ans) {
				this.answer = ans;
			}
		}]);
	
		return Question;
	})();
	
	var Quiz = (function () {
		function Quiz(questions, passmark) {
			_classCallCheck(this, Quiz);
	
			this.questions = questions.map(function (question) {
				return new Question(question);
			});
			this.passmark = parseInt(passmark);
		}
	
		_createClass(Quiz, [{
			key: 'valid',
			value: function valid() {
				return this.questions.filter(function (question) {
					if (question.answer) {
						return question.answer.valid === true;
					}
					// return question.answer !== null;
				});
			}
		}, {
			key: 'invalid',
			value: function invalid() {
				return this.questions.filter(function (question) {
					if (question.answer) {
						return question.answer.valid === false;
					}
					return question.answer === null;
				});
			}
		}, {
			key: 'percentage',
			value: function percentage() {
				return this.valid().length * 100 / this.questions.length;
			}
		}, {
			key: 'passed',
			value: function passed() {
				return this.percentage() >= this.passmark;
			}
		}]);
	
		return Quiz;
	})();
	
	var Category = (function () {
		function Category(category) {
			_classCallCheck(this, Category);
	
			assign(this, category);
			this.label = this.label || this.name;
			this.value = this.value || this.id;
			var skills = [{ label: 'Select Skill', value: '' }].map(function (x) {
				return new Skill(x);
			});
			this.fetched_skills = false;
			assign(this, { skills: skills });
		}
	
		_createClass(Category, [{
			key: 'fetchSkills',
			value: function fetchSkills() {
				var that = this;
				console.debug(that);
				var dfd = $.Deferred();
				if (this.fetched_skills === false) {
					$.get(Urls['users:api_category_skills'](this.slug), function (data) {
						console.debug(data);
						var skills = data.map(function (x) {
							return new Skill(x);
						});
						that.skills = that.skills.concat(skills);
						that.fetched_skills = true;
						dfd.resolve(that.skills);
						console.debug(that.skills);
					});
				} else {
					dfd.resolve(this.skills);
				}
				return dfd.promise();
			}
		}], [{
			key: 'getCategories',
			value: function getCategories(from_server) {
				CATEGORIES = CATEGORIES.concat(from_server);
				return CATEGORIES.map(function (x) {
					return new Category(x);
				});
			}
		}]);
	
		return Category;
	})();
	
	var Skill = (function () {
		function Skill(skill) {
			_classCallCheck(this, Skill);
	
			assign(this, skill);
			this.label = this.name || this.label;
			this.value = this.id || this.value;
			this.received_quiz = false;
			this.questions = [];
		}
	
		_createClass(Skill, [{
			key: 'getDuration',
			value: function getDuration() {
				return this.duration;
			}
		}, {
			key: 'getQuestions',
			value: function getQuestions() {
				return this.questions;
			}
		}, {
			key: 'getPassmark',
			value: function getPassmark() {
	
				return this.passmark;
			}
		}, {
			key: 'fetchQuiz',
			value: function fetchQuiz() {
				var that = this;
				var dfd = $.Deferred();
				if (this.received_quiz === false) {
					$.get(Urls['users:tutor-registration-quiz'](this.quiz_url), function (data) {
						console.debug(data);
						that.questions = data.map(function (x) {
							return new Question(x);
						});
						that.received_quiz = true;
						dfd.resolve(that.questions);
					});
				} else {
					dfd.resolve(this.questions);
				}
				return dfd.promise();
			}
		}]);
	
		return Skill;
	})();
	
	angular.module('OMSubjectSelect', []).controller('SubjectSelectCtrl', ['$scope', '$http', function ($scope, $http) {
		$scope.categories = Category.getCategories(window.categories_json);
		$scope.selectedCategory = $scope.categories[0];
		$scope.selectedSkill = $scope.selectedCategory.skills[0];
		// $http.get(Urls['']).then(function(data){
		// $scope.categories = Category.getCategories()
		// })
		$scope.getCategories = function () {
			$scope.selectedCategory.fetchSkills().then(function (data) {
				console.log(data);
				$scope.selectedSkill = $scope.selectedCategory.skills[0];
				$scope.$apply();
			});
		};
		// $scope.fetchSkills = function(){
		// $scope.$apply();
		// alert($scope.selectedSkill);
		// $scope.selectedSkill;
		// }
		$scope.Trig = function () {
			alert($scope.selectedSkill.name);
		};
		$scope.hideInfo = function () {
			if ($scope.selectedSkill.value !== "" && $scope.selectedSkill.value !== null && $scope.selectedSkill.value !== "undefined" && $scope.selectedSkill.value !== undefined) {
				return false;
			}
			return true;
		};
		$scope.nextStep = function () {
			if ($scope.selectedSkill.testable) {
				window.location.href = Urls['users:quiz_started']($scope.selectedSkill.quiz_url);
			} else {
				window.location.href = Urls['users:non_testable']($scope.selectedSkill.slug);
			}
		};
	}]);
	angular.module('TuteriaExam', []).config(['$httpProvider', function ($httpProvider) {
		$httpProvider.defaults.xsrfCookieName = 'csrftoken';
		$httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	}]).controller("QuizCtrl", ['$scope', '$http', function ($scope, $http) {
		$http.get(Urls['users:tutor-registration-quiz'](window.quiz_details.url)).then(function (data) {
			$scope.quiz = new Quiz(data.data, window.quiz_details.passmark);
			console.log($scope.quiz);
		});
	
		$scope.viewResult = function () {
			$http.post(Urls['users:quiz_completed'](window.quiz_details.url), { 'result': $scope.quiz.percentage() }).then(function (data) {
				var string;
				if ($scope.quiz.passed()) {
					string = "Congratulations! you passed. you got " + $scope.quiz.percentage().toFixed(2) + "%. You can now proceed to the next step.";
					var txt;
					var r = confirm(string);
					if (r == true) {
						window.location.href = Urls['users:describe_subject'](window.quiz_details.skill_slug);
					} else {
						window.location.href = Urls['users:describe_subject'](window.quiz_details.skill_slug);
					}
				} else {
					string = "Unfortunately you didn't pass this test. You got" + $scope.quiz.percentage().toFixed(2) + "%. You won't be able to teach this skill. Please reload ";
					var txt;
					var r = confirm(string);
					if (r == true) {
						window.location.href = Urls['users:tutor_subjects']();
					} else {
						window.location.href = Urls['users:tutor_subjects']();
					}
				}
			});
		};
	}]).directive("mathjaxBind", function () {
		return {
			restrict: "A",
			scope: {
				text: "@mathjaxBind"
			},
			controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
	
				$scope.$watch('text', function (value) {
					var $script = angular.element("<script type='math/tex'>").html(value == undefined ? "" : value);
					$element.html("");
					$element.append($script);
					MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
				});
			}]
		};
	}).directive('dynamic', ['$compile', function ($compile) {
		return {
			restrict: 'A',
			replace: true,
			link: function link(scope, ele, attrs) {
				scope.$watch(attrs.dynamic, function (html) {
					html = html.replace(/\$\$([^$]+)\$\$/g, "<span class=\"blue\" mathjax-bind=\"$1\"></span>");
					html = html.replace(/\$([^$]+)\$/g, "<span class=\"red\" mathjax-bind=\"$1\"></span>");
					ele.html(html);
					$compile(ele.contents())(scope);
				});
			}
		};
	}]);
	
	$(function () {
		if (window.CreateStep === 0) {
			angular.bootstrap(document, ['OMSubjectSelect']);
		}
		if (window.CreateStep === 1) {
			angular.bootstrap(document, ['TuteriaExam']);
		}
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }

/******/ });
//# sourceMappingURL=subject_create_mini.bundle.js.map