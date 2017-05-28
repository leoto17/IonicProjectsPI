/*
*  Marco UdeApps
*  Authors
*  Daniel Correa Arango
*  Santiago Gómez Giraldo
*  León David Osorio Tobón
*  Copyright University of Antioquia 2017- All Rights Reserved
*/

var udeapp = angular.module("udeapps",["ionic","ngCordova"]);

udeapp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

	FCMPlugin.getToken(
		function (token) {
			console.log('Token: ' + token);
		},
		function (err) {
			console.log('error retrieving token: ' + err);
		}
	);
  });
});

/*Route views section*/
udeapp.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        /*Login Route*/
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
        })
        /*Main Route*/
        .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'MainCtrl'
        })
        /*Notifications Route*/
        .state('notifications', {
            url: '/notifications',
            templateUrl: 'templates/notifications.html',
            controller: 'NotificationsCtrl'
        })
        /*About Route*/
        .state('about', {
            url: '/about',
            templateUrl: 'templates/about.html',
            controller: 'AboutCtrl'
        })
        /*Starter Route*/
        .state('starter', {
            url: '/starter',
            templateUrl: 'templates/starter.html',
            controller: 'StarterCtrl'
        });
    /*Default Route*/
    $urlRouterProvider.otherwise('/starter');
});


/*Controller views section*/

/*Login Controller*/
udeapp.controller("LoginCtrl", function($scope, $ionicHistory, $location, $ionicPopup) {
    if(localStorage.getItem('logued')!=null && localStorage.getItem('logued')=='true'){
        $location.url("/main");
    }else{
        $location.url("/login");
    }
    $('.pane').css('background-color','white');
    $('#bar-title').slideDown(700);
    $ionicHistory.clearHistory();
    
	$scope.login=function(params){
        if(params.username=='root' && params.password=='root'){
            localStorage.setItem('logued','true');
            $("input#user-field-pi").val("");
            $("input#pass-field-pi").val("");
            $location.url("/main");
        }
        else{
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Los datos ingresados son incorrectos'
            });
        }
	};
});

/*Main Controller*/
udeapp.controller("MainCtrl", function($scope, $ionicHistory, $location, $timeout, $ionicPopup) {
    if(localStorage.getItem('logued')==null || localStorage.getItem('logued')!='true'){
        $location.url("/login");
    }
    if(localStorage.getItem('counter')==null){
        localStorage.setItem('counter','0');
        localStorage.setItem('notViewNotificationsAmount','0');
    }
     FCMPlugin.onNotification(
		function(data){
			var title = "title"+String(localStorage.getItem('counter'));
            var body = "body"+String(localStorage.getItem('counter'));
            localStorage.setItem(title,String(data.title));
            localStorage.setItem(body,String(data.body));
            localStorage.setItem('counter',String(Number(localStorage.getItem('counter'))+1));
            localStorage.setItem('view','false');
            localStorage.setItem('notViewNotificationsAmount',String(Number(localStorage.getItem('notViewNotificationsAmount'))+1));
            $('div#notification-alert').html(localStorage.getItem('notViewNotificationsAmount'));
            $('div#notification-alert').fadeIn();
		},
		function(msg){
			console.log('onNotification callback successfully registered: ' + msg);
		},
		function(err){
			console.log('No es posible registrar nof' + err);
		}
	);
    $('div#notification-alert').html(localStorage.getItem('notViewNotificationsAmount'));
    $('.pane').css('background-color','white');
    $('font').css('color','white');
    $('#bar-title').slideDown(700);
    if(localStorage.getItem('view')=='false'){
        $('div#notification-alert').fadeIn();
    }else{
        $('div#notification-alert').fadeOut();
    }
    $ionicHistory.clearHistory();
    
    $scope.seeNotifications = function(){
        $('div#notification-alert').fadeOut();
        localStorage.setItem('notViewNotificationsAmount','0');
        localStorage.setItem('view','true');
        $location.url("/notifications");  
    };
    
     $scope.seeAbout = function(){
        $location.url("/about");  
    };
    
    $scope.logout = function(){
        if (true) {
          $ionicPopup.confirm({
            title: 'Cerrar Sesión',
            template: 'Está seguro que desea cerrar sesión y cerrar la aplicación?'
          }).then(function(res) {
            if (res) {
                $ionicHistory.clearHistory();
                localStorage.setItem('logued','false');
                ionic.Platform.exitApp();
            }
          })
        } 
    }
});

/*Starter Controller*/
udeapp.controller("StarterCtrl", function($scope, $location, $timeout) {
    $('.intro-pi').center(25,0);
    $('span#powered-by-pi').centerHorizontally(0);
    $(window).bind( "resize", function(){
        $('.intro-pi').center(25,0);
        $('span#powered-by-pi').centerHorizontally(0);
    });
    $timeout(function(){
        $('.intro-pi').fadeIn(600);
         $timeout(function(){
            $('span#powered-by-pi').slideDown(600);
        },800);
    },100);
    $timeout(function(){
        if(localStorage.getItem('logued')!=null && localStorage.getItem('logued')=='true'){
            $location.url("/main");
        }else{
            $location.url("/login");
        }
    },3000);
});

/*Notifications Controller*/
udeapp.controller("NotificationsCtrl", function($scope, $location, $ionicHistory, $ionicPopup) {
    if(localStorage.getItem('logued')==null || localStorage.getItem('logued')!='true'){
        $location.url("/login");
    }
    $scope.notNotificationsMessage = "";
    $('button#remove-notifications').fadeIn();
    $('.pane').css('background-color','white');
    $('font').css('color','white');
    $('#bar-title').slideDown(700);
    $scope.notifications=[];
    if(Number(localStorage.getItem('counter'))>0){
        $scope.notNotificationsMessage = "";
        $('button#remove-notifications').fadeIn();
        var i=Number(localStorage.getItem('counter'));
        while(i>=0){
            var title = "title"+String(i);
            var body = "body"+String(i);
            var message = {'title':localStorage.getItem(title),'body':localStorage.getItem(body)};
            $scope.notifications.push(message);
            i--;
        }
    }else{
        $scope.notNotificationsMessage = "No hay notificaciones";
        $('button#remove-notifications').hide();
    }
        
    $scope.clearNotifications = function(){
        $scope.notifications = [];
        $scope.notNotificationsMessage = "No hay notificaciones";
        $('button#remove-notifications').hide();
        localStorage.clear();
        localStorage.clear();
        localStorage.setItem('counter','0');
		localStorage.setItem('logued','true');
    }
    
    $scope.back = function(){
        $location.url("/main");
    }
    
    $scope.logout = function(){
        if (true) {
          $ionicPopup.confirm({
            title: 'Cerrar Sesión',
            template: 'Está seguro que desea cerrar sesión?'
          }).then(function(res) {
            if (res) {
                $ionicHistory.clearHistory();
                localStorage.setItem('logued','false');
                ionic.Platform.exitApp();
            }
          })
        } 
    }
});

/*About Controller*/
udeapp.controller("AboutCtrl", function($scope, $location, $ionicHistory, $ionicPopup) {
    if(localStorage.getItem('logued')==null || localStorage.getItem('logued')!='true'){
        $location.url("/login");
    }
    $scope.notNotificationsMessage = "";
    $('button#remove-notifications').fadeIn();
    $('.pane').css('background-color','white');
    $('font').css('color','white');
    $('#bar-title').slideDown(700);
    
    $scope.back = function(){
        $location.url("/main");
    }
    
    $scope.logout = function(){
        if (true) {
          $ionicPopup.confirm({
            title: 'Cerrar Sesión',
            template: 'Está seguro que desea cerrar sesión?'
          }).then(function(res) {
            if (res) {
                $ionicHistory.clearHistory();
                localStorage.setItem('logued','false');
                ionic.Platform.exitApp();
            }
          })
        } 
    }
});
