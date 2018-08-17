({
    doInit: function (component, event, helper) {
        helper.doInit(component);
    },
    previousStep: function (component, event, helper) {
        helper.previousStep(component);
    },
    confirmWaitlist: function (component, event, helper) {
        helper.confirmWaitlistObj(component);
    },
    confirmFreeOrder: function (component, event, helper) {
        helper.confirmFreeOrder(component);
    },
    editAttendees: function (component, event, helper) {
        helper.editAttendees(component);
    },
    handleButtonToggleIndicatorEvent : function (component, event, helper) {
        if (event.getParam('group') === 'paymentButtons') {
            helper.fireDisableProgressBarEvent(component, false);
        }
    },
    processPayment : function (component, event, helper) {
        helper.checkout(component,false);
    },
    handleProcessingChangesEvent : function (component,event, helper) {
        helper.handleProcessingChangesEvent(component,event.getParam('processingChanges'));
    },
    handlePayNowTabChangeEvent : function(component,event) {
        var currentTab = event.getParam('currentTab');
        var buttonElement = component.find('processPayment');
        if ($A.util.isArray(component.find('processPayment'))) {
            buttonElement = component.find('processPayment')[0];
        }
        var buttonDiv = component.find('paymentDiv');
        if (event.getParam('customTab')) {
            if (!$A.util.isUndefinedOrNull(buttonDiv)) {
                $A.util.addClass(buttonDiv,'hidden');
            }
        }
        else {
            if (!$A.util.isUndefinedOrNull(buttonDiv)) {
                $A.util.removeClass(buttonDiv,'hidden');
            }
            if (currentTab === 'invoiceMe') {
                buttonElement.updateLabel($A.get('$Label.LTE.Invoice_Me_Payment'));
            }
            else {
                buttonElement.updateLabel($A.get('$Label.LTE.Process_Payment'));
            }
        }
    },
    submitCustomPayment : function (component,event,helper) {
        helper.checkout(component,true);
    },
    openCancelModal : function(component) {
        component.find('cancelPrompt').showModal();
    },
    fireCancelRegEvent : function(component) {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
    handleKAModal : function(component,event) {
        if ($A.get("$Browser.isPhone")){
            var wrapper = document.querySelector('.fonteva-event_wrapper');
            var action = event.getParam('action');
            if (action === 'close') {
                $A.util.removeClass(wrapper, 'drop');
            } else {
                $A.util.addClass(wrapper, 'drop');
            }
        }
    },
    saveKAModal : function(component, event) {
        if ($A.get("$Browser.isPhone")){
            var wrapper = document.querySelector('.fonteva-event_wrapper');
            $A.util.removeClass(wrapper, 'drop');
        }
    }
})