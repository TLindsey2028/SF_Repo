/* global _ */

({
    doInit: function(component, event, helper) {
        try {
            if ($A.util.isUndefinedOrNull(component.get('v.so'))) {
                component.set('v.so',{subtotal : 0});
            }
            helper.showSummaryDetail(component);
        }
        catch (e) {
            console.log(e);
        }
    },
    handleFieldUpdateEvent: function (component, event) {
        if (event.getParam('group') === 'summary' && event.getParam('fieldId') === 'sourceCodeName') {
            var sourceCodeName = event.getParam('value');
            if (!$A.util.isEmpty(component.find('discountButton'))) {
                if ($A.util.isUndefinedOrNull(sourceCodeName) ||
                    (!$A.util.isUndefinedOrNull(sourceCodeName) && sourceCodeName.length === 0)) {
                    component.find('discountButton').set('v.disable', true);
                }
                else {
                    component.find('discountButton').set('v.disable', false);
                }
            }
        }
    },
    openModal : function (component, event ) {
        var compEvent = $A.get("e.LTE:EventRegistrationFlowSummaryEvent");
        compEvent.fire();
    },
    closeSummary : function(component, event) {
        var container = component.find('modalContainer');
        var body = document.body;

        $A.util.removeClass(container, 'slds-fade-in-open');
        $A.util.addClass(container, 'slds-fade-out-close');
        setTimeout($A.getCallback(function () {
            $A.util.removeClass(container, 'slds-fade-out-close');
            $A.util.removeClass(body, 'noscroll');
        }), 75);
    },
    handleToggleOrderSummaryCloseButtonEvent : function (component) {
        if (!$A.util.isUndefinedOrNull(component.find('closeButton'))) {
            $A.util.toggleClass(component.find('closeButton'),'slds-hide');
        }
    },
    applyDiscount : function(component, event, helper) {
        helper.applyDiscount(component);
    }
})