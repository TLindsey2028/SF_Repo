({
    loadSalesOrder : function(component) {
        var self = this;
        var action = component.get('c.getSalesOrder');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.salesOrderObj',result.getReturnValue());
                self.getBusinessGroups(component);
                var soObj = component.get('v.salesOrderObj');
                if (soObj.postingEntity !== 'Receipt') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order posting entity must be Receipt.');
                }
                else if (soObj.status !== 'Closed') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order is not closed.');
                }
                else if (soObj.postingStatus !== 'Pending') {
                    component.set('v.invalidSO',true);
                    component.set('v.invalidMessage','Sales Order has incorrect posting status.');
                }
                if (!component.get('v.invalidSO')) {
                    if (soObj.taxRequired || soObj.shippingRequired) {
                        component.set('v.hasShipping',true);
                        $A.createComponent(
                            'markup://OrderApi:SalesOrderShipping',
                            {
                                'salesOrder' : soObj,
                            }, function(cmp) {
                                component.set('v.shippingGlobalId',cmp.getGlobalId());
                                var divComponent = component.find("taxShippingDiv");
                                var divBody = divComponent.get("v.body");
                                divBody.push(cmp);
                                divComponent.set('v.body',divBody);
                            }
                        );
                    }
                    $A.createComponent(
                        'markup://OrderApi:SalesOrderSummary',
                        {
                            'salesOrder' : soObj,
                        }, function(cmp) {
                            var divComponent = component.find("summaryDiv");
                            var divBody = divComponent.get("v.body");
                            divBody.push(cmp);
                            divComponent.set('v.body',divBody);
                        }
                    );
                    this.buildProformaInvoiceComponent(component);
                }
            }
            $A.util.addClass(component.find('loading-span-stencil'),'stencil-hidden');
            setTimeout($A.getCallback(function(){
                $A.util.removeClass(component.find('mainData'),'stencil-hidden');
                $A.util.addClass(component.find('mainData'),'stencil-visible');
            }),100);
            self.fireComponentLoadedEvent(component);
        });
        $A.enqueueAction(action);
    },
    updateSalesOrder : function(component, fieldName) {
        var action = component.get('c.updateSalesOrder');
        action.setParams({
                salesOrderString : JSON.stringify(component.get('v.salesOrderObj')),
                fieldUpdated : fieldName
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.salesOrderObj',result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    getBusinessGroups : function(component) {
        var action = component.get('c.getBusinessGroups');
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                var businessGroupOptions = result.getReturnValue();
                if (businessGroupOptions.length > 1) {
                    component.find('businessGroupId').setSelectOptions(businessGroupOptions, component.get('v.salesOrderObj').businessGroupId);
                    component.find('businessGroupId').set('v.fireChangeEvent',true);
                    $A.util.removeClass(component.find('businessGroupDiv'), 'hidden');
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    updateSalesOrderBusinessGroup : function(component) {
        var action = component.get('c.updateSalesOrder');
        action.setParams({
                salesOrderString : JSON.stringify(component.get('v.salesOrderObj')),
                fieldUpdated : 'businessGroup'
            }
        );
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                if (!$A.util.isEmpty(component.get('v.proInvGlobalId'))) {
                    $A.getComponent(component.get('v.proInvGlobalId')).destroy();
                }
                this.buildProformaInvoiceComponent(component);
            }
        });
        $A.enqueueAction(action);
    },
    buildProformaInvoiceComponent : function(component) {
        $A.createComponent(
            'markup://OrderApi:'+'ProformaInvoiceComposerTemplate',
            {
                'salesOrderId' : component.get('v.salesOrderId'),
                'isModal' : false
            }, function(cmp) {
                component.set('v.proInvGlobalId', cmp.getGlobalId());
                var divComponent = component.find("proformaComp");
                var divBody = divComponent.get("v.body");
                divBody.push(cmp);
                divComponent.set('v.body',divBody);
            }
        );
    }
})