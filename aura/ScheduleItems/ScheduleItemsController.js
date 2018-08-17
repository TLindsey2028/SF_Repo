({
    doInit: function(component, event,helper) {
        component.set('v.scheduleItem',{
            lookupSCItem : null
        });
        component.set('v.uniqueIdentifier',helper.generateId(8));
        component.set('v.salesOrderLines',[]);
        helper.getExistingSalesOrderLines(component);
        if(!$A.util.isUndefinedOrNull(component.get('v.event'))) {
            helper.createLookupField(component);
        }
    },
    handlePriceOverrideEvent : function(component,event,helper) {
        helper.handlePriceOverrideEvent(component);
    },
    handleFieldUpdateEvent: function(component, event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    registerScheduleItem : function(component, event,helper) {
        helper.registerScheduleItem(component);
    },
    handleTotalUpdateEvent : function(component,event,helper) {
        helper.handleTotalUpdateEvent(component,event);
    },
    removeScheduleItem : function(component, event,helper) {
        helper.removeScheduleItem(component,event);
    },
    handleFormSubmitEvent : function (component,event,helper) {
       helper.handleFormSubmitEvent(component,event);
    }
})