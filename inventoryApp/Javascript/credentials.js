function showCredentialDialog(sender) {
    //create a dialog for the user to enter username and password
    document.getElementById('currentUser').value = "";
    var dlg = new dijit.Dialog({
        content: "<div>Please Enter A Username And Password</div><div id='authMessage'></div><br/>Username:&nbsp;<input id='username' type='text' style='margin: 0px 0px 1px 2px;border: 1px solid #7EABCD;' /><br />Password:&nbsp;<input id='password' type='password' style='margin: 1px 0px 0px 5px;border: 1px solid #7EABCD;' />",
        "title": "",
        "style": "width: 300px;"
    }).placeAt(dojo.body());

    var message = dojo.create("div", {
        innerHTML: "",
        "class": "authMessage"
    }, dlg.containerNode);

    var actionBar = dojo.create("div", {
        "class": "dijitDialogPaneActionBar"
    }, dlg.containerNode);

    //when clicked to validate the credentials
    var okBtn = new dijit.form.Button({
        "label": "Ok",
        onClick: function (e) {
            document.getElementById('currentUser').value = document.getElementById('username').value;
            //the credentials are stored in the ashx in this case.  
            var store = new dojox.data.QueryReadStore({ url: 'credentials.ashx' });
            store.fetch({ serverQuery: { user: document.getElementById('username').value, pass: document.getElementById('password').value, sender: sender },
                onError: function (e) {
                    alert(e);
                    document.getElementById('currentUser').value = "";
                },
                onComplete: function (items, request) {
                    var val = "";
                    if (items[0].i == "t") {
                        dlg.hide();
                        dojo.destroy(dlg.id);
                        
                        if (sender == "edit") {
                            startEditing();
                        }
                    } else {
                        document.getElementById('currentUser').value = "";
                        message.innerHTML = "You have entered an incorrect username or password";
                    }
                }
            });
        }
    }).placeAt(actionBar);
    //cancel the edit try
    new dijit.form.Button({
        "label": "Cancel",
        onClick: function (e) {
            if (sender == "edit") {
                dlg.destroy(); 
                dijit.byId('editToggler').set('checked', true);
            } else {
                window.close();
            }
        }
    }).placeAt(actionBar);

    dlg.startup();
    dlg.show();
}