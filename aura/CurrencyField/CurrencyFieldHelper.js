({
    getCurrencyField : function(component) {
        try {
            if (component.get('v.showFreeLabel') && !$A.util.isEmpty(component.get('v.value')) && 0 === parseFloat(component.get('v.value'))) {
                component.set('v.formattedValue',$A.get('$Label.Framework.FreeCurrencyValue'));
            }
            else {
                var formattedCurrency = CurrencyTable.format(component.get('v.value'), component.get('v.currencyISOCode'), component.get('v.isMultiCurrencyOrg'));
                component.set('v.formattedValue', formattedCurrency);
            }
        }
        catch (err) {
        }
    },
    updateValue : function(component, event) {
        var params = event.getParam('arguments');
        if (params) {
            component.set('v.value',params.value);
            this.getCurrencyField(component);
        }
    },
})