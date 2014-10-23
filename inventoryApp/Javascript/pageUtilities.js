function clickConnect(connect, taskId, ele) {
    if (connect) {
        dojo.disconnect(clickHandler);
        clickHandler = null;
        if (ele.checked) {
            switch (taskId) {
                case 5:
                    dijit.byId("doSV").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", executeIdentifyTask);
                    break;
                case 10:
                    dijit.byId("identify").set("checked", false);
                    clickHandler = dojo.connect(map, "onClick", StreetView);
                    break;
            }
        } else {
            dijit.byId("identify").set("checked", false);
            dijit.byId("doSV").set("checked", false);
        }
    }
}
function doIdentify(sender) {
    clickConnect(true, 5, sender);
}
function doStreetView(sender) {
    clickConnect(true, 10, sender);
}