({
    doInit : function (component,event,helper) {
    },
    editPayMethod : function (component, event, helper) {
        var paymentId;
        if (!$A.util.isUndefinedOrNull(event.target.dataset.id)) {
            paymentId = event.target.dataset.id;
        }
        else {
            paymentId = event.getSource()['Oe']['value'];
        }
        helper.fireEvent(component, 'update',paymentId);
    },
    delPayMethod : function (component, event, helper) {
        var paymentId;
        if (!$A.util.isUndefinedOrNull(event.target.dataset.id)) {
            paymentId = event.target.dataset.id;
        }
        else {
            paymentId = event.getSource()['Oe']['value'];
        }
        helper.fireEvent(component, 'delete',paymentId);
    },
    newPayMethodModal : function (component) {
        $A.util.addClass(component.find('newPaymentMethodModal'), 'slds-fade-in-open');
        $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
    },
    closeModal : function(component,event,helper) {
        helper.closeModal(component);
    },
    savePaymentMethod : function(component) {
        $A.getComponent(component.get('v.globalECheckComp')).tokenizeEcheck();
    }
})