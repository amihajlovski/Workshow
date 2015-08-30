/**
 * Created by aleks_000 on 30.07.2015.
 */

var app = angular.module('graduateApp');

app.controller('MessagesController', function ($scope, $http, $routeParams, $location, config, localStorageService, toaster) {

    $scope.messageView = $routeParams.id ? true : false;

    $scope.messages = {
        data: [],
        count: 5,
        total: 0,
        offset: 0,
        rating: 1,
        specificByID: null,
        formatDate : function(date){
            return moment(date).format("DD MMM, YYYY");
        },
        setRating: function(value){
            if(this.specificByID.Rated)
                return;
            this.rating = value;
        },
        rateArtist: function(){
            var request = new Object();
            request.url = config.rateArtist.replace(":id", this.specificByID.Artist_id);
            request.body = {Message_id: this.specificByID._id, Rating: this.rating};
            $http.post(request.url, request.body).success(function(response){
                if(response.Status.Is_valid==='true')
                    toaster.pop("success", "Artist rated!");
                $location.path('/messages');
            });
        },
        changeMessageStatus: function(msgID, status){
            var request = new Object();
            request.url = config.markMessageStatus.replace(":id", msgID);
            request.body = {Read: status};
            $http.post(request.url, request.body).success(function(response){
                console.log(response);
            });
        },
        openSpecificMessage: function(){
            if($routeParams.id){
                $http.get(config.messageByID.replace(":id", $routeParams.id)).success(function(response){
                    if(response.Status.Is_valid === "true") {
                        $scope.messages.specificByID = response.Data;
                        $scope.messages.rating = response.Data.Rating ? response.Data.Rating : 1;
                        $scope.messages.changeMessageStatus(response.Data._id, true);
                    }
                    else
                        $location.path('/messages');
                });
            }
        },
        getData: function(){
            var request = config.messages + "?count=" + this.count + "&offset=" + this.offset;
            $http.get(request).success(function(response){
                if(response.Status.Is_valid === 'true'){
                    $scope.messages.data = response.Data.Messages;
                    $scope.messages.total = response.Data.Total;
                }
            })
        }
    };

    $scope.openMethodByView = function() {
        if ($routeParams.id)
            $scope.messages.openSpecificMessage();
        else
            $scope.messages.getData();
    };
    $scope.openMethodByView();

    $scope.redirect = function(url){
        $location.path(url);
    }

});