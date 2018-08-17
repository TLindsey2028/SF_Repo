({
    doInit : function(component) {
        var action = component.get('c.getBadgeData');
        action.setParams({sObjId : component.get('v.recordId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'SUCCESS') {
                var resultObj = JSON.parse(result.getReturnValue());
                var parameters = {};
                parameters.sObjId = component.get('v.recordId');
                parameters.objectInformation = resultObj;
                var evt = $A.get("e.force:navigateToComponent");
                evt.setParams({
                    componentDef: "OrderApi:AccessPermission",
                    componentAttributes: parameters,
                    isredirect : true
                });
                evt.fire();
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})