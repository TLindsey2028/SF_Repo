/* global FontevaHelper */
({
    doInit : function(component,event,helper) {
        if (!component.get('v.disableRouting')) {
            helper.getRecordAndShowComponent(component);
        }
    },
    handleBaseComponentLoadCompleteEvent : function (component) {
        var interval = setInterval($A.getCallback(function(){
            if (!$A.util.isEmpty(component.find('mainLoader'))) {
                $A.util.addClass(component.find('mainLoader'), 'slds-hide');
                $A.util.removeClass(component.find('mainContent'), 'slds-hide');
                clearInterval(interval);
            }
        }),100);

    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'FontevaController') {
            FontevaHelper.showComponent(component, event.getParam('componentName'), event.getParam('componentParams'),helper.divId);
        }
    }
})