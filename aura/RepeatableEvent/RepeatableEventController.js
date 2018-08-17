({
    doInit : function(component, event, helper) {
        //helper.buildRepeatableEventFields(component);
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        if (event.getParam('fieldId') === 'repeatableEvent' && event.getParam('group') === 'eventModal4') {
            if (component.get('v.eventModalObj.repeatableEvent')) {
                $A.util.removeClass(component.find('repeatableSection'), 'hidden');
            } else {
                $A.util.addClass(component.find('repeatableSection'), 'hidden');
            }
        }
        if (event.getParam('fieldId') === 'frequency') {
            if (component.get('v.eventModalObj.frequency') === 'Custom') {
                $A.util.removeClass(component.find('repeatsEveryElement'), 'slds-hidden');
            } else {
               $A.util.addClass(component.find('repeatsEveryElement'), 'slds-hidden');
            }
        }
    },
    validate : function(component) {
        component.find('startsOn').validate();
        component.set('v.validated', component.find('startsOn').get('v.validated'));
    }
})