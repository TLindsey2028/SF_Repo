({
    doInit : function (component) {
        var componentObj = component.get('v.componentObj');
        if (!$A.util.isEmpty(componentObj.config.width) && componentObj.config.width !== 0) {
            component.set('v.width',componentObj.config.width);
        }
        if (!$A.util.isEmpty(componentObj.config.height) && componentObj.config.height !== 0) {
            component.set('v.height',componentObj.config.height);
        }
        if (!$A.util.isEmpty(componentObj.config.videoUrl) && componentObj.config.videoUrl.indexOf('youtube.com') > -1) {
            component.set('v.showIframe',true);
        }
        $A.createComponent('Framework:UrlUtil', null, function (urlUtil) {
            urlUtil.getTimedDirectLink(component.get('v.componentObj.config.videoUrl'), $A.getCallback(function (url) {
                component.set('v.directUrl', url);
            }));
        });

        component.set('v.renderVideo',true);
        setTimeout($A.getCallback(function(){
            if (!component.get('v.showIframe')) {
                component.find('videoTag').getElement().setAttribute('width',component.get('v.width'));
                component.find('videoTag').getElement().setAttribute('height',component.get('v.height'))
                component.find('videoTag').getElement().setAttribute('class',componentObj.config.customCSSClasses);
            }
        }),1000);
    }
})