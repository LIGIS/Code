//this is pretty standard Streetview api stuff.
//streetview expects lat longs so there had to be a project method added to this.  
//could make this go faster by using a map that is in 4326
function StreetView(evt) {
    var svlayer = map.getLayer('svGraphicLayer');
    svlayer.clear();
    var sv = new google.maps.StreetViewService();

    document.getElementById("svX").value = evt.mapPoint.x;
    document.getElementById("svY").value = evt.mapPoint.y;
    var panoOptions = {
        
        addressControlOptions: {
            position: google.maps.ControlPosition.BOTTOM
        },
        clickToGo: true,
        linksControl: false,
        panControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        enableCloseButton: false
    };
    panorama = new google.maps.StreetViewPanorama(document.getElementById('streetview'), panoOptions);

    var outSR = new esri.SpatialReference({ wkid: 4326 });
    gsvc.project([evt.mapPoint], outSR, function (projectedPoints) {
        sv.getPanoramaByLocation(new google.maps.LatLng(projectedPoints[0].y, projectedPoints[0].x), 50, processSVData);
        //var heading = panorama.getPov().heading;
    }, function (e) { alert(e.message); });
}

function processSVData(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
        var svlayer = map.getLayer('svGraphicLayer');
        svlayer.clear();
        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });
        
        panorama.setVisible(true);
        //change the orientation of the arrow based on the orientation in SV
        google.maps.event.addListener(panorama, 'pov_changed', function () {
            var heading = panorama.getPov().heading + 5;
            var pitch = panorama.getPov().pitch;
            svlayer.graphics[0].symbol.setAngle(heading);
            svlayer.redraw();
        });
        //change the position of the arrow based on the position in SV
        google.maps.event.addListener(panorama, 'position_changed', function () {
            var point = new esri.geometry.Point({ "x": panorama.getPosition().lng(), "y": panorama.getPosition().lat(), " spatialReference": { " wkid": 4326} });
            svlayer.clear();
            
            gsvc.project([point], map.spatialReference, function (projectedPoints) {
                var symbol = new esri.symbol.PictureMarkerSymbol('http://static.arcgis.com/images/Symbols/Arrows/icon120.png', 25, 25);
                var heading = panorama.getPov().heading + 5;
                symbol.setAngle(heading);

                svlayer.add(new esri.Graphic(projectedPoints[0], symbol));
                map.centerAt(projectedPoints[0]);
            });
        });
        var symbol = new esri.symbol.PictureMarkerSymbol('http://static.arcgis.com/images/Symbols/Arrows/icon120.png', 25, 25);
        var heading = panorama.getPov().heading + 5 ;
        symbol.setAngle(heading);

        var point = new esri.geometry.Point(document.getElementById("svX").value, document.getElementById("svY").value, map.spatialReference);

        var graphic = new esri.Graphic(point, symbol);
        svlayer.add(graphic);
    } else {
        alert('Street View data not found for this location.');
    }
}