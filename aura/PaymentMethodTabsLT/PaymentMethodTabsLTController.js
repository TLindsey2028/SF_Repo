({
    doInit : function (component) {
        var componentsToCreate = [];
        var paymentTypes = component.get('v.paymentTypes');
        if (!$A.util.isEmpty(paymentTypes) && paymentTypes.length > 0) {
            paymentTypes.forEach(function(element){
                componentsToCreate.push([element.customPaymentTypeObj.lightningComponent,element]);
            });
            if (componentsToCreate.length > 0) {
                $A.createComponents(componentsToCreate,
                    function (components) {
                        var paymentTypeBodyItems = component.find('customPaymentTab');
                        if (!$A.util.isEmpty(paymentTypeBodyItems) && !$A.util.isArray(paymentTypeBodyItems)) {
                            paymentTypeBodyItems = [paymentTypeBodyItems];
                        }
                        components.forEach(function (createdComponent, index) {
                            paymentTypeBodyItems[index].set('v.body', [createdComponent]);
                        })
                    });
            }
        }
    },
    closeAllTabs : function(component) {
        var customComponents = component.find('customPaymentTab');
        if (!$A.util.isArray(customComponents)) {
            customComponents = [customComponents];
        }
        customComponents.forEach(function(element){
            $A.util.addClass(element, 'slds-hide');
        });
    },
    openTab : function (component,event) {
        var customPaymentId = event.getParam('arguments').customPaymentId;
        var customComponents = component.find('customPaymentTab');
        if (!$A.util.isArray(customComponents)) {
            customComponents = [customComponents];
        }
        customComponents.forEach(function(element){
            if (element.getElement().dataset.id === customPaymentId) {
                $A.util.removeClass(element, 'slds-hide');
            }
            else {
                $A.util.addClass(element, 'slds-hide');
            }
        });
    }
})