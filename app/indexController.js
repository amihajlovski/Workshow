/**
 * Created by Mihajlovski on 19.05.2015.
 */

var app = angular.module('graduateApp');

app.controller('IndexController',
    function ($scope, $http, dialog, facebookService, config, localStorageService, GooglePlus, $location, $mdToast) {

        $http.defaults.headers.common['authtoken'] = localStorageService.get("loginInfo") ? localStorageService.get("loginInfo").Token : "";

        $scope.loggedUser = null;
        $scope.showDropdownMenu = false;
        $scope.avatar = "";
        $scope.dialog = dialog;
        $scope.loginDialogSettings = {
            "template": "loginTemplate",
            "showClose": false,
            "controller": "IndexController",
            "data": {"userType": 'artist'}
        };

        $scope.$watch(function () {
            var loginInfo = localStorageService.get('loginInfo');
            return (loginInfo);
        }, function (newValue, oldValue) {
            var loginInfo = localStorageService.get('loginInfo');
            if (loginInfo != null) {
                $scope.loggedUser = loginInfo;
                $scope.avatar = config.avatarURL.replace("$id", $scope.loggedUser.User_id);
                $scope.userInfo = $scope.loggedUser.hasOwnProperty("Name") && $scope.loggedUser.hasOwnProperty("Surname") ?
                $scope.loggedUser.Name + ' ' + $scope.loggedUser.Surname : $scope.loggedUser.Email;
                getUserInfo();
            } else {
                $scope.loggedUser = null;
            }
        }, true);

        $scope.loginWithFacebook = function (userType) {
            facebookService.login()
                .then(function (token) {
                    var req = {"Fb_token": token};
                    processLogin(req, userType);
                },
                function (error) {
                    $scope.dialog.close()
                });
        };

        $scope.loginWithGoogle = function (userType) {
            GooglePlus.login().then(function (authResult) {
                var req = {"G_token": authResult.access_token};
                processLogin(req, userType);
            }, function (err) {
                $scope.dialog.close()
            });
        };

        function processLogin(req, userType) {
            var url = userType == 'artist' ? config.login : config.managerlogin;
            $http.post(url, req).success(function (response) {
                if (response.Status.Is_valid == "true") {
                    $http.defaults.headers.common['authtoken'] = response.Data.Info;
                    getUserInfo();
                    $location.path('/');
                } else {
                    $scope.dialog.close();
                }
            });
        }

        function getUserInfo() {
            $http.get(config.profile).success(function (user) {
                var userInfo = user.Data;
                var loginInfo = {
                    "Manager": userInfo.Manager,
                    "Artist": userInfo.Artist,
                    "User_id": userInfo._id,
                    "Email": userInfo.Email,
                    "Name": userInfo.Name,
                    "Surname": userInfo.Surname,
                    "Token": userInfo.Token,
                    "Logged": true
                };
                localStorageService.set("loginInfo", loginInfo);
                $scope.dialog.close();
            });
        }

        $scope.toggleDropDownMenu = function(){
            $scope.showDropdownMenu = !$scope.showDropdownMenu;
            //if($scope.showLogoutMenu)
            //    document.addEventListener('click', hideDrowDownMenu);
            //else
            //    document.click = null;
        };

        function hideDrowDownMenu(){
            $scope.showLogoutMenu = false;
            if(!$scope.$$phase)
                $scope.$apply();
        }

        $scope.logout = function(){
            $scope.showDropdownMenu = false;
            localStorageService.clearAll();
            $location.path('/');
        };

        $scope.redirectTo = function(route){
            $location.path(route);
        };

        //function showToast(){
        //    console.log('show toast')
        //    $mdToast.show({
        //        controller: 'IndexController',
        //        templateUrl: 'ngCommon/templates/ngToastTemplate.html',
        //        hideDelay: 6000,
        //        position: 'top right'
        //    });
        //}
        //showToast();


    });