/**
 * Created by Mihajlovski on 27.05.2015.
 */

var app = angular.module('graduateApp');

app.controller('EventsController', function ($scope, $http, dialog, config, localStorageService, fileUpload) {

    $scope.events = {

    };


    //FILE UPLOAD
    /////////////////////////////////////
    /////////////////////////////////////

    $scope.initializeUploader = function(fileBoxID, type) {
        var fileBox = document.getElementById(fileBoxID);
        fileBox.uploadType = type;
        if (!fileBox.isInitialized) {
            var isTemp = true;
            fileUpload.initialize(config.apiBaseURL, localStorageService.get('loginInfo').Token, fileBox, fileStateHandler, fileUploadProgress, isTemp);
            var fileBoxChangeEvent = function() {
                var data = {
                    'Name': fileBox.value,
                    'fileName': fileBox.value,
                    'type': type
                };
                fileUpload.startUpload(data, fileStateHandler, fileBox, isTemp);
            };
            fileBox.addEventListener('change', fileBoxChangeEvent);
            fileBox.isInitialized = true;
        }
    };

    function fileStateHandler (response){
        console.log('filestatehandler response', response);
        //$scope.performanceCoverImageObject = response;
        //
        //if($scope.performanceCoverImageObject.Status === 'Done'){
        //    $scope.$apply(function(){
        //        $scope.imageName = response.Image;
        //        $scope.imageSource = CONSTS.apiBaseUrl + response.Image;
        //        $scope.imageLoaded = true;
        //    });
        //}
    }

    function fileUploadProgress (data, fileboxID){
    }

});