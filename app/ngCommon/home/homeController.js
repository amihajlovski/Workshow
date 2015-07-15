/**
 * Created by Mihajlovski on 16.05.2015.
 */

var app = angular.module('graduateApp');

app.controller('HomeController', function($scope, $http, $location, config) {

    $scope.managers = {
        data: [],
        viewProfile: function(id){
            if(id)
                $location.path('/user/' + id);
        },
        formatAvatarImage: function(id){
            return config.avatarURL.replace("$id", id);
        },
        getNewestManagers: function(){
            $http.get(config.newestManagers).success(function(response){
                if(response.Status.Is_valid == 'true'){
                    $scope.managers.data = response.Data.Users;
                }
            });
        }
    };
    $scope.managers.getNewestManagers();

});
