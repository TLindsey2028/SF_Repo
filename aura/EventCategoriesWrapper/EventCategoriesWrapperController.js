/* global _ */
({
    handleSwitchComponent : function (component,event) {
        var params = _.cloneDeep(event.getParam('componentParams'));
        delete params.identifier;
        $A.createComponent(event.getParam('componentName'), params,
            function(cmp) {
                var divComponent = component.find('mainBodyWrapper');
                divComponent.set("v.body", [cmp]);
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });
    }
})