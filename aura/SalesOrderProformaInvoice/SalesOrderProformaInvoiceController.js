({
    doInit: function(component, event, helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            component.set('v.salesOrderId',component.get('v.recordId'));
        }
        helper.loadSalesOrder(component);
    },
    handleFieldUpdateEvent : function (component, event, helper) {
		if (event.getParam('group') === 'salesOrderInfo') {
		    if (event.getParam('fieldId') === 'businessGroupId') {
                helper.updateSalesOrderBusinessGroup(component);
            }
		}
    },
    exitPage : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            $A.get('e.force:refreshView').fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.salesOrderId'));
        }
    },
    goBack : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.returnObj'))) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({componentName : component.get('v.returnObj.componentName'),
                componentParams : component.get('v.returnObj.componentParams')});
            compEvent.fire();
        }
        else {
            if ($A.util.isEmpty(component.get('v.retURL'))) {
                UrlUtil.navToSObject(component.get('v.salesOrderId'));
            } else {
                UrlUtil.navToUrl(component.get('v.retURL'));
            }
        }
    },
	sendProformaInvoiceEmail : function(component) {
        var proformaValid = true;
        var shippingValid = true;
        var proformaInvComponent;
        if (!$A.util.isEmpty(component.get('v.proInvGlobalId'))) {
            proformaInvComponent = $A.getComponent(component.get('v.proInvGlobalId'));
            proformaInvComponent.validate();
            proformaValid = proformaInvComponent.get('v.validated');
        }
        if (!$A.util.isEmpty(component.get('v.shippingGlobalId'))) {
            var shipComponent = $A.getComponent(component.get('v.shippingGlobalId'));
            shipComponent.validate();
            shippingValid = shipComponent.get('v.validated');
        }
		if (proformaValid && shippingValid) {
			var action = component.get('c.sendProformaInvEmail');
			action.setParams({
				emailWrapper: JSON.stringify(proformaInvComponent.get('v.proformaInvComposerObj')),
				salesOrderId: component.get('v.salesOrderId')
			});
			action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                proformaInvComponent.hideProformaInvFields();
                $A.util.addClass(component.find('sendEmailButton'),'hidden');
                component.set('v.emailSent',true);
            }
			component.find('invSendEmailButton').stopIndicator();
			});
            var compEvent = $A.get('e.OrderApi:DisableComponent');
            compEvent.fire();
			$A.enqueueAction(action);
		}
		else {
			component.find('invSendEmailButton').stopIndicator();
		}
	},
    closeWindow : function (component, event, helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            var dismissActionPanel = $A.get("e.force:closeQuickAction");
            dismissActionPanel.fire();
            $A.get('e.force:refreshView').fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.salesOrderId'));
        }
	},
    handleWillNotShipEvent : function (component, event) {
        component.find('invSendEmailButton').set('v.disable', event.getParam('willNotShip'));
    },
    handleDisableButtonEvent : function(component, event, helper) {
        component.find('invSendEmailButton').set('v.disable', event.getParam('setDisable'));
    }
})