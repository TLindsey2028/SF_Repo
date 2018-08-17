({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    handleFieldUpdateEvent: function(component, event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    showPackageItem : function(component,event) {
            window.open(
                '/'+event.target.dataset.id,
                '_blank'
            );
    }
})