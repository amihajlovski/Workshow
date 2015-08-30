'use strict';

var app = angular.module('graduateApp', [
    'ngRoute',
    'ngMaterial',
    'oc.lazyLoad',
    'ngDialog',
    'configuration',
    'LocalStorageModule',
    'googleplus',
    'toaster',
    'ngAnimate',
    'FileUpload',
    'ui.bootstrap',
    'ngTagsInput',
    'google.places'
]);

app.config(['$routeProvider', '$httpProvider', 'GooglePlusProvider', 'config',
    function ($routeProvider, $httpProvider, GooglePlusProvider, config) {

    $httpProvider.interceptors.push('httpInterceptor');

    FB.init(config.facebookInitSettings);
    GooglePlusProvider.init(config.googleInitSettings);

    $routeProvider.
        when('/', {
            templateUrl: 'ngCommon/home/home.html',
            controller: 'HomeController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngCommon/home/homeController.js');
                }]
            },
            access: {loginNeeded: false, allowedUserRoles: 'all'}
        }).
        when('/start-managing', {
            templateUrl: 'ngManager/start-managing/startManaging.html',
            controller: 'ManagingController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngManager/start-managing/startManaging.js');
                }]
            },
            access: {loginNeeded: false, allowedUserRoles: 'all'}
        }).
        when('/events', {
            templateUrl: 'ngManager/events/allevents.html',
            controller: 'EventsController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngManager/events/EventsController.js');
                }]
            },
            access: {loginNeeded: true, allowedUserRoles: 'all'}
        }).
        when('/event/:id', {
            templateUrl: 'ngManager/events/event.html',
            controller: 'EventsController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngManager/events/EventsController.js');
                }]
            },
            access: {loginNeeded: true, allowedUserRoles: 'all'}
        }).
        when('/create-event/', {
            templateUrl: 'ngManager/events/createEvent.html',
            controller: 'EventsController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngManager/events/EventsController.js');
                }]
            },
            access: {loginNeeded: true, allowedUserRoles: 'manager'}
        }).
        when('/user/:id', {
            templateUrl: 'ngCommon/profile/profile.html',
            controller: 'ProfileController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngCommon/profile/profileController.js');
                }]
            },
            access: {loginNeeded: false, allowedUserRoles: 'all'}
        }).
        when('/messages/:id?', {
            templateUrl: 'ngCommon/messages/messages.html',
            controller: 'MessagesController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngCommon/messages/messagesController.js');
                }]
            },
            access: {loginNeeded: true, allowedUserRoles: 'all'}
        }).
        when('/user/:id/edit', {
            templateUrl: 'ngCommon/profile/addInfo.html',
            controller: 'ProfileController',
            resolve: {
                loadController: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load('ngCommon/profile/profileController.js');
                }]
            },
            access: {loginNeeded: true, allowedUserRoles: 'all'}
        }).
        otherwise({redirectTo: '/'});
}]);

app.factory('httpInterceptor', function($q, $rootScope, $location, localStorageService, config) {

    return {
        request: function(req) {
            if (req.url.indexOf(config.apiURL) == -1 && req.headers.authtoken)
                delete req.headers.authtoken;
            return req || $q.when(req);
        },
        response: function(response) {
            if (response.data && response.data.Status && response.data.Status.Error) {
                if (response.data.Status.Error.Code == -6) {
                    localStorageService.clearAll();
                    $location.path('/');
                    return $q.reject(response);
                }
            }
            return response || $q.when(response);
        },
        responseError: function(response) {
            return $q.reject(response);
        }
    };

});

app.run(function($rootScope, $location, localStorageService, $document, $window) {

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        $window.scrollTo(0, 0);
        showSearchInputIfNecessary(next);
    });

});


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


function showSearchInputIfNecessary(route) {
    var el = document.getElementById('headerSearch');
    el.style.visibility = route.hasOwnProperty('$$route') && route.$$route.originalPath != '/' ? 'visible' : 'hidden';
}