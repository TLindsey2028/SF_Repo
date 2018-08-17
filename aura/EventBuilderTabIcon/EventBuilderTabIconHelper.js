({
    doInit : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.iconUrl')) && component.get('v.iconUrl').indexOf('.svg') > -1 && component.get('v.iconUrl').indexOf('$Resource') === -1 && !component.get('v.iconUrl').startsWith('/resource')) {
            $A.createComponent('Framework:FONSVG',{
                svgPath : $A.get('$Resource.EventApi__SLDS_Icons')+component.get('v.iconUrl'),
                containerClass : 'slds-m-bottom--x-small',
                svgClass : 'slds-icon slds-icon-text-default slds-icon--medium event-builder-icons'},
                function(cmp) {
                    var spanBody = component.find('iconSpan');
                    spanBody.set('v.body',[cmp]);
                })
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.iconUrl')) && component.get('v.iconUrl').indexOf('$Resource') > -1) {
               var iconUrl = component.get('v.iconUrl');
               var [first, ...second] = component.get('v.iconUrl').split("/");
               if (!$A.util.isEmpty(first) && !$A.util.isEmpty(second)) {
                   iconUrl = $A.get(first)+'/'+second.join('/');
               }
               component.set('v.iconUrl',iconUrl);
            }
            if (!$A.util.isUndefinedOrNull(component.get('v.iconUrl'))) {
                component.set('v.showImage', true);
            }
        }
    }
})