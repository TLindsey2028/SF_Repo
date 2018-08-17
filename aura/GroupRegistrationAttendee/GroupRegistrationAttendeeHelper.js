({
    showForm : function (component) {
        var itemObj = component.get('v.salesOrderLineItem');
        if (!$A.util.isUndefinedOrNull(itemObj.formId) && itemObj.formId.length > 0) {
                var action = component.get('c.getFormResponse');
                action.setParams({salesOrderLine : itemObj.salesOrderLine});
                action.setCallback(this,function(result) {
                    if (result.getState() === 'ERROR') {
                        result.getError().forEach(function (error) {
                            component.find('toastMessages').showMessage('', error.message, false, 'error');
                        });
                    }
                    else {
                        $A.createComponent('markup://ROEApi:Form',
                            {
                                form: itemObj.formId,
                                subjectId: itemObj.assignmentId,
                                subjectLookupField: 'OrderApi__Assignment__c',
                                'aura:id': itemObj.salesOrderLine,
                                formResponseId: result.getReturnValue(),
                                formUniqueIdentifier: itemObj.salesOrderLine,
                            }, function (cmp) {
                                var divComponent = component.find("form");
                                var divBody = divComponent.get("v.body");
                                if (divBody.length > 0) {
                                    divBody[0].destroy();
                                }
                                divBody = [cmp];
                                divComponent.set('v.body', divBody);
                            });
                    }
                });
            $A.enqueueAction(action);
            $A.util.removeClass(component.find('form'),'slds-hide');
        }
        else {
            component.set('v.formComplete',true);
            var divComponent = component.find("form");
            divComponent.set('v.body', []);
        }
    },
    showScheduleItems : function (component) {
        var itemObj = component.get('v.salesOrderLineItem');
        if (itemObj.scheduleItemsEnabled) {
            $A.createComponent('markup://ROEApi:ScheduleItems',
                {
                    event : component.get('v.event'),
                    parentSalesOrderLine : itemObj.salesOrderLine,
                    salesOrder : itemObj.salesOrder,
                    currencyISOCode : itemObj.currencyISOCode,
                    isMultiCurrencyOrg : itemObj.isMultiCurrencyOrg
                }, function (cmp) {
                    var divComponent = component.find("scheduleItems");
                    var divBody = divComponent.get("v.body");
                    if (divBody.length > 0) {
                        divBody[0].destroy();
                    }
                    divBody = [cmp];
                    divComponent.set('v.body', divBody);
                });
            $A.util.removeClass(component.find('scheduleItems'),'slds-hide');
        }
        else {
            component.set('v.scheduleItemsComplete',true);
            var divComponent = component.find("scheduleItems");
            divComponent.set('v.body', []);
        }
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    groupAttendeeCompleteness : function(component) {
        var groupAttendeeRegComplete = true;
        if (!component.get('v.scheduleItemsComplete') || !component.get('v.formComplete')) {
            groupAttendeeRegComplete = false;
        }

        var compEvent = $A.get('e.ROEApi:GroupRegistrationCompleteEvent');
        compEvent.setParams({
            salesOrderLine : component.get('v.salesOrderLineItem').salesOrderLine,
            groupRegistrationAttendeeComplete : groupAttendeeRegComplete
        });
        compEvent.fire();

    },
    showNoSettings : function(component) {
        var itemObj = component.get('v.salesOrderLineItem');
        if ($A.util.isUndefinedOrNull(itemObj.formId) || (!$A.util.isUndefinedOrNull(itemObj.formId) && itemObj.formId.length === 0 && itemObj.scheduleItemsEnabled)) {
            $A.util.removeClass(component.find('noSettings'),'slds-hide');
        } else {
            $A.util.addClass(component.find('noSettings'),'slds-hide');
        }
    }
})