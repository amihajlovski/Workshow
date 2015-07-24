/**
 * Created by Mihajlovski on 29.06.2015.
 */

var app = angular.module('graduateApp');

app.controller('ProfileController', function ($scope, $http, $routeParams, $location, config, fileUpload, localStorageService, toaster) {

    $scope.loggedUser = localStorageService.get('loginInfo');

    $scope.user = {
        newAvatar: null,
        missingInfo: [],
        ID: $routeParams.id,
        avatar: config.avatarURL.replace("$id", $routeParams.id) + "?n=" + Math.random(),
        info: null,
        loaded: false,
        skills: [],
        events: {
            filter: 1,
            loaded: false,
            data: [],
            total: 0,
            offset: 0,
            limit: 6,
            getData: function(){
                var requrl = config.events + "?filter=" + this.filter + "&count=" + this.limit + "&offset=" + this.offset +
                    "&userid=" + $scope.user.ID;
                $http.get(requrl).success(function(response){
                    if(response.Status.Is_valid == 'true'){
                        $scope.user.events.processData(response.Data.Events);
                        $scope.user.events.total = response.Data.Total;
                        $scope.user.events.loaded = true;
                    } else
                        $scope.user.events.loaded = false;
                });
            },
            processData: function(events){
                for(var i = 0, event; event = events[i]; i++){
                    $scope.user.events.data.push(event);
                }
            },
            formatEventImageURL: function(userID, eventID, imageName){
                return config.eventImageURL.replace("$uid", userID).replace("$eid", eventID) + imageName;
            },
            formatDateFormat: function(date){
                return moment(date).format("DD MMMM YYYY - HH:mm");
            }
        },
        generateSkills: function(){
            for (var i = 0, item; item = this.info.Skills[i]; i++) {
                this.skills.push(item.text)
            }
        },
        getInfo: function(){
            $http.get(config.userByID.replace(":id", this.ID)).success(function(response){
                if(response.Status.Is_valid == 'true'){
                    $scope.user.info = response.Data[0];
                    $scope.user.loaded = true;
                    if($scope.user.info!=null && $scope.user.info.hasOwnProperty('Skills'))
                        $scope.user.generateSkills();
                    $scope.user.events.getData();
                } else
                    $location.path('/');
            });
        },
        updateInfo: function(){
            if(!this.validateInputs()){
                toaster.pop("error", "Please provide important information about yourself.");
                return;
            }
            if(this.newAvatar !== null)
                moveUpload({'Name': this.newAvatar.name, 'type': 'avatar'});
            this.info._id = this.ID.toString();
            $http.post(config.updateUser, this.info).success(function(response){
                if(response.Status.Is_valid === 'true'){
                    toaster.pop("success", "Your info is updated.");
                    $location.path('/user/' + $scope.user.ID);
                } else
                    toaster.pop("error", "Something is wrong...");
            });
        },
        validateInputs: function(){
            if(this.info.Name == "")
                this.missingInfo.push('Name');
            if(this.info.Surname == "")
                this.missingInfo.push('Surname');
            if(this.info.Email == "")
                this.missingInfo.push('Email');
            return this.missingInfo.length == 0;
        }
    };
    $scope.user.getInfo();

    $scope.redirectTo = function(url){
        $location.path(url);
    };

    $scope.loadTags = function(query) {
        return $http.get('./content/files/skills.json?query=' + query);
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
        if(response.Status == "Done") {
            if($scope.user.newAvatar == null)
                $scope.user.newAvatar = {};
            $scope.user.newAvatar.source = config.apiBaseURL + response.Image.substring(1, response.Image.length);
            $scope.user.newAvatar.name = response.Name;
            if(!$scope.$$phase)
                $scope.$apply();
        } else {
            toaster.pop("error", "Error loading image. Please try again.");
        }
    }

    function fileUploadProgress (data, fileboxID){
    }

    function moveUpload(data){
        var input = document.createElement('input');
        input.type = "file";
        var tempPostBack = function(response){};
        var tempProgress = function(response){};
        fileUpload.initialize(config.apiBaseURL, localStorageService.get('loginInfo').Token, input, tempPostBack, tempProgress, true);
        fileUpload.moveUpload(input.id, data);
    };

});