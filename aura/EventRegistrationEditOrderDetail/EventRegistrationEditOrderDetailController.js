({
    openModal : function (component) {
        $A.util.addClass(component.find('attendeeBackdrop'),'slds-backdrop--open');
        $A.util.addClass(component.find('modalContainer'),'slds-fade-in-open');
        FontevaHelper.disableBodyScroll();
    },
    changeTab : function (component,event,helper) {
        helper.changeTab(component,event.currentTarget.dataset.response);
    },
    closeModal : function (component,event,helper) {
        helper.closeModal(component);
    },
    save : function (component,event,helper) {
        var validated = helper.saveForms(component);
        var attendeeValidated = helper.validateSubmitFieldsAttendeeFields(component);
        if (validated && attendeeValidated) {
            var interval = setInterval($A.getCallback(function () {
                helper.checkFormSubmitted(component);
                if (component.get('v.attendeeSaved') && component.get('v.formsSaved')) {
                    component.find('save').stopIndicator();
                    helper.closeModal(component);
                    clearInterval(interval);
                }
            }), 100);
        }
        else {
            component.find('toastMessages').showMessage($A.get('$Label.LTE.Event_Manage_Reg_Details_Validation_Header'), $A.get('$Label.LTE.Event_Manage_Reg_Details_Validation_Message'), false, 'error');
            component.find('save').stopIndicator();
        }
    }
})