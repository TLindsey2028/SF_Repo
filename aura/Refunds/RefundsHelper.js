({
    createRefund : function(component) {
        var action = component.get('c.createRefund');
        this.fireComponentLoadedEvent(component);
        action.setParams({
            recId: component.get('v.receiptId')
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                var responseHTML = '';
                response.getError().forEach(function(error){
                    if (responseHTML !== '') {
                        responseHTML += '</br>';
                    }
                    responseHTML += error.message;
                });
                component.find('refundErrorMessage').updateMessage(responseHTML);
                component.find('refundErrorMessage').showModal();
            }
            else {
                component.find('newRefundCreatedMessage').showModal();
                component.set('v.refundId',response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    isRunUnderOneApp: function() {
        return !$A.util.isUndefinedOrNull($A.get("e.force:navigateToSObject"));
    },
    checkCreateRefund: function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            component.set('v.receiptId',component.get('v.recordId'));
        }
        if (component.get('v.isRefundAlreadyCreated') === 'true') {
            this.fireComponentLoadedEvent(component);
            component.find('refundAlreadyCreatedMessage').showModal();
        } else {
            this.createRefund(component);
        }
    },
    processRefund: function(component) {
        var action = component.get('c.processRefundAction');
        action.setParams({
            recId: component.get('v.recordId')
        });
        action.setCallback(this, function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                return;
            }

            var result = response.getReturnValue();
            if (result.errorMessage) {
                component.find('toastMessages').showMessage('', result.errorMessage, false, 'error');
            } else {
                component.find('toastMessages').showMessage('', $A.get('$Label.OrderApi.Refund_Processed'), true, 'success', 'topCenter');
            }

            component.set('v.refundId',component.get('v.recordId'));

            var self = this;
            setTimeout($A.getCallback(function() {
                self.viewRefund(component);
            }), 100);

        });
        $A.enqueueAction(action);
    },
    goBack : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            var navEvt = $A.get("e.force:navigateToSObject");
            navEvt.setParams({
                "recordId": component.get('v.receiptId') || component.get('v.recordId')
            });
            navEvt.fire();
        }
        else {
            window.history.back();
        }
    },
    viewRefund : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (navEvt != null && !$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            navEvt.setParams({
                "recordId": component.get('v.refundId'),
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToUrl('/'+component.get('v.refundId'));
        }
    }
})