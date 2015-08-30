/**
 * Created by Mihajlovski on 16.05.2015.
 */

var app = angular.module('graduateApp');

app.controller('HomeController', function($scope, $http, $location, config, localStorageService) {

    $scope.user = localStorageService.get('loginInfo');

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

    $scope.events = {
        data: [],
        filter: 2,
        keyword: "",
        count: 6,
        offset: 0,
        total: 0,
        getData: function(filterChanged){
            this.data = filterChanged==true ? [] : this.data;
            this.offset = filterChanged==true ? 0 : this.offset;
            var query = "?count=" + this.count + "&offset=" + this.offset + "&filter=" + this.filter + "&keyword=" + this.keyword;
            $http.get(config.events + query).success(function(response){
                if(response.Status.Is_valid === "true"){
                    $scope.events.total = response.Data.Total;
                    $scope.events.processData(response.Data.Events);
                    $scope.events.offset += $scope.events.count;
                } else {
                    $scope.events.data = [];
                    $scope.events.total = 0;
                }
            });
        },
        processData: function(events){
            for(var i = 0, event; event = events[i]; i++){
                $scope.events.data.push(event);
            }
        },
        markAsFavorite: function(event){
            $http.get(config.eventsFavorite.replace("$eid", event._id)).success(function(response){
                event.Favorited = !event.Favorited;
            });
        },
        formatEventImageURL: function(userID, eventID, imageName){
            return config.eventImageURL.replace("$uid", userID).replace("$eid", eventID) + imageName;
        },
        formatDateFormat: function(date){
            return moment(date).format("DD MMMM YYYY - HH:mm");
        }
    };
    $scope.events.getData();

    $scope.redirect = function(url){
        $location.path(url);
    };
});
