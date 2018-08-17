({
    updateSalesLine : function(component) {
        var action = component.get('c.updateLine');
        action.setParams(
            {
                salesOrderLineString : JSON.stringify(component.get('v.salesOrderLine')),
                fieldUpdated : 'priceQuantity'
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                //lock down the SO until we're done processing
                var startProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
                startProcessing.setParams({processingChanges: true});
                startProcessing.fire();

                var salesOrderObj = result.getReturnValue();
                if (!salesOrderObj.processingChanges) {
                    this.salesOrderUpdated(component, salesOrderObj);
                }
                else {
                    this.pollSOChanges(component, salesOrderObj);
                }
            }
        });
        $A.enqueueAction(action);
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
    salesOrderUpdated: function(component, salesOrderObj) {
        var sol = component.get('v.salesOrderLine');
        salesOrderObj.lines.every(function (element) {
            if (element.salesOrderLineId === sol.salesOrderLineId) {
                sol = element;
                return false;
            }
            return true;
        });
        component.set("v.salesOrderLine", sol);
        if (!sol.priceOverride) {
            component.find('salePrice').updateValue(sol.salePrice, false);
        }
        var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
        solUpdateEvent.setParams(
            {
                salesOrder: salesOrderObj,
                refreshTax: sol.hasTax,
                refreshShipping: sol.hasShipping,
                refreshShippingMethod: sol.hasShipping
            }
        );
        solUpdateEvent.fire();

        //and fire stop processing
        var stopProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
        stopProcessing.setParams({processingChanges: false});
        stopProcessing.fire();
    },
    handleFieldEvent : function (component, event) {
        if (event.getParam('fieldId') === 'priceOverride') {
            this.updateSalesLine(component);
        }
        else if (event.getParam('fieldId') === 'salePrice' && this.validatePriceAndQuantityField(component,'salePrice','Sale Price',true)) {
            this.updateSalesLine(component);
        }
        else if (event.getParam('fieldId') === 'quantity' && this.validatePriceAndQuantityField(component,'quantity','Quantity',false)) {
            this.updateSalesLine(component);
        }
    },
    validatePriceAndQuantityField : function(component,fieldToValidate,fieldType,allowZero) {
        if (!$A.util.isUndefinedOrNull(component.get('v.salesOrderLine')[fieldToValidate])) {
            if (allowZero && component.get('v.salesOrderLine')[fieldToValidate] < 0) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' must be greater than 0'}]);
                return false;
            }
            else if (!allowZero && component.get('v.salesOrderLine')[fieldToValidate] <= 0 ) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' must be greater than 0'}]);
                return false;
            }
            else if (component.get('v.salesOrderLine')[fieldToValidate] > 5000000) {
                component.find(fieldToValidate).setErrorMessages([{message: fieldType + ' value to large'}]);
                return false;
            }
        }
        return true;
    }
})