({
    handleFieldChangeEvent : function(component, event, helper) {
        if (event.getParam('fieldId') === 'account') {
            var accountId = component.get('v.value.account');
            if (!$A.util.isEmpty(accountId)) {
                component.find('bodycomp').set('v.body', []);
                helper.findAccounts(component);
            }
        }
    }
})