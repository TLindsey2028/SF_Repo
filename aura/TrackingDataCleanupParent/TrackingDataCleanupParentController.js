({
    handleTrackingDataCleanupRecordCountEvent : function(component, event, helper) {
        var recordCount = event.getParam("recordCount");
        if ($A.util.isUndefined(recordCount) || $A.util.isEmpty(recordCount)) {
            console.error('recordCount missing from RecordCountEvent');
            return;
        }
        component.set("v.parentRecordCount", recordCount);
    }
})