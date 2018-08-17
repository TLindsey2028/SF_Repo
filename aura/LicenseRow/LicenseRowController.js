({
    doInit : function(component, event, helper) {
        helper.buildRow(component);
    },
    "valueChanged" : function(component, event) {

        if(event.getParam('group') === component.get('v.group') ){
            var rowLicense = component.get('v.licenseRow');
            if(!$A.util.isEmpty(rowLicense.licenseName) && !$A.util.isEmpty(rowLicense.packageName)) {
                event.stopPropagation();
                component.set("v.showDeleteButton", true);
                var createRowEvent = $A.get("e.Framework:LicenseRowActionEvent");
                createRowEvent.setParams({
                    action: "create",
                    group: component.get('v.group')
                });
                createRowEvent.fire();
            }
        }
    },
    "deleteRow" : function(component) {
        var deleteRowEvent = $A.get("e.Framework:LicenseRowActionEvent");
        deleteRowEvent.setParams({
            action : "delete",
            group: component.get('v.group')
        });
        deleteRowEvent.fire();
    }
})