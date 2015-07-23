/**
 * Created by Mihajlovski on 27.05.2015.
 */

var app = angular.module('graduateApp');

app.controller('EventsController',
    function ($scope, $http, dialog, config, localStorageService, fileUpload, toaster, $location, $routeParams) {

    $scope.user = localStorageService.get('loginInfo');

    //EVENT
    /////////////////////////////////////
    /////////////////////////////////////

    $scope.datepicker = {
        date: "",
        opened: false,
        minDate: moment().valueOf(),
        format: "dd MMMM yyyy",
        options: {
            formatYear: 'yy',
            startingDay: 1
        },
        open: function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datepicker.opened = true;
        }
    };

    $scope.event = {
        typesOfArtists: ["Photographer", "Graffiti artist", "Dancer", "Dj", "Comedian", "Singer", "Magician", "Circus performer", "Tattoo artist"],
        loaded: false,
        data: null,
        image: null,
        artistType: "",
        title: "",
        date: "",
        time: "",
        image: null,
        description: "",
        location: "",
        keywords: [],
        salary: null,
        invalidProperties: [],
        generateArtistsTypes: function(){
            return this.typesOfArtists.sort();
        },
        formatDate: function(){
            if(this.data != null)
                return moment(this.data.Date).format("DD MMM YYYY");
        },
        getDetails: function(id){
            var request = config.eventByID.replace(':id', id);
            //$http.get(request).then.call(this, this.processResponse.bind(this));
            $http.get(request).success(function(response){
                if(response.Status.Is_valid === 'true'){
                    var event = response.Data;
                    $scope.event.image = config.eventImageURL.replace('$uid', event.Manager).replace('$eid', event._id) + event.Image;
                    $scope.event.data = event;
                    $scope.event.loaded = true;
                    $scope.event.increaseViewCount(event._id);
                } else {
                    $scope.event.loaded = false;
                    $scope.redirect('/');
                }
            })
        },
        increaseViewCount: function(id){
            var request = config.increaseViewCount.replace(':id', id);
            $http.get(request).success(function(response){
            });
        },
        markAsFavorite: function(event){
            $http.get(config.eventsFavorite.replace("$eid", event._id)).success(function(response){
                event.Favorited = !event.Favorited;
            });
        },
        generateTimings: function(){
            var timings = [];
            for(var i = 0; i < 24; i++){
                if(i < 10)
                    timings.push("0" + i + ":00");
                else
                    timings.push(i + ":00");
            }
            return timings;
        },
        validate: function(){
            this.invalidProperties = [];
            var properties = ['title', 'date', 'time', 'image', 'description', 'location', 'keywords', 'salary', 'artistType'];
            for(var i= 0,prop;prop=properties[i];i++){
                if($scope.event[prop]=='' || $scope.event[prop]==null || $scope.event[prop] == [])
                    this.invalidProperties.push(prop);
            }
            return this.invalidProperties.length == 0;
        },
        splitKeywordTags: function(){
            var arr = [];
            for(var i = 0,tag;tag = this.keywords[i]; i++){
                arr.push(tag['text']);
            }
            return arr;
        },
        generateRequestDocument: function(){
            return {
                Title: this.title,
                Date: moment(moment(this.date).add(parseInt(this.time.split(':')[0]), 'hours')).valueOf(),
                Image: this.image.name,
                Description: this.description,
                Location: this.location,
                Keywords: this.splitKeywordTags(),
                Salary: this.salary,
                Artist_type: this.artistType
            }
        },
        save: function(){
            var valid = this.validate();
            if(!valid){
                toaster.pop("error", "You must fill this event settings: " + this.invalidProperties.join(', ') + "!");
                return;
            } else {
                $http.post(config.event, this.generateRequestDocument()).success(function(response){
                    moveUpload({'Name': $scope.event.image.name, 'type': 'eventCover', 'eventID': response.Data.eventID});
                    toaster.pop("success", "You've just created your event.");
                    $scope.redirect('/event/' + response.Data.eventID);
                });
            }
        }
    };

    //ALL EVENTS
    /////////////////////////////////////
    /////////////////////////////////////

    $scope.events = {
        data: [],
        filter: 0,
        keyword: "",
        count: 6,
        offset: 0,
        total: 0,
        getData: function(){
            var query = "?count=" + this.count + "&offset=" + this.offset + "&filter=" + this.filter;
            if(this.filter==3)
                query += "&keyword=" + this.keyword;
            else
                this.keyword = "";
            $http.get(config.events + query).success(function(response){
                if(response.Status.Is_valid === "true"){
                    $scope.events.total = response.Data.Total;
                    if($scope.events.offset==0)
                        $scope.events.data = response.Data.Events;
                    else
                        $scope.events.processData(response.Data.Events);
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
        formatEventImageURL: function(userID, eventID, imageName){
            return config.eventImageURL.replace("$uid", userID).replace("$eid", eventID) + imageName;
        },
        formatDateFormat: function(date){
            return moment(date).format("DD MMMM YYYY - HH:mm");
        }
    };

    function makeRequestByView(){
        switch ($location.url().split('/')[1]){
            case 'events':
                return $scope.events.getData();
            case 'event':
                return $scope.event.getDetails($routeParams.id)
        }
    }
    makeRequestByView();

    $scope.redirect = function(url){
        $location.path(url);
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
            if($scope.event.image == null)
                $scope.event.image = {};
            $scope.event.image.source = config.apiBaseURL + response.Image.substring(1, response.Image.length);
            $scope.event.image.name = response.Name;
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