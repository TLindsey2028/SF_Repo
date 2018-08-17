({
    doInit: function(component, event, helper) {
        helper.buildFieldTypeOptions(component);
    },
    handleFieldUpdate: function(component, event, helper) {
        if (event.getParam('fieldId') === 'fieldType') {
            helper.addSelectedFieldType(component);
        }
    },
    compileInputFields: function(component, event, helper) {
        helper.compileInputFields(component);
    },
    clearInputFields: function(component, event, helper) {
        var divComponent = component.find("inputFieldBody");
        divComponent.get('v.body').forEach(function(cmp) {
            cmp.destroy();
        });
        divComponent.set("v.body", []);
        component.get('v.playGroundObj', {});
    }
})