/**
 * Created by Mihajlovski on 06.06.2015.
 */

var app = angular.module('graduateApp');

app.directive("scroll", function ($window, $location) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            element[0].style.visibility = this.pageYOffset <= 300 && $location.path() == '/' ? 'hidden' : 'visible';
            scope.$apply();
        });
    };
});