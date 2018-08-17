({
    getTimedDirectLink: function (cmp, event) {
        var params = event.getParam('arguments');

        if (params.url && params.url.match(/.*AwsProxy.key=(.*)&bucket=(.*)/)) {
            var action = cmp.get("c.getDirectLink");
            action.setParams({url: params.url});
            action.setCallback(this, function (response, status, err) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    params.callback(response.getReturnValue());
                }
                else if (state === "INCOMPLETE") {
                    // do something
                }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        title: 'Error!',
                        message: (errors[0] && errors[0].message) ? errors[0].message : 'Unknown Error',
                        type: 'error'
                    });
                    toastEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            params.callback(params.url);
        }
    },
    wrapLinks: function (cmp, event) {
        var params = event.getParam('arguments');
        var callback = params.callback;
        var otherCmp = params.cmp;
        var action = cmp.get("c.getTimedDirectLinks");
        var fieldToUrlMap = [];
        for (var i = 0; i < params.attrNames.length; i++) {
            fieldToUrlMap.push([params.attrNames[i], otherCmp.get(params.attrNames[i])]);
        }
        action.setParams({fieldToUrlMap: JSON.stringify(fieldToUrlMap)});
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = JSON.parse(response.getReturnValue());
                result.forEach(function (row) {
                    var field = row[0];
                    var url = row[1];
                    otherCmp.set(field, url);
                });
                if (callback) {
                    callback(result);
                }
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: 'Error!',
                    message: (errors[0] && errors[0].message) ? errors[0].message : 'Unknown Error',
                    type: 'error'
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }})