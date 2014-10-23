function identify(map) {
    //simple identify task
    identifyTask = new esri.tasks.IdentifyTask("url to the service");
    identifyParams = new esri.tasks.IdentifyParameters();
    identifyParams.tolerance = 5;
    identifyParams.returnGeometry = true;
    identifyParams.layerIds = [1];
    identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
    identifyParams.width = map.width;
    identifyParams.height = map.height;
}
function executeIdentifyTask(evt) {
    identify(map);
    identifyParams.geometry = evt.mapPoint;
    identifyParams.mapExtent = map.extent;
    var deferred = identifyTask.execute(identifyParams);

    //fired when the identify task is finished
    deferred.addCallback(function (response) {
        var browser = navigator.appName;
        return dojo.map(response, function (result) {
            var template = new esri.InfoTemplate("Tax Parcels", result.feature.attributes.ADDRESS + ", " + result.feature.attributes.HAMLET);
            result.feature.setInfoTemplate(template);
            return result.feature;
        });
    });
    map.infoWindow.setFeatures([deferred]);
    map.infoWindow.show(evt.mapPoint);
}