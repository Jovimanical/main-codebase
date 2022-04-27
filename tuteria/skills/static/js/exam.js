var quizApp = angular.module( "quizApp", ['ngSanitize', 'ui.bootstrap'] );

quizApp.controller( "QuizCtrl", [ '$scope', function( $scope ){
  $scope.score = 0;
  $scope.showScore = false;
  $scope.totalQuestions = 0;
  $scope.counter = 1;
  $scope.totalQuestions = 0;
  $scope.questionsAttempted = 0;
  $scope.correctAnswers = 0;
  $scope.displayAnswers = false;
  
  
  $scope.plusScore = function(value) {
    $scope.score += value;
    $scope.correctAnswers++;
  };
  $scope.minusScore = function(value) {
    $scope.score -= value;
    $scope.correctAnswers--;
  };
  $scope.displayScore = function() {
    $scope.showScore = true;
  };
  $scope.getCounter = function() {
    return $scope.counter++;
  };  
  $scope.updateTotalQuestionsCount = function() {
    $scope.totalQuestions++;
  };
  $scope.updateQuestionsAttemptedCount = function() {
    $scope.questionsAttempted++;
  };
  $scope.updateCorrectQuestionsCount = function() {
    $scope.correctAnswers++;
  };

}]);

quizApp.directive( "iscorecard", function() {
  return {
    restrict: 'E',
    scope: {
    },
    controller: function( $scope ) {
      $scope.totalQuestions = $scope.$parent.totalQuestions;
      $scope.questionsAttempted = $scope.$parent.questionsAttempted;
      $scope.correctAnswers  = $scope.$parent.correctAnswers;
      $scope.score = $scope.$parent.score;
      $scope.showscores = "";
      
      $scope.showAnswers = function() {
        $scope.$parent.displayAnswers = true;
      }
      
      $scope.showScores = function() {
        $scope.showscores = true;
      }
    },
    link: function( scope, element, attrs ){
      scope.$parent.$watch( function(){return scope.$parent.questionsAttempted;}, function(){
         scope.questionsAttempted = scope.$parent.questionsAttempted;
      });
      scope.$parent.$watch( function(){return scope.$parent.score;}, function(){
         scope.score = scope.$parent.score;
      });
      scope.$parent.$watch( function(){return scope.$parent.score;}, function(){
         scope.correctAnswers = scope.$parent.correctAnswers;
      });
    },
    template: '<div class="panel panel-primary">'+
	'<div class="panel-heading">'+
		'<h2 class="panel-title">Score Card</h2>'+
	'</div>'+
	'<div class="panel-body">'+
 	'<h5> Total no. of questions: <b>{{totalQuestions}}</b> </h5>'+
    '<h5>No. of questions attempted: <b>{{questionsAttempted}}</b></h5>'+
    '<div style="padding-top:10px">'+
      '<input type="button" class="btn btn-sm btn-success" name="score" value="Show Score" ng-click="showScores()"/>'+
      '<input type="button" class="btn btn-sm btn-warning" name="rightanswer" value="Show Answers" ng-click="showAnswers()"/>'+
    '</div>'+
    '<div ng-show="showscores"  style="padding-top:10px">'+
      '<h5>No. of correct answers: <b>{{correctAnswers}}</b></h5>'+
    '<h5>Overall score: <b>{{score}}/{{totalQuestions}}</b></h5>'+
    '</div></div></div>'
  };
});

quizApp.directive( "iquestion", function() {
  return {
    restrict: 'E',
    scope: {
      text: '@',
    },
    controller: function( $scope ){
      // Update parent scope details
      //
      console.log($scope.$parent);
      $scope.$parent.updateTotalQuestionsCount();
      //
      //
      var text = $scope.text;
      $scope.qna = [];
      var qnaObj = new Object();
      qnaObj.id = $scope.$parent.getCounter(); 
      qnaObj.tag = "q_" +  qnaObj.id;
      qnaObj.answeredCorrectly = false;
      qnaObj.attempted = false;
      //
      // Processing the question and answer text
      //
      var qnaArr = text.split("::");
      qnaObj.question = "<b>Q: " + qnaArr[0] + "</b>";
      var ansArr=qnaArr[1].split(";");
      qnaObj.options = [];
      qnaObj.answers = [];
      for(i=0;i<ansArr.length;i++){
        var option = { "text":ansArr[i],"correct":false,"style":""};
        var optionText = option.text;
        if( optionText.indexOf( "__" ) === 0 ) {
          option.text = optionText.substring( 2, optionText.length );
          option.correct = true;
        } 
        qnaObj.options.push( option );
      }
      $scope.qna.push( qnaObj );
    },
    link: function( scope, element, attrs ){
      scope.evalScore = function(id, value) {
        var rightAnswerFound = false, foundIndex = 0, i = 0, arrIndex;
        angular.forEach( scope.qna, function(qna) {
          if( qna.id === id ) {
            arrIndex = i;
            angular.forEach( qna.options, function(option) {
              if( option.text === value && option.correct === true ) {
                rightAnswerFound = true;
              }
            });
          }
          i++;
        });
        if( rightAnswerFound === true ) {
          scope.$parent.plusScore(1);
          scope.qna[arrIndex].answeredCorrectly = true;
        } else {
          if( scope.qna[arrIndex].answeredCorrectly === true ) {
            scope.$parent.minusScore(1);  
            scope.qna[arrIndex].answeredCorrectly = false;
          }
        }
        if( scope.qna[arrIndex].attempted === false ) {
          scope.qna[arrIndex].attempted = true;
          scope.$parent.updateQuestionsAttemptedCount();
          console.log( scope.$parent.questionsAttempted );
        }
      };
      
      scope.$parent.$watch( function(){return scope.$parent.displayAnswers;}, function(){
         console.log( "answer displayed...");
         angular.forEach( scope.qna, function(qna) {
            var i = 0;
            angular.forEach( qna.options, function(option) {
              console.log( option.text );
              if( option.correct === true && scope.$parent.displayAnswers === true ) {
                qna.options[i].style="background-color:#ffff00";
              }
              i++;
            });
          });
      });
      
    },
    template: '<div style="padding:15px 0px 5px 0px" ng-bind-html="qna[0].question"></div>'+
'<div style="padding-left:10px" ng-repeat="option in qna[0].options">'+
    '<div class="radio">'+
      '<label>'+
        '<input type="radio" name="{{qna[0].tag}}" value="{{option.text}}" ng-model="qna[0].tag" ng-change="evalScore(qna[0].id, option.text)"/>'+
        '<span style="{{option.style}}">{{option.text}}</span>'+
      '</label>'+
    '</div></div>'
  };
});