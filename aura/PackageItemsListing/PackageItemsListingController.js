({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    newPackageItem : function (component) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:Package",
            componentAttributes: {parentItemId : component.get('v.recordId')},
            isredirect : true
        });
        evt.fire();
    },
    editPackageItem : function (component,event) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:Package",
            componentAttributes: {parentItemId : component.get('v.recordId'),packageId : event.currentTarget.dataset.recordid},
            isredirect : true
        });
        evt.fire();
    }
})