({
    doUpdateProspectList : function(component) {
        var status = component.find("status").get("v.value");
        var owner = component.find("owner").get("v.value");
            
        if (status == 'Declined Recommendations') {
            var action = component.get("c.getDeclined");
            action.setParams({
                "ownerFilter": owner
            });
            action.setCallback(this, function(data) {
                component.set("v.declinedProspects", data.getReturnValue());
            });
            $A.enqueueAction(action);
        }
        else {
            var action = component.get("c.getProspectQueue");
            action.setParams({
                "stageFilter": status,
                "ownerFilter": owner
            });
            action.setCallback(this, function(data) {
                component.set("v.prospects", data.getReturnValue());
            });
            $A.enqueueAction(action);
        }
    },
    showPopupHelper : function(component, componentId, className) { 
        var modal = component.find(componentId); 
        $A.util.removeClass(modal, className + 'hide'); 
        $A.util.addClass(modal, className + 'open'); 
    },
    hidePopupHelper : function(component, componentId, className) { 
        var modal = component.find(componentId); 
        $A.util.addClass(modal, className + 'hide'); 
        $A.util.removeClass(modal, className + 'open'); 
    },
    saveRecommendedPMs : function(component) {
        var select = document.getElementById("pmselect");
        var options = select && select.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                var action = component.get("c.getSaveRecommendation");
                action.setParams({
                    "accountId": component.get("v.accountid"),
                    "prospectQ": component.get("v.prospectinfo.Id"),
                    "recommendTo": options[i].value
                });
                $A.enqueueAction(action);
            }
        }
    },
    saveRecommendedGroups : function(component) {
        var select = document.getElementById("groupselect");
        var options = select && select.options;
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                var action = component.get("c.getSaveGroupRecommendation");
                action.setParams({
                    "accountId": component.get("v.accountid"),
                    "prospectQ": component.get("v.prospectinfo.Id"),
                    "recommendTo": options[i].value
                });
                $A.enqueueAction(action);
            }
        }
    }

})