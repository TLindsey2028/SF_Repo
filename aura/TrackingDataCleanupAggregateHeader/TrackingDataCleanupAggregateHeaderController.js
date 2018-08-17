({
    doInit: function(component, event, helper) {
        component.set("v.showSpinner", true);
        //create the action
        var action = component.get("c.getExpiredAggregateDataCounts");

        //add callback behavior for when the response is received
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var aggregateCounts = response.getReturnValue();
                component.set("v.totalSendDefinitions", aggregateCounts.sendDefinitionCount);
                component.set("v.totalIndividualEmailResults", aggregateCounts.individualEmailResultCount);
                component.set("v.totalAggregateLinkDetails", aggregateCounts.aggregateLinkCount);
                component.set("v.totalIndividualLinkDetails", aggregateCounts.individualLinkCount);
                
                var event = component.getEvent("TrackingDataCleanupRecordCountEvent");
                event.setParam("recordCount", aggregateCounts.sendDefinitionCount);
                event.fire();
            }
            else {
                console.error("Failed with state: " + state);
            }
            component.set("v.showSpinner", false);
        });

        //send action off to be executed
        $A.enqueueAction(action);
    }
})