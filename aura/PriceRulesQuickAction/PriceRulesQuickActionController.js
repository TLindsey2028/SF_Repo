({
    doInit : function(component) {
        var action = component.get('c.getPriceRules');
        action.setParams({sObjId : component.get('v.recordId'),forceCreatePriceRule : false});
        action.setCallback(this,function(result){
            var parameters = {};
            var resultObj = result.getReturnValue();
            debugger;
            parameters.sObjId = component.get('v.recordId');
            if (!$A.util.isEmpty(resultObj)) {
                parameters.dateFormat = resultObj[0].dateFormat;
                parameters.preLoadedPriceRules = resultObj;
            }
            var evt = $A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef: "OrderApi:PriceRules",
                componentAttributes: parameters,
                isredirect : true
            });
            evt.fire();
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})