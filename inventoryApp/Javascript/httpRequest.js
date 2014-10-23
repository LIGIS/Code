function makeHttpObject() {
    try { return new XMLHttpRequest(); }
    catch (error) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (error) { }
    try { return new ActiveXObject("Microsoft.XMLHTTP"); }
    catch (error) { }

    throw new Error("Could not create HTTP request object.");
}
var httpReq;
function callASHX(page) {
    httpReq = makeHttpObject();
    httpReq.onreadystatechange = XMLHttpRequestCompleted;
    httpReq.open("GET", page, false);
    httpReq.send(null);
    return XMLHttpRequestCompleted();
}
function XMLHttpRequestCompleted() {
    if (httpReq.readyState == 4) {
        try {
            return (httpReq.responseText);
        }
        catch (e) {
            return e.Message;
        }
    }
}