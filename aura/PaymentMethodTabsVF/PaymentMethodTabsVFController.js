({
    doInit : function(component) {
        var componentsToCreate = [];
        var paymentTypes = component.get('v.paymentTypes');
        if (!$A.util.isEmpty(paymentTypes) && paymentTypes.length > 0) {
            paymentTypes.forEach(function(element){
                var elementToAdd = {};
                elementToAdd.customPaymentTypeObj = JSON.parse(JSON.stringify(element));
                elementToAdd.salesOrder = component.get('v.salesOrderId');
                componentsToCreate.push([element.lightningComponent,elementToAdd]);
            });

            $A.createComponents(componentsToCreate,
                function(components) {
                    var paymentTypeBodyItems = component.find('paymentTypeBody');
                    if (!$A.util.isEmpty(paymentTypeBodyItems) && !$A.util.isArray(paymentTypeBodyItems)) {
                        paymentTypeBodyItems = [paymentTypeBodyItems];
                    }
                    if (componentsToCreate.length === paymentTypeBodyItems.length) {
                        components.forEach(function (createdComponent, index) {
                            paymentTypeBodyItems[index].set('v.body', [createdComponent]);
                        });
                    }
                });
        }
    }
})