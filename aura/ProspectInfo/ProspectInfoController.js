({
    myAction : function(component, event, helper) {
        // get the users Propsect Queue Role
        var action = component.get("c.getRole");
        action.setCallback(this, function(data) {
            component.set("v.pmRole", data.getReturnValue());
            var r = component.get("v.pmRole");
            if (r == 'Researcher' || r == 'Researcher & Prospect Manager')
                component.set("v.isResearcher", true);
            else
                component.set("v.isResearcher", false);
            if (r == 'Prospect Manager' || r == 'Researcher & Prospect Manager')
                component.set("v.isManager", true);
            else
                component.set("v.isManager", false);
        });
        $A.enqueueAction(action);

		var action2 = component.get("c.getIsRecommended");
        action2.setParams({
            "accountId": component.get("v.recordId")
        });
		action2.setCallback(this, function(data) {
            component.set("v.isRecommended", data.getReturnValue());
        });
        $A.enqueueAction(action2);		
        
        var action3 = component.get("c.getProspectInfo");
        action3.setParams({
            "accountId": component.get("v.recordId")
        });
		action3.setCallback(this, function(data) {
			component.set("v.prospectinfo", data.getReturnValue());
		});
		$A.enqueueAction(action3);
        
		var action4 = component.get("c.getAccountInfo");
        action4.setParams({
            "accountId": component.get("v.recordId")
        });
		action4.setCallback(this, function(data) {
			component.set("v.accountinfo", data.getReturnValue());
		});
		$A.enqueueAction(action4);
	},
    ActionAddProspect : function(component, event, helper) {
 		var action = component.get("c.getAddedProspect");
        action.setParams({
            "accountId": component.get("v.recordId")
        });
		action.setCallback(this, function(data) {
			component.set("v.prospectinfo", data.getReturnValue());
		});
		$A.enqueueAction(action);
	},
    ActionClaim4Research: function(component, event, helper) {
        var action = component.get("c.getClaim4Research");
        action.setParams({
            "accountId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    ActionResearchComplete: function(component, event, helper) {
        var action = component.get("c.getResearchComplete");
        action.setParams({
            "accountId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    ActionDisqualified: function(component, event, helper) {
        var action = component.get("c.getDisqualified");
        action.setParams({
            "accountId": component.get("v.recordId")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },    
    ActionClaimProspect : function(component, event, helper) {
 		var action = component.get("c.getClaimProspect");
        action.setParams({
            "accountId": component.get("v.recordId")
        });
		action.setCallback(this, function(data) {
			component.set("v.prospectinfo", data.getReturnValue());
		});
		$A.enqueueAction(action);
	}
})