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
        openSpecificMessage: function(){
            if($routeParams.id){
                $http.get(config.messageByID.replace(":id", $routeParams.id)).success(function(response){

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