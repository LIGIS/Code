function unlockEditing(ele) {
    //if the toggler is unchecked editing is enabled
    if (ele.checked) {
        var uCount = 0;
        var layers = ["StreetSigns", "Drainage"];
        for (i = 0; i < layers.length; i++) {
            var layer = map.getLayer(layers[i]);
            var updateArray = [];
            for (g = 0; g < layer.graphics.length; g++) {
                if (layer.graphics[g].attributes["mapStatus"] != "existing") {
                    uCount++;
                    break;
                }
            }
        }
        if (uCount != 0) {
            var con = confirm("You have not saved all your edits.\n\rAre you sure you want to stop editing?\n\r\n\rYour edits will be maintained until you close your browser.");
            if (con) {
                dijit.byId('editToggler').set('label', "<img alt='' src='styles/Images/lock-icon.png' height='16' width='16'/>");
                document.getElementById('editorPanel').style.display = "none";

                destroyEditor();
                dijit.byId('identify').set('disabled', false);
            } else {
                dijit.byId('editToggler').set('checked', false);
            }
        } else {
            dijit.byId('editToggler').set('label', "<img alt='' src='Styles/Images/lock-icon.png' height='16' width='16' />");
            document.getElementById('editorPanel').style.display = "none";
            destroyEditor();
            dijit.byId('identify').set('disabled', false);
        }
        dijit.popup.close();
    } else {
        showCredentialDialog("edit");
    }
}
function startEditing() {
    //turn off the streetview and identify on map click 
    dojo.disconnect(clickHandler);
    dijit.byId("identify").set("checked", false);
    dijit.byId("doSV").set("checked", false);
    //Make sure the editing checkboxes are unchecked
    dijit.byId('streetSigns').set('checked', false);
    dijit.byId('drainage').set('checked', false);

    //set the editor button image to the unlock button
    dijit.byId('editToggler').set('label', "<img alt='' src='styles/images/unlock-icon.png' height='16' width='16' />");
    editToolbar = new esri.toolbars.Draw(map);
    document.getElementById('editorPanel').style.display = "block";   
    dojo.connect(editToolbar, "onDrawEnd", function (geom) {
        editToolbar.deactivate();
        addGraphic(geom);
    });

    dijit.popup.close();
    dijit.byId('streetSigns').set('disabled', false);
    dijit.byId('drainage').set('disabled', false);
    dojo.disconnect(clickHandler);
}
function addGraphic(geometry) {
    var point = new esri.geometry.xyToLngLat(geometry.x, geometry.y);
    var graphicLayer, symbol, attr, title;

    var date = new Date();

    //check for which layer is edited and set symbol, title, attributes based on checked layer
    if (dijit.byId('streetSigns').checked) {
        title = "Streets Sign";
        graphicLayer = map.getLayer("StreetSigns");
        symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 20,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([0, 0, 0]), 1),
                new dojo.Color([0, 255, 0, 0.25]));
        //these attributes follow what is in the database except for the map status
        //mapStatus = "new" because it was just added to the map using the draw tools
        attr = { OBJECTID: "", SignType: "", Message: "", Condition: "", Notes: "", entryDate: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(), Surveyor: document.getElementById('currentUser').value, LAT: geometry.y, LON: geometry.x, mapStatus: "new" };
        dijit.byId('streetSigns').set("checked", false);
    } else if (dijit.byId('drainage').checked) {
        title = "drainage";
        graphicLayer = map.getLayer("Drainage");
        
        symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([0, 0, 0]), 1),
                new dojo.Color([255, 0, 197, 0.75]));
        //these attributes follow what is in the database except for the map status
        //mapStatus = "new" because it was just added to the map using the draw tools
        attr = { OBJECTID: "", TYPE: "", Surveyor: document.getElementById('currentUser').value, entryDate: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(), Notes: "", LAT: geometry.y, LON: geometry.x, mapStatus: "new" };
        dijit.byId('drainage').set('checked', false);
    }
    var pt = new esri.geometry.Point(geometry.x, geometry.y, map.spatialReference);

    var graphic = new esri.Graphic(pt, symbol, attr, null);
    graphicLayer.add(graphic);
    showEditorPopup(graphic, graphicLayer);

    dijit.byId('saveChanges').set('disabled', false);
}
//this is the popup that is shown when the user is in edit mode
//this class expects evt to be in 1 of 2 formats.
function showEditorPopup(evt, layer) {
    var t = "";
   
    //get the attributes from 1 of the 2 formats
    var attr = (evt.graphic ? evt.graphic.attributes : evt.attributes);

    //get the left pane so that the offset distance can be found
    var leftPane = dijit.byId('leftPane');

    //convert the map points to screen points. get the point from 1 of 2 formats
    var pointX = (evt.pageX ? evt.pageX : esri.geometry.toScreenPoint(map.extent, map.width, map.height, evt.geometry).x + leftPane.domNode.clientWidth);
    var pointY = (evt.pageY ? evt.pageY : esri.geometry.toScreenPoint(map.extent, map.width, map.height, evt.geometry).y);

    //in this we are using a table for the structure of the infowindow.  field heading on the left, and value on the right
    var table = document.createElement('table');
    table.style = 'width:85%;';
    //iterate over the attributes and depending on their attribute type add a control to the table
    for (var k in attr) {
        if (k != "mapStatus" && k != "entryDate" && k != "material" && k != "Color") {
            var rowCount = table.rows.length;
            var row = table.insertRow(rowCount);

            var cell1 = row.insertCell(0);
            cell1.innerHTML = k;
            var cell2 = row.insertCell(1);
            var element;

            var value = attr[k];
            var inputType;
            if (k == "Condition") {
                var select = document.createElement('select');
                select.setAttribute('style', 'width:150px;');
                select.onchange = function (e) {
                    if (attr['mapStatus'] != "new") {
                        attr['mapStatus'] = "changed";
                    }
                    attr[e.srcElement.parentNode.parentNode.childNodes[0].innerHTML] = this.value;
                    dijit.byId('saveChanges').set('disabled', false);
                }
                var optionList = ["", "Good", "Bad"];

                for (o = 0; o < optionList.length; o++) {
                    var option = document.createElement("option");
                    option.value = option.text = optionList[o];
                    if (optionList[o] == attr['Condition']) {
                        option.selected = true;
                    }
                    select.add(option);
                }
                cell2.appendChild(select);
            } else if (layer.fieldInfo[k] == "System.String") {
                inputType = new dijit.form.TextBox({
                    value: value,
                    style: 'width:125px;'
                }).placeAt(cell2);
            } else if (layer.fieldInfo[k] == "System.Int32"  || layer.fieldInfo[k] == "System.Int16") {
                inputType = new dijit.form.NumberTextBox({
                    value: value,
                    style: 'width:125px;',
                        constraints: { pattern: "#" }
                }).placeAt(cell2);
                } else if (layer.fieldInfo[k] == "System.Double") {
                    inputType = new dijit.form.NumberTextBox({
                        value: value,
                        style: 'width:125px;'
                    }).placeAt(cell2);
                } else if (layer.fieldInfo[k] == "System.Single") {
                inputType = new dijit.form.NumberTextBox({
                    value: value,
                    style: 'width:125px;',
                    constraints: { pattern: "00.########" }
                }).placeAt(cell2);
            } 
            else if (layer.fieldInfo[k] == "System.DateTime") {
                var date;
                if (attr[k] != "null" && attr[k] != null && attr[k] != "") {
                    date = new Date(attr[k]);
                } else {
                    date = null;
                }
                inputType = new dijit.form.DateTextBox({
                    value: date,
                    style: 'width:125px;',
                    constraints: { pattern: "mm/dd/yyyy" }
                }).placeAt(cell2);
            }
            dojo.connect(inputType, "onChange", function (e) {
                attr[this.domNode.parentNode.parentNode.childNodes[0].innerHTML] = this.value;
                if (attr['mapStatus'] != "new") {
                    attr['mapStatus'] = "changed";
                }
                dijit.byId('saveChanges').set('disabled', false);
            });
            if (k == "OBJECTID" || k == "LAT" || k == "LON" || k == "Surveyor") {
                inputType.set('disabled', true);
            }
        } 
    }

    var mainDiv = document.createElement('div');
    mainDiv.setAttribute('style', 'width:250px;');

    mainDiv.innerHTML = layer.id + "<hr>";

    var closeButton = document.createElement('div');
    closeButton.className = 'closePanelButton';
    closeButton.setAttribute('style', 'float:right; cursor:pointer;');
    closeButton.onclick = function (e) { dijit.popup.close(); };
    closeButton.innerHTML = "X";

    var tableContainer = document.createElement('div');
    tableContainer.setAttribute('style', 'height:150px; overflow-y:scroll;');
    tableContainer.appendChild(table);

    mainDiv.appendChild(closeButton);
    mainDiv.appendChild(tableContainer);

    dijit.byId('deleteChanges').set('disabled', false);

    //append the above to the dialog
    dialog.setContent(mainDiv);
    dojo.style(dialog.domNode, "opacity", 1);
    dijit.popup.open({ popup: dialog, x: pointX, y: pointY });
    dialog.focus();

    dojo.connect(dialog, "onHide", function () {
        dijit.byId('deleteChanges').set('disabled', true);
    });
}
//called when the save button is clicked
function saveChanges() {
    var layers = ["StreetSigns", "Drainage"];
    //iterate over each of the layers to check if there are any unsaved values.
    for (i = 0; i < layers.length; i++) {
        var layer = map.getLayer(layers[i]);
        var updateArray = [];
        var uCount = 0;
        //check for edits and put them into an array
        for (g = 0; g < layer.graphics.length; g++) {
            if (layer.graphics[g].attributes["mapStatus"] != "existing") {
                updateArray[uCount] = dojo.toJson(layer.graphics[g].attributes);
                uCount++;
            } 
        }
        //if there are any edits send them to the database remove and then re-add the layer
        if (uCount != 0) {
            var updateString = "[" + updateArray.join(',') + "]";
            var updatedLayer = eval('(' + callASHX("getData.ashx?type=update&layer=" + layers[i] + "&vals=" + updateString) + ')');
            alert("Your Edits to: " + layers[i] + " Are Successful");
            map.removeLayer(layer);
            addPointLayer(updatedLayer, layers[i]);
        }

    }
    dijit.popup.close();
    dijit.byId('saveChanges').set('disabled', true);
}
function deleteChanges() {
    //called when the delete button is clicked.   
    //this permanently removes the points from the database
    var con = confirm("Are you sure you want to remove this point?");
    if (con) {
        dijit.popup.close();
        var layer = selectedGraphic.getLayer();
        if (layer == "null") {
            alert('please try again');
        } else {
            if (selectedGraphic.attributes["mapStatus"] != "new") {
                var oid = selectedGraphic.attributes["OBJECTID"];
                var updatedLayer = eval('(' + callASHX("getData.ashx?type=delete&layer=" + layer.id + "&vals=" + oid) + ')');
                if (updatedLayer.val == true) {
                    layer.remove(selectedGraphic);
                }
            } else if (selectedGraphic.attributes["mapStatus"] == "new") {
                layer.remove(selectedGraphic);
            }
            
        }
    } else {
        //dijit.byId('deleteChanges').set('disabled', true);
    }
}
function destroyEditor() {
    if (editToolbar) {
        editToolbar.deactivate();
    }
}
