({
	 myAction : function(component, event, helper) {
        // get the education record
        var action = component.get("c.getEducation");
        action.setParams({
            "educationId": component.get("v.recordId")
        });
		action.setCallback(this, function(data) {
            component.set("v.educationInfo", data.getReturnValue());
            var p = component.get("v.educationInfo.AQB__IsPrimaryDegree__c");
            if (p == "NO")
                component.set("v.isPrimary", false);
            else
                component.set("v.isPrimary", true);
        });
        $A.enqueueAction(action);		
	},
    
    setPrimary : function(component, event, helper) {
        // set the education record as the primary
        var action = component.get("c.getSetPrimaryEducation");
        action.setParams({
            "contactId": component.get("v.educationInfo.AQB__Contact__c"),
            "educationId": component.get("v.recordId")
        });
		action.setCallback(this, function(data) {
            if (data.getReturnValue() != '')
                alert(data.getReturnValue());
            else {
                component.set("v.isPrimary", true);      
                $A.get('e.force:refreshView').fire();
            }
        });
        $A.enqueueAction(action);		
	}
    
})