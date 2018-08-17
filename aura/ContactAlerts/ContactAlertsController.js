({
    myAction : function(component, event, helper) {
        var action1 = component.get("c.getContactInfo");
        action1.setParams({
            "contactId": component.get("v.recordId")
        });
        action1.setCallback(this, function(data) {
            component.set("v.contactinfo", data.getReturnValue());
            var c = component.get("v.contactinfo");
            if (c.AQB__Alert__c != null)
            	helper.showPopupHelper(component, 'alertPopup', 'slds-fade-in-');
            
            var action2 = component.get("c.getProspectInfo");
            action2.setParams({
                "accountId": c.AccountId
            });
            action2.setCallback(this, function(data) {
                component.set("v.prospectinfo", data.getReturnValue());
            });
            $A.enqueueAction(action2);

        });
        $A.enqueueAction(action1);
    },
    hideAlertPopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'alertPopup', 'slds-fade-in-');
    }
})