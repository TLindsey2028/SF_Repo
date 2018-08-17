({
    getConfigInfo : function (component) {
        var self = this;
        var action = component.get('c.getConfigurationInfo');
        action.setCallback(this,function(result){
            var resultObj = result.getReturnValue();
            component.set('v.exceptionContact',resultObj.exceptionContact);
            component.set('v.exceptionAccount',resultObj.exceptionAccount);
            component.set('v.dateFormat',resultObj.dateFormat);
            self.createQuickAdd(component);
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    createQuickAdd : function(component) {
        var returnObj = {componentName : 'markup://ROEApi:'+'ItemQuickAdd',
            componentParams : {
                salesOrder : component.get('v.salesOrder'),
                contact : component.get('v.contact'),
                account : component.get('v.account'),
                exceptionContact : component.get('v.exceptionContact'),
                exceptionAccount : component.get('v.exceptionAccount'),
                dateFormat : component.get('v.dateFormat'),
                recordId : component.get('v.recordId')
            }};
        $A.createComponent('markup://ROEApi:'+'ItemQuickAdd',
            returnObj.componentParams,
            function(cmp){
                var divComponent = component.find("roeBody");
                divComponent.set("v.body",[cmp]);
            });
    }
})