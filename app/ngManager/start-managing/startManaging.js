/**
 * Created by Mihajlovski on 04.06.2015.
 */

var app = angular.module('graduateApp');

app.controller('ManagingController', ['$scope', 'dialog', 'toaster', function($scope, dialog, toaster) {
    $scope.becomeManager = function(){
        dialog.open({
            "template": "loginTemplate",
            "showClose": false,
            "controller": "IndexController",
            "userType": 'manager'
        });
    }

}]);