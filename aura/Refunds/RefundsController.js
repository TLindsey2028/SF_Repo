({
    doInit : function(component, event, helper) {
        if (component.get('v.isCreating') === true) {
            helper.checkCreateRefund(component);
            return;
        }
        // Processing refund should be run as lightning component under one app
        // SF classic uses 'Execute JS', not Lightning component.
        if (!helper.isRunUnderOneApp()) {
            component.find('refundAlreadyCreatedMessage').showModal();
            return;
        }
        if (component.get('v.isCreating') === false) {
            helper.processRefund(component);
        }
    },

    continueRefund : function(component, event, helper) {
       component.find('refundAlreadyCreatedMessage').hideModal();
       helper.createRefund(component);
    },

    goBack : function (component, event, helper) {
        if (component.get('v.isRefundAlreadyCreated') === 'false') {
            helper.createRefund(component);
        }
        else {
            helper.goBack(component);
        }
    },
    goBack : function (component, event, helper) {
        helper.goBack(component);
    },
    viewRefund : function(component, event, helper) {
        helper.viewRefund(component);
    }

})