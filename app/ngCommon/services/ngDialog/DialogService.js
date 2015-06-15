/**
 * Created by Mihajlovski on 19.05.2015.
 */

var app = angular.module("graduateApp");

app.factory('dialog', function (ngDialog) {

    function _open(settings) {
        var obj = {};
        if(settings && settings.hasOwnProperty("template"))
            obj.template = settings.template;
        if(settings && settings.hasOwnProperty("showClose"))
            obj.showClose = settings.showClose;
        if(settings && settings.hasOwnProperty("controller"))
            obj.controller = settings.controller;
        if(settings && settings.hasOwnProperty("data"))
            obj.data = settings.data;
        ngDialog.open(obj);
    }

    function _close(){
        ngDialog.closeAll();
    }

    return {
        open: _open,
        close: _close
    }
});