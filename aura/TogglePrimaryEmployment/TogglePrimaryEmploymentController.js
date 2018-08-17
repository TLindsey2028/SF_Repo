({
	 myAction : function(component, event, helper) {
        // get the employment record
        var action = component.get("c.getEmployment");
        action.setParams({
            "employmentId": component.get("v.recordId")
        });
		action.setCallback(this, function(data) {
            component.set("v.employmentInfo", data.getReturnValue());
            var p = component.get("v.employmentInfo.AQB__IsPrimaryEmployer__c");
            if (p == "NO")
                component.set("v.isPrimary", false);
            else
                component.set("v.isPrimary", true);
        });
        $A.enqueueAction(action);		
	},
    
    setPrimary : function(component, event, helper) {
        // toggle the employment record as the primary
        var action = component.get("c.getSetPrimaryEmployment");
        action.setParams({
            "contactId": component.get("v.employmentInfo.AQB__Contact__c"),
            "employmentId": component.get("v.recordId"), 
            "isPrimaryEmployer": component.get("v.employmentInfo.AQB__IsPrimaryEmployer__c"), 
            "businessPhone": component.get("v.employmentInfo.AQB__BusinessPhone__c"), 
            "title": component.get("v.employmentInfo.AQB__Title__c")
        });
		action.setCallback(this, function(data) {
            if (data.getReturnValue() != '')
                alert(data.getReturnValue());
            else {
                var p = component.get("v.isPrimary");  
                if (p) {
                	component.set("v.isPrimary", false); 
                    component.set("v.employmentInfo.AQB__IsPrimaryEmployer__c", "NO");
                }
                else {
                	component.set("v.isPrimary", true);  
                    component.set("v.employmentInfo.AQB__IsPrimaryEmployer__c", "YES");
                }
                $A.get('e.force:refreshView').fire();
            }
        });
        $A.enqueueAction(action);		
	}
    
})