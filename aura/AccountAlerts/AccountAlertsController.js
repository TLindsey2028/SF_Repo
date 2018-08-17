({
    myAction : function(component, event, helper) {
        var action1 = component.get("c.getAccountInfo");
        action1.setParams({
            "accountId": component.get("v.recordId")
        });
        action1.setCallback(this, function(data) {
            component.set("v.accountinfo", data.getReturnValue());
            var a = component.get("v.accountinfo");
            if (a.AQB__Alert__c != null) {
                helper.showPopupHelper(component, 'alertPopup', 'slds-fade-in-');
            }
            var action2 = component.get("c.getProspectInfo");
            action2.setParams({
                "accountId": component.get("v.recordId")
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