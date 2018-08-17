({
    doInit : function(component) {
        var recordId = component.get('v.recordId');
        if (!$A.util.isEmpty(recordId)) {
            if (recordId.startsWith('005')) {
                recordId = null;
            }
        }
        var action = component.get('c.getEventSObj');
        action.setParams({eventId : recordId});
        action.setCallback(this,function(result){
                var returnObj = result.getReturnValue();
                returnObj.eventId = recordId;
                returnObj.eventObj = JSON.parse(returnObj.eventObj);
            var evt = $A.get("e.force:navigateToComponent");
                evt.setParams({
                    componentDef: "EventApi:EventBuilderWrapper",
                    componentAttributes: returnObj
                });
                evt.fire();
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})