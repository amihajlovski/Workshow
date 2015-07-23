/**
 * Created by Mihajlovski on 18.05.2015.
 */

var configuration = angular.module('configuration', []);
var apiBaseURL = "http://localhost:1337/";
var apiURL = "http://localhost:1337/api/";

configuration.constant('config', {

    "apiURL": apiURL,
    "apiBaseURL": apiBaseURL,
    "avatarURL": apiBaseURL + "public/data/users/$id/avatar/avatar.jpg",
    "eventImageURL": apiBaseURL + "public/data/users/$uid/events/$eid/images/",

    "facebookInitSettings" : {
        appId: '480494712119788',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.3'
    },
    "googleInitSettings": {
        clientId: '90741444387-le30kaop43o711p889in8a4vt78qfbo5.apps.googleusercontent.com',
        scopes: 'https://www.googleapis.com/auth/userinfo.email'
    },

    "login": apiURL + "artist/login",                       // [POST]
    "managerlogin": apiURL + "manager/login",               // [POST]
    "profile": apiURL + "user/info",                        // [GET]
    "event": apiURL + "manager/event",                      // [POST]
    "events": apiURL + "events",                            // [GET]
    "eventsFavorite": apiURL + "events/$eid/favorite",      // [GET]
    "managerEvents": apiURL + "manager/:id/events",         // [GET]
    "userByID": apiURL + "user/:id",                        // [GET]
    "newestManagers": apiURL + "user/newest",               // [GET]
    "updateUser": apiURL + "user/info/update",              // [POST]
    "eventByID": apiURL + "event/:id",                      // [GET]
    "increaseViewCount": apiURL + 'events/:id/viewcount'    // [GET]

});