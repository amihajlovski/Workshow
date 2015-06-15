/**
 * Created by Mihajlovski on 19.05.2015.
 */

var app = angular.module("graduateApp");

app.factory('facebookService', function ($q) {

    function _login() {
        var deferred = $q.defer();
        FB.login(function (response) {
            if (response.authResponse) {
                var access_token = FB.getAuthResponse()['accessToken'];
                deferred.resolve(access_token);
            } else {
                deferred.reject('Error occurred');
            }
        }, {scope: 'email'});
        return deferred.promise;
    }

    return {
        login: _login
    }
});
