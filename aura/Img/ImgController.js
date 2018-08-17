({
    doInit: function(cmp, event, helper) {
        //todo cache UrlUtil component
        // if (window.urlUtil === undefined) {
        //     $A.createComponent('Framework:UrlUtil', null, function (urlUtil) {
        //         window.urlUtil = urlUtil;
        //         window.urlUtil.wrapLinks(cmp, ['v.src']);
        //     });
        // }
        // else {
        //     window.urlUtil.wrapLinks(cmp, ['v.src']);
        // }
        $A.createComponent('Framework:UrlUtil', null, function (urlUtil) {
            helper.urlUtil = urlUtil;
            urlUtil.getTimedDirectLink(cmp.get('v.src'), $A.getCallback(function(url) {
                cmp.set('v.modifiedSrc', url);
            }));
        });


        //v.extra is key=value pairs, separated by commas. For some reason, lightning won't let you
        //build attributes with \{ or \}, so this isn't JSON.
        //Any values that contain arbitrary data need to be set in code.
        var attrs = cmp.get('v.extra').split(',');
        attrs.forEach($A.getCallback(function(keyvalue) {
            if (keyvalue.length > 0) {
                var split = keyvalue.split('=');
                var element = cmp.find("imgTag").getElement(); //not sure why this is returning null sometimes
                if (element) {
                    element.setAttribute(split[0], split[1]);
                }
            }
        }));
    },
    srcChange: function (cmp, event, helper) {
        if (helper.urlUtil) { //avoid race condition with `createComponent` callback
            helper.urlUtil.getTimedDirectLink(cmp.get('v.src'), $A.getCallback(function (url) {
                cmp.set('v.modifiedSrc', url);
            }));
        }
    }
})