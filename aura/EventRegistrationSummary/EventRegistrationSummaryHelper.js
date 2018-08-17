/* global _ */
/* global FontevaHelper */

({
    applyDiscount: function (component) {
        var self = this;
        var applyDiscountCallback = function(so) {
            component.find('discountButton').stopIndicator();
            self.fireProcessingChangesEvent(false);
            component.set('v.so', so);
            //update summary
            self.showSummaryDetail(component);
        }
        component.find('sourceCodeName').validate();

        if (component.find('sourceCodeName').get('v.validated')) {
            self.fireProcessingChangesEvent(true);
            var action = component.get('c.updateSourceCode');
            action.setParams({
                eventId: component.get('v.eventObj.id'),
                salesOrderId: component.get('v.so.id'),
                sourceCodeName: component.get('v.so.sourceCodeName'),
                createContactForAttendees : component.get('v.eventObj.createContactForAttendees')
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    component.find('discountButton').stopIndicator();
                    self.fireProcessingChangesEvent(false);
                    result.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    var discount = result.getReturnValue();
                    if (!discount.isValid) {
                        component.find('discountButton').stopIndicator();
                        self.fireProcessingChangesEvent(false);
                        var errors = [{
                            message: discount.errorMessageToDisplay
                        }];
                        component.find('sourceCodeName').setErrorMessages(errors);
                        return;
                    }
                    if (discount.updatedOrder.processingChanges) {
                        self.poolSOForChanges(component, applyDiscountCallback);
                        return;
                    }
                    applyDiscountCallback(discount.updatedOrder);
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('discountButton').stopIndicator();
        }
    },
    poolSOForChanges: function(component, applyDiscountCallback) {
        var self = this;
        this.getUpdatedSalesOrder(component, function (so) {
            if (so.processingChanges) {
                setTimeout($A.getCallback(function() {
                  self.poolSOForChanges(component, applyDiscountCallback);
                }), 750);
            } else {
                applyDiscountCallback && applyDiscountCallback(so);
            }
        });
    },
    fireProcessingChangesEvent: function(processingChanges) {
        var processingChangesEvent = $A.get('e.OrderApi:ProcessingChangesEvent');
        processingChangesEvent.setParams({
            processingChanges: processingChanges
        });
        processingChangesEvent.fire();
    },
    getUpdatedSalesOrder: function(component, cb) {
        ActionUtils.executeAction(this, component, 'c.getSalesOrder', {
            salesOrderId: component.get('v.so.id'),
            eventId: component.get('v.eventObj.id'),
            doDuplicateCheck : false})
        .then(
            function (result) {
                cb && cb(result);
            },
            function(error){});
    },
    showSummaryDetail: function(component) {
        setTimeout($A.getCallback(function(){
            var divComponent = component.find('summaryDetailDiv');
            if (!$A.util.isEmpty(divComponent)) {
                var divBody = divComponent.get("v.body");
                if (divBody.length > 0) {
                    divBody.forEach(function (element) {
                        element.destroy();
                    });
                }
               var params = {
                attendeeObj : component.get('v.attendeeObj'),
                usr : component.get('v.usr'),
                eventObj : component.get('v.eventObj'),
                siteObj : component.get('v.siteObj'),
                storeObj : component.get('v.storeObj'),
                so : component.get('v.so'),
                readOnly: component.get('v.readOnly'),
                initialPurchase: component.get('v.initialPurchase'),
                displayTotal : component.get('v.displayTotal'),
                processingChangesCmp : component.find('processingChanges'),
                regSummaryNested : component.get('v.regSummaryNested')
               };
                FontevaHelper.showComponent(component, 'LTE:EventRegistrationSummaryDetail', params, 'summaryDetailDiv');
            }
        }),250);
    }
})