({
    doInit : function(component,event,helper) {
        if (component.get('v.index') === 0) {
            component.set('v.componentsBuilt',true);
            helper.buildComponents(component,true);
        }
    },
    handleBuildEventPageEvent : function (component,event,helper) {
        if (component.get('v.index') !== 0 && !component.get('v.componentsBuilt')) {
            component.set('v.componentsBuilt',true);
            helper.buildComponents(component, false);
        }
    }
})