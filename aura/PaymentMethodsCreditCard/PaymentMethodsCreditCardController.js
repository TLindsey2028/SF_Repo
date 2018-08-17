({
    doInit : function (component,event,helper) {
        helper.createCCComponent(component);
    },
    editPayMethod : function (component, event, helper) {
        var paymentId;
        if (!$A.util.isUndefinedOrNull(event.target.dataset.id)) {
            paymentId = event.target.dataset.id;
        }
        else {
            paymentId = event.getSource().getElements()[0]['value'];
        }
        helper.fireEvent(component, 'update',paymentId);
    },
    delPayMethod : function (component, event, helper) {
        var paymentId;
        if (!$A.util.isUndefinedOrNull(event.target.dataset.id)) {
            paymentId = event.target.dataset.id;
        }
        else {
            paymentId = event.getSource().getElements()[0]['value'];
        }
        helper.fireEvent(component, 'delete',paymentId);
    },
    newPayMethodModal : function (component) {
        $A.util.addClass(component.find('newPaymentMethodModal'), 'slds-fade-in-open');
        $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        document.body.classList.add('noscroll');
    },
    handleCCTokenizeEvent : function (component,event,helper) {
        helper.closeModal(component);
    },
    closeModal : function(component,event,helper) {
        helper.closeModal(component);
    },
    savePaymentMethod : function(component) {
        $A.getComponent(component.get('v.globalCCComp')).tokenizeCC(false);
    },
    handleGatewayChange : function (component,event,helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.paymentGateway'))) {
            helper.createCCComponent(component);
            if (!$A.util.isUndefinedOrNull(component.get('v.globalCCComp'))) {
                $A.getComponent(component.get('v.globalCCComp')).set('v.paymentGateway', component.get('v.paymentGateway'));
                $A.getComponent(component.get('v.globalCCComp')).updatePaymentGateway();
            }
        }
    },
    handleButtonToggleIndicatorEvent : function (component,event) {
        if (event.getParam('group') === 'paymentButtons') {
            component.find('saveModalButton').stopIndicator();
        }
    },
    stopIndicator : function (component, event) {
        if (event.getParams().buttonId && component.find(event.getParams().buttonId)) {
            component.find(event.getParams().buttonId).stopIndicator();
        }
    }
})