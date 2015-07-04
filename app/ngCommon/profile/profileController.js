/**
 * Created by Mihajlovski on 29.06.2015.
 */

var app = angular.module('graduateApp');

app.controller('ProfileController', function ($scope, $http, $routeParams, config) {

    $scope.user = {
        ID: $routeParams.id,
        avatar: config.avatarURL.replace("$id", $routeParams.id),
        info: null,
        loaded: false,
        events: {
            loaded: false,
            data: [],
            total: 0,
            getData: function(){
                var requrl = config.events + "?filter=1&userid=" + this.ID;
                $http.get(requrl).success(function(response){
                    if(response.Status.Is_valid == 'true'){
                        $scope.user.events.data = response.Data.Events;
                        $scope.user.events.total = response.Data.Total;
                        $scope.user.events.loaded = true;
                    }
                });
            },
            formatEventImageURL: function(userID, eventID, imageName){
                return config.eventImageURL.replace("$uid", userID).replace("$eid", eventID) + imageName;
            },
            formatDateFormat: function(date){
                return moment(date).format("DD MMMM YYYY - HH:mm");
            }
        },
        getUserInfo: function(){
            $http.get(config.userByID.replace(":id", this.ID)).success(function(response){
                if(response.Status.Is_valid == 'true'){
                    $scope.user.info = response.Data[0];
                    $scope.user.loaded = true;
                    $scope.user.events.getData();
                } else
                    $location.path('/');
            });
        }
    };
    $scope.user.getUserInfo();

});