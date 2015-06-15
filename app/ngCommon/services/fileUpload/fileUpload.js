/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function(window, angular, undefined) {
    'use strict';
    var chunkSize = 65536;//524288;
    var SelectedFile=[];
    var socket=[];
    var fileReader=[];
    var progressStatus;


    angular.module('FileUpload', ['ng']).
            factory('fileUpload', function() {

                var _initialize = function(hostUrl, authtokencode, fileBox, postback, progressPostback, keepInTemp) {
                    if(!fileBox.isInitialized){
                        fileBox.keepInTemp = keepInTemp;
                        fileBox.addEventListener('change', fileChosen);
                        socket[fileBox.id] = io.connect(hostUrl, {query: {'authtoken': authtokencode},'force new connection': true});
                        armSocketEvents(socket[fileBox.id], progressPostback, postback, fileBox, keepInTemp);
                    }
                };

                var _startUpload = function(data, postback, fileBox, keepInTemp) {
                    if (!data.fileName)
                        postback({Status: 'Fail', Message: 'Property fileName is missing', ID:fileBox.id});
                    if (!data.type)
                        postback({Status: 'Fail', Message: 'Property type is missing', ID:fileBox.id});
                    if(!SelectedFile[fileBox.id]) {
                        postback({Status: 'Fail', Message: 'Please select a file for upload', ID: fileBox.id});
                    }
                    fileReader[fileBox.id] = new FileReader();
                    fileReader[fileBox.id].onload = (function(f) {
                        return function(event) {
                            var file = {
                                'Name': SelectedFile[fileBox.id].name,
                                'Data': event.target.result,
                                'Size': SelectedFile[fileBox.id].size,
                                'type':data['type'],
                                'keepInTemp':keepInTemp
                            };
                            socket[fileBox.id].emit('UploadTemp', file);
                        };
                    })(SelectedFile[fileBox.id]);
                    fileReader[fileBox.id].readAsBinaryString(SelectedFile[fileBox.id]);
                };

                var _getProgressStatus = function(data) {
                    data = progressStatus;
                };
                var _moveUpload= function(fileboxID,data){
                    if(data.performanceID){
                        socket[fileboxID].emit('MoveTemp', {'Name': data.Name, 'type':data['type'], 'performanceID':data.performanceID});
                    }else{
                        socket[fileboxID].emit('MoveTemp', {'Name': data.Name, 'type':data['type']});
                    }
                };
                
                var _deleteTempUpload = function(fileboxID, data){
                  if(data.performanceID){
                      socket[fileboxID].emit('DeleteTemp', {'Name': data.Name, 'type':data['type'], 'performanceID':data.performanceID});
                  }else{
                      socket[fileboxID].emit('DeleteTemp', {'Name': data.Name, 'type':data['type']});
                  }
                };
                
                return {
                    initialize: _initialize,
                    startUpload : _startUpload,
                    getProgressStatus : _getProgressStatus,
                    moveUpload : _moveUpload,
                    deleteTempUpload : _deleteTempUpload
                };
            });

    function armSocketEvents(socket, updateProgress, postback, fileBox, keepInTemp) {
        socket.on('MoreData', function(data) {
            updateProgress(data['Percent'],fileBox.id);
            progressStatus = data['Percent'];
            var Place = data['Place'];
            var NewFile; //The Variable that will hold the new Block of Data
            if (SelectedFile[fileBox.id].webkitSlice){
                NewFile = SelectedFile[fileBox.id].webkitSlice(Place, Place + Math.min(chunkSize, (SelectedFile[fileBox.id].size - Place)));
            } else if(SelectedFile[fileBox.id].mozSlice){
                NewFile = SelectedFile[fileBox.id].mozSlice(Place, Place + Math.min(chunkSize, (SelectedFile[fileBox.id].size - Place)));
            } else{
                NewFile = SelectedFile[fileBox.id].slice(Place, Place + Math.min(chunkSize, (SelectedFile[fileBox.id].size - Place)));
            }
            fileReader[fileBox.id].readAsBinaryString(NewFile);
        });
        socket.on('Error', function(data) {
            var res = {Status: 'Fail', Message: data.Message, ID:fileBox.id};
            if(data.errorType)
                res.errorType=data.errorType;
            postback(res);
        });
        socket.on('Done', function (data){
            data.ID=fileBox.id;
            data.Status='Done';
            postback(data);
        });
    }

    function fileChosen(event) {
        SelectedFile[event.target.id] = event.target.files[0];
    }

})(window, window.angular);