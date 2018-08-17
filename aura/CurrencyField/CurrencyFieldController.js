({
    initCurrency: function(component, event, helper) {
        helper.getCurrencyField(component);
    },
    updateValue : function(component, event,helper) {
        helper.updateValue(component,event);
    },
    valueChanged : function(component,event,helper) {
        helper.getCurrencyField(component);
    }
})