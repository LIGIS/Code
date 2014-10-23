function addPointLayer(results, layer) {
    //the results of the XHR.  the fieldInfo defines the field Types
    var fieldInfo = dojo.fromJson("[" + results[results.length - 1].FieldInfo + "]");

    //create a graphic layer with the id defined
    var graphicLayer = new esri.layers.GraphicsLayer({ id: layer });
    graphicLayer.fieldInfo = fieldInfo[0];

    //go through each of the records returned from the request
    for (var i = 0; i < results.length - 1; i++) {
        //define the Point to add to the map
        var pt = new esri.geometry.Point(results[i].LON, results[i].LAT, map.spatialReference);
        //set mapStatus to existing.  This is important for editing purposes.  
        results[i].mapStatus = "existing";
        var symbol;
        //different symbols based on the layer id
        if (layer == "StreetSigns") {
            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 20,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([0, 0, 0]), 1),
                new dojo.Color([0, 255, 0, 0.75]));
        } else {
            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([0, 0, 0]), 1),
                new dojo.Color([255, 0, 197, 0.75]));
        }
        var graphic = new esri.Graphic(pt, symbol, results[i]);
        graphicLayer.add(graphic);
    }
    dojo.connect(graphicLayer, "onMouseOver", function (e) {
        map.setCursor("pointer");
    });
    dojo.connect(graphicLayer, "onMouseOut", function (e) {
        map.setCursor("default");
    });
    //when the user clicks on a graphic in the graphic layer
    dojo.connect(graphicLayer, "onClick", function (e) {
        //test to see if the user is in an editing session
        if (dijit.byId('editToggler').checked) {
            connectClick(e, e.graphic.getLayer());
        } else {
            //if the user is editing
            selectedGraphic = e.graphic;
            showEditorPopup(e, e.graphic.getLayer());
        }
    });
    map.addLayer(graphicLayer);
    //make sure the editing buttons have been disabled
    dijit.byId('saveChanges').set('disabled', true);
    dijit.byId('deleteChanges').set('disabled', true);
}
//when the user is not in an edit session open a pop up and show information depending on the layer clicked
function connectClick(evt, layer) {
    switch (layer.id) {
        case "StreetSigns":
            var t = "<div style='width:250px;'><b><div class='closePanelButton' style='float:right; cursor:pointer;' onclick='dijit.popup.close();'>x</div>Street Signs<hr><br/>" +
                        "Type: ${SignType} - ${Material}<br/> ${Color}<br/>" +
                        "${Message} <br/>" +
                        "Condition: ${Condition} <br/> ${Notes}</div>";

            var content = esri.substitute(evt.graphic.attributes, t);

            dialog.setContent(content);
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.popup.open({ popup: dialog, x: evt.pageX, y: evt.pageY });
            dialog.focus();
            break;
        case "Drainage":
            var t = "<div style='width:250px;'><b><div class='closePanelButton' style='float:right; cursor:pointer;' onclick='dijit.popup.close();'>x</div>Drains<hr><br/>" +
                        "Type:${Type}<br/>${Notes}</div>";

            var content = esri.substitute(evt.graphic.attributes, t); 

            dialog.setContent(content);
            dojo.style(dialog.domNode, "opacity", 0.85);
            dijit.popup.open({ popup: dialog, x: evt.pageX, y: evt.pageY });
            dialog.focus();
            break;
    }
}
