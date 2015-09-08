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
        aplicants: [],
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
        rating: 0,
        formatUserAvatar: function(id){
            return config.avatarURL.replace("$id", id);
        },
        chooseArtist: function(artistID, artistName){
            var request = {
                url: config.chooseArtist,
                body: {Artist_id: artistID, Event_id: $routeParams.id}
            };
            $http.post(request.url, request.body).success(function(response){
                if(response.Status.Is_valid == 'true'){
                    $scope.event.getDetails($routeParams.id);
                    $scope.event.sendNotificationForArtist(artistID, $scope.event.data.Title);
                    $scope.event.sendRatingMessageForManager(artistID, artistName)
                }
            })
        },
        sendNotificationForArtist: function(artistID, eventName){
            var request = new Object();
            request.url = config.newMessage;
            request.body = {
                Receiver_id: artistID,
                Type: "notification",
                Subject: "You are chosen for the event '" + eventName + "'",
                Text: "Thanks for applying for the event '" +  eventName + "'. " + "You are chosen as artist. Good luck!",
                Event_name: eventName,
                Event_id: $routeParams.id
            };
            $http.post(request.url, request.body).success(function(response){
            });
        },
        sendRatingMessageForManager: function(artistID, artistName){
            var eventName = this.data.Title;
            var request = new Object();
            request.url = config.newMessage;
            request.body = {
                Artist_id: artistID,
                Artist_name: artistName,
                Receiver_id: this.data.Manager,
                Type: "rating",
                Subject: "Rate artist for the event '" + eventName + "'",
                Text: "Please rate the artist you have chosen to perform for the show '" +  eventName + "'. ",
                Event_name: eventName,
                Event_id: $routeParams.id
            };
            $http.post(request.url, request.body).success(function(response){
            });
        },
        applyForEvent: function(){
            if(!$scope.user.Artist){
                toaster.pop('error', 'This feature is allowed only for artists.');
                return;
            }
            var eventID = this.data._id;
            var artistID = $scope.user.User_id;
            var request = config.applyAsArtist.replace(':artistID', artistID).replace(':eventID', eventID);
            $http.get(request).success(function(response){
                if(response.Status.Is_valid==='false'){
                    toaster.pop('error', 'You have already aplied for this event.');
                } else {
                    toaster.pop('success', 'You have aplied for performing on this event. Wait for response.');
                    $scope.event.getDetails($routeParams.id);
                }
            });
        },
        generateArtistsTypes: function(){
            return this.typesOfArtists.sort();
        },
        formatDate: function(){
            if(this.data != null)
                return moment(this.data.Date).format("DD MMM, YYYY @ HH:mm");
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
                    $scope.event.getAplicantsInfo(event);
                } else {
                    $scope.event.loaded = false;
                    $scope.redirect('/');
                }
            })
        },
        generateRatingStars: function(artist){
            if(!artist.hasOwnProperty('Ratings'))
                 return 0;
            var sum = 0;
            for(var i = 0, rating; rating = artist.Ratings[i]; i++)
                sum += rating.Rating;
            var result = Math.round(sum / artist.Ratings.length);
            return result;
        },
        getAplicantsInfo: function(event){
            var request = "";
            if(event.hasOwnProperty('Artist')){
                request = config.userByID.replace(':id', event.Artist.ArtistID);
            } else
            if(event.hasOwnProperty('Aplicants') && event.Aplicants.length > 0){
                var aplicants = [];
                for(var i = 0, item; item = event.Aplicants[i]; i++){
                    aplicants.push(item.ArtistID);
                }
                request = config.userByID.replace(':id', aplicants.join(','));
            }
            $http.get(request).success(function(response){
                if(response.Status.Is_valid === 'true'){
                    $scope.event.aplicants = response.Data;
                }
            });
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
                Location: this.location.name,
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
        getData: function(filterChanged){
            this.data = filterChanged==true ? [] : this.data;
            this.offset = filterChanged==true ? 0 : this.offset;
            var query = "?count=" + this.count + "&offset=" + this.offset + "&filter=" + this.filter + "&keyword=" + this.keyword;
            $http.get(config.events + query).success(function(response){
                if(response.Status.Is_valid === "true"){
                    $scope.events.total = response.Data.Total;
                    $scope.events.processData(response.Data.Events);
                    $scope.events.offset += $scope.events.count;
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