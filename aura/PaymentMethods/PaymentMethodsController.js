({
    doInit : function(component,event,helper) {
        component.set('v.gatewayObj',{
            paymentGateway : null
        });
        component.set('v.selPayMethod',{
            fullName : null,
            email : null,
            phone : null,
            address : null
        });
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            component.set('v.entityId',component.get('v.recordId'));
        }
        if (!$A.util.isUndefinedOrNull(component.get('v.entityId')) && component.get('v.entityId').length > 0) {
            helper.getPaymentMethodDetails(component);
        }
        else {
            component.find('toastMessages').showMessage('','Invalid Customer Id',false,'error');
            helper.fireComponentLoadedEvent(component);
        }
    },
    handleFieldUpdateEvent : function (component,event,helper) {
        if (event.getParam('group') === 'gatewayPicker' && event.getParam('fieldId') === 'paymentGateway') {
            var gatewayId = component.get('v.gatewayObj.paymentGateway');
            if (!$A.util.isEmpty(gatewayId)) {
                var gatewayMap = component.get('v.gatewayMap');
                component.set('v.paymentGateway', gatewayMap[gatewayId]);
                helper.setGatewaysOnPaymentTypes(component);
            }
        }
    },
    closeModal : function(component,event,helper) {
        helper.closeModal(component);
    },
    handleCCTokenizeEvent : function (component,event,helper) {
        helper.getPaymentMethodDetails(component);
        helper.closeModal(component);
    },
    exitPage : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            $A.get('e.force:refreshView').fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.entityId'));
        }
    },
    handlePaymentMethodEvent : function (component, event) {
        if (!$A.util.isEmpty(event.getParam('type')) && !$A.util.isEmpty(event.getParam('paymentMethod'))) {
            if (event.getParam('type') === 'update') {
                component.set('v.selPayMethod',event.getParam('paymentMethod'));
                var addressObj = component.find('address');
                if ($A.util.isArray(addressObj)) {
                    addressObj = addressObj[0];
                }
                addressObj.set('v.knownAddressObj',{address : event.getParam('paymentMethod').address});
                addressObj.validateSummaryAddress();
                var compEvents = $A.get('e.Framework:RefreshInputField');
                compEvents.setParams(
                    {
                        group : 'editPaymentMethod',
                        type : 'value',
                        data : component.get('v.selPayMethod')
                    }
                );
                compEvents.fire();
                $A.util.addClass(component.find('updatePaymentMethodModal'), 'slds-fade-in-open');
                $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
            } else if (event.getParam('type') === 'delete') {
                component.set('v.deletePaymentStr',event.getParam('deletePaymentStr'));
                var selPayMethod = event.getParam('paymentMethod');
                if (selPayMethod.hasScheduledPayments) {
                    var methods = component.get('v.paymentMethods');
                    var transferMethodOptions = new Array();
                    methods.forEach(function(element){
                        if (element.paymentMethodId !== selPayMethod.paymentMethodId && !element.isExpired) {
                            transferMethodOptions.push({"label" : element.lastFour + ' ' + element.expiration, "value" : element.paymentMethodId});
                            if ($A.util.isEmpty(selPayMethod.paymentMethodToken)) {
                                selPayMethod.paymentMethodToken = element.paymentMethodId;
                            }
                        }
                    });
                    selPayMethod.hasOptions = transferMethodOptions.length > 0;
                    component.find('transferId').set('v.contact',component.get('v.entityId'));
                    component.find('transferId').set('v.paymentMethodIdsToExclude',[selPayMethod.paymentMethodId]);
                    component.find('transferId').getPaymentMethods();
                }
                component.set('v.selPayMethod', selPayMethod);
                $A.util.addClass(component.find('deletePaymentMethodModal'), 'slds-fade-in-open');
                $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
            }
        }
    },
    updatePaymentMethod : function (component, event, helper) {
        helper.updatePaymentMethod(component);
    },
    deletePaymentMethod : function (component, event, helper) {
        helper.deletePaymentMethod(component);
    },
    handlePaymentMethodButtons : function (component, event) {
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