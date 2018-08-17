({
    constructItemLines : function(component) {
        var salesOrderObj = component.get('v.salesOrder');
        var divComponent = component.find("itemLineDiv");
        var divBody = divComponent.get("v.body");
        if (divBody.length > 0){
            divBody.forEach(function(element) {
                element.destroy();
            });
        }
        divBody = [];
        salesOrderObj.itemLines.forEach( function(element) {
            if (component.get('v.isCommunityView')) {
                element.canOverridePrice = false;
            }
            $A.createComponent(
                'markup://OrderApi:'+'SalesOrderSummaryLine',
                {
                    salesOrderLine : element,
                    currencyISOCode : salesOrderObj.currencyISOCode,
                    isMultiCurrency : salesOrderObj.isMultiCurrency,
                }, function(cmp) {
                    divBody.push(cmp);
                }
            );
        });
        divComponent.set('v.body',divBody);
        this.caluclateTax(component, salesOrderObj);
        this.caluclateShipping(component, salesOrderObj);
    },
    caluclateTax : function(component, salesOrderObj) {
        if (salesOrderObj.taxRequired) {
            var divComponent = component.find("taxLineDiv");
            var divBody = divComponent.get("v.body");
            var borderAdded = false;
            if (divBody.length > 0){
                divBody.forEach(function(element) {
                    element.destroy();
                });
            }
            divBody = [];
            salesOrderObj.taxLines.forEach( function(element) {
                if (component.get('v.isCommunityView')) {
                    element.canOverridePrice = false;
                }
                $A.createComponent(
                    'markup://OrderApi:'+'SalesOrderSummaryLine',
                    {
                        salesOrderLine : element,
                        topBorder : borderAdded ? false : true,
                        currencyISOCode : salesOrderObj.currencyISOCode,
                        isMultiCurrency : salesOrderObj.isMultiCurrency,
                    }, function(cmp) {
                        divBody.push(cmp);
                    }
                );
                borderAdded = true;
            });
            divComponent.set('v.body',divBody);
        }
    },
    caluclateShipping : function(component, salesOrderObj) {
        if (salesOrderObj.shippingRequired) {
            if (salesOrderObj.businessGroup.enableShippingByOrder) {
                var divComponent = component.find("shipDiv");
                var divBody = divComponent.get("v.body");
                if (divBody.length > 0){
                    divBody.forEach(function(element) {
                        element.destroy();
                    });
                }
                divBody = [];
                if (!$A.util.isEmpty(salesOrderObj.orderShippingLine.itemName)) {
                    if (component.get('v.isCommunityView')) {
                        salesOrderObj.orderShippingLine.canOverridePrice = false;
                    }
                    $A.createComponent(
                        'markup://OrderApi:'+'SalesOrderSummaryLine',
                        {
                            salesOrderLine : salesOrderObj.orderShippingLine,
                            currencyISOCode : salesOrderObj.currencyISOCode,
                            isMultiCurrency : salesOrderObj.isMultiCurrency,
                        }, function(cmp) {
                            divBody.push(cmp);
                        }
                    );
                }
                divComponent.set('v.body',divBody);
            } else {
                var divComponent = component.find("shipDiv");
                var divBody = divComponent.get("v.body");
                if (divBody.length > 0){
                    divBody.forEach(function(element) {
                        element.destroy();
                    });
                }
                divBody = [];
                salesOrderObj.shippingLines.forEach( function(element) {
                    if (!$A.util.isEmpty(element.shippingLine.itemName)) {
                        if (component.get('v.isCommunityView')) {
                            element.shippingLine.canOverridePrice = false;
                        }
                        $A.createComponent(
                            'markup://OrderApi:'+'SalesOrderSummaryLine',
                            {
                                salesOrderLine : element.shippingLine,
                                currencyISOCode : salesOrderObj.currencyISOCode,
                                isMultiCurrency : salesOrderObj.isMultiCurrency,
                                parentItemName : element.parentLine.itemName,
                            }, function(cmp) {
                                divBody.push(cmp);
                            }
                        );
                    }
                });
                divComponent.set('v.body',divBody);
            }
        }
    },
    handleSalesOrderUpdate : function(component, event) {
        var salesOrderObj = event.getParam('salesOrder');
        component.set('v.salesOrder', salesOrderObj);
        if (event.getParam('refreshShipping')) {
            this.caluclateShipping(component, salesOrderObj);
        }
        if (event.getParam('refreshTax')) {
            this.caluclateTax(component, salesOrderObj);
        }
    },
    applyDiscount : function(component) {
        var self = this;
        component.find('sourceCodeName').validate();
        if (component.find('sourceCodeName').get('v.validated')) {
            //lock down the SO until we're done processing
            var startProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
            startProcessing.setParams({processingChanges: true});
            startProcessing.fire();

            self.fireDisableButtonEvent(true);
            var action = component.get('c.updateSourceCode');
            action.setParams({salesOrderString : JSON.stringify(component.get('v.salesOrder'))});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var discObj = result.getReturnValue();
                    if (discObj.isValid) {

                        //ensure we aren't still processing the SO
                        if (!discObj.updatedOrder.processingChanges) {
                            self.salesOrderUpdated(component, discObj.updatedOrder);
                        }
                        else {
                            self.pollSOChanges(component, discObj.updatedOrder);
                        }
                    }
                    else {
                        var errors = new Array();
                        errors.push({
                            message: discObj.errorMessageToDisplay
                        });
                        component.find('discountButton').stopIndicator();
                        component.find('sourceCodeName').setErrorMessages(errors);
                    }
                }
                component.find('discountButton').stopIndicator();
                self.fireDisableButtonEvent(false);
            });
            $A.enqueueAction(action);
        }
        else {
             component.find('discountButton').stopIndicator();
        }
    },
    salesOrderUpdated: function(component, salesOrder) {
        var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
        solUpdateEvent.setParams(
            {
                salesOrder: salesOrder
            }
        );
        solUpdateEvent.fire();
        this.constructItemLines(component);

        //and fire stop processing
        var stopProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
        stopProcessing.setParams({processingChanges: false});
        stopProcessing.fire();
    },
    pollSOChanges: function (component, salesOrder) {
        var self = this;
        var soCompletedCalled = false;
        var interval = setInterval($A.getCallback(function () {
            var action = component.get('c.getSalesOrder');
            action.setParams({salesOrderId: salesOrder.salesOrderId});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    var so = result.getReturnValue();
                    if (!so.processingChanges) {
                        clearInterval(interval);
                        if (!soCompletedCalled) {
                            soCompletedCalled = true;
                            self.salesOrderUpdated(component, so);
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }), 500);
    },
    handleFieldUpdateEvent : function(component,event) {
        if (event.getParam('group') === 'summary' && event.getParam('fieldId') === 'sourceCodeName') {
            if ($A.util.isUndefinedOrNull(component.get('v.salesOrder.sourceCodeName')) ||
                (!$A.util.isUndefinedOrNull(component.get('v.salesOrder.sourceCodeName')) && component.get('v.salesOrder.sourceCodeName').length === 0)) {
                component.find('discountButton').set('v.disable',true);
            }
            else {
                component.find('discountButton').set('v.disable',false);
            }
        }
    },
    fireDisableButtonEvent : function(isDisable) {
            var disableButtonEvent = $A.get('e.OrderApi:DisableButtonEvent');
            disableButtonEvent.setParams(
                {
                    setDisable: isDisable,
                }
            );
            disableButtonEvent.fire();
    }
})