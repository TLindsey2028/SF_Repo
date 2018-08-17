({
    doInit : function(component,event,helper) {
        helper.showForm(component);
        helper.showScheduleItems(component);
        helper.showNoSettings(component);
        if($A.util.isUndefinedOrNull(component.get('v.salesOrderLineItem').formId)) {
            helper.groupAttendeeCompleteness(component);
        }
    },
    handleAttendeeEvent : function(component,event,helper) {
        if (event.getParam('groupUniqueIdentifier') === component.get('v.uniqueIdentifier')) {
            var attendeeObj = event.getParam('attendeeObj');
            var currentAttendeeObj = component.get('v.salesOrderLineItem')
            if (attendeeObj.salesOrderLineItem.salesOrderLine === currentAttendeeObj.salesOrderLine) {
                component.set('v.salesOrderLineItem', attendeeObj.salesOrderLineItem);
                helper.showForm(component);
                helper.showScheduleItems(component);
                helper.showNoSettings(component);
                if($A.util.isUndefinedOrNull(component.get('v.salesOrderLineItem').formId)) {
                    helper.groupAttendeeCompleteness(component);
                }
            }
        }
    },
    handleSCCompletenessEvent : function (component,event,helper) {
        if (event.getParam('salesOrderLine') === component.get('v.salesOrderLineItem').salesOrderLine) {
            component.set('v.scheduleItemsComplete',event.getParam('scheduleItemsComplete'));
            helper.groupAttendeeCompleteness(component);
        }
    },
    handleFormSubmitEvent : function (component,event,helper) {
        if (event.getParam('formIdentifier') === component.get('v.salesOrderLineItem').salesOrderLine) {
            component.set('v.formComplete',event.getParam('formComplete'));
            helper.groupAttendeeCompleteness(component);
        }
    }
})