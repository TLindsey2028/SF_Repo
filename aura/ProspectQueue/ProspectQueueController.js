({
    myAction : function(component, event, helper) {
        component.set("v.PMs", '');
        // get the current user
        var action2 = component.get("c.getUserName");
        action2.setCallback(this, function(data) {
            component.set("v.username", data.getReturnValue());
            var u = component.get("v.username");
            
            // get all the owners in the queue
            var action3 = component.get("c.getOwners");
            action3.setCallback(this, function(data) {
                component.set("v.owners", data.getReturnValue());
		        // set owner listbox to current user
                var cmp = component.find('owner');
                cmp.set('v.value', u);
            });
            $A.enqueueAction(action3);
                        
            // get the users Propsect Queue Role
            var action5 = component.get("c.getRole");
            action5.setParams({
                "ownerFilter": u
            });
            action5.setCallback(this, function(data) {
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
                
                // get the initial status
                var action4 = component.get("c.getInitialStatus");
                action4.setParams({
                    "ownerFilter": u,
                  	"roleFilter": r,
                });
                action4.setCallback(this, function(data) {
                    component.set("v.initialStatus", data.getReturnValue());
                    var s = component.get("v.initialStatus");
                    component.set("v.status", s);
                    // set status listbox to inital status
                    var cmp = component.find('status');
                    cmp.set('v.value', s);
                    
                    // load up the prospect queue with users prospects
                    var action1 = component.get("c.getProspectQueue");
                    action1.setParams({
                        "stageFilter": s,
                        "ownerFilter": u
                    });
                    action1.setCallback(this, function(data) {
                        component.set("v.prospects", data.getReturnValue());
                    });
                    $A.enqueueAction(action1);
                });
                $A.enqueueAction(action4);
            });
            $A.enqueueAction(action5);
        });
        $A.enqueueAction(action2);
    }, 
    updateProspectList : function(component, event, helper) {
        var status = component.find("status").get("v.value");
        component.set("v.status", status);
        if (status == 'Needs Research' || status == 'Needs Manager') {
            var cmp = component.find('owner');
            cmp.set('v.value', '--None--');
        }
        helper.doUpdateProspectList(component);
    },
    updateProspectList2 : function(component, event, helper) {
        helper.doUpdateProspectList(component);
    },
    showDetails: function(component, event, helper) {
        var whichOne = event.target.id;
        console.log(whichOne);
        component.set("v.accountid", whichOne);
        
        var action1 = component.get("c.getAccountInfo");
        action1.setParams({
            "accountId": component.get("v.accountid")
        });
        action1.setCallback(this, function(data) {
            component.set("v.accountinfo", data.getReturnValue());
        });
        $A.enqueueAction(action1);
        
        var action = component.get("c.getProspectInfo");
        action.setParams({
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        var action2 = component.get("c.getIsRecommended");
        action2.setParams({
            "ownerFilter": component.get("v.username"),
            "accountId": component.get("v.accountid")
        });
		action2.setCallback(this, function(data) {
            component.set("v.isRecommended", data.getReturnValue());
        });
        $A.enqueueAction(action2);
    },
    DeclineRecommendation: function(component, event, helper) {
        var action = component.get("c.getDeclineRecommendation");
        action.setParams({
            "ownerFilter": component.get("v.username"),
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.isRecommended", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.doUpdateProspectList(component);
    },
    ActionClaim4Research: function(component, event, helper) {
        var action = component.get("c.getClaim4Research");
        action.setParams({
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.doUpdateProspectList(component);
    },
    ActionClaimProspect: function(component, event, helper) {
        var action = component.get("c.getClaimProspect");
        action.setParams({
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.doUpdateProspectList(component, event, helper);
    },
    ActionResearchComplete: function(component, event, helper) {
        // Get Prsopect Managers
        var p = component.get("v.PMs");
        if (p == '') {
            var action = component.get("c.getPMs");
            action.setCallback(this, function(data) {
                component.set("v.PMs", data.getReturnValue());
                p = component.get("v.PMs");
                var size = p.length;
                var select = document.getElementById("pmselect");
        		for (var i = 0; i < size; i++) {
                    var opt = document.createElement("option");
                    opt.value= p[i];
                    opt.innerHTML = p[i]; 
                    select.appendChild(opt);
                }
                
                // get Prospect Management Groups
                var action2 = component.get("c.getGroups");
                action2.setCallback(this, function(data) {
                    component.set("v.PMgroups", data.getReturnValue());
                    p = component.get("v.PMgroups");
                    size = p.length;
                    select = document.getElementById("groupselect");
                    for (var i = 0; i < size; i++) {
                        var opt = document.createElement("option");
                        opt.value= p[i];
                        opt.innerHTML = p[i]; 
                        select.appendChild(opt);
                    }
                    
                    helper.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
                    //helper.showPopupHelper(component, 'backdrop', 'slds-backdrop--');
    
                });
                $A.enqueueAction(action2);
            });
            $A.enqueueAction(action);
        }
        else {
        	helper.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
            //helper.showPopupHelper(component, 'backdrop', 'slds-backdrop--');
        }

        helper.doUpdateProspectList(component);
    },
    savePopup: function(component, event, helper) {
        helper.saveRecommendedPMs(component);
        helper.saveRecommendedGroups(component);

        var action = component.get("c.getResearchComplete");
        action.setParams({
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
		//helper.hidePopupHelper(component, 'backdrop', 'slds-backdrop--');
    },
    hidePopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
		//helper.hidePopupHelper(component, 'backdrop', 'slds-backdrop--');
    },
    ActionDisqualified: function(component, event, helper) {
        helper.showPopupHelper(component, 'disqualifieddialog', 'slds-fade-in-');
                    
        /*var action = component.get("c.getDisqualified");
        action.setParams({
            "accountId": component.get("v.accountid")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.doUpdateProspectList(component);*/
    },
    saveDisqualified: function(component, event, helper) {
        var action = component.get("c.getDisqualified");
        action.setParams({
            "accountId": component.get("v.accountid"),
            "reason": component.get("v.reason")
        });
        action.setCallback(this, function(data) {
            component.set("v.prospectinfo", data.getReturnValue());
        });
        $A.enqueueAction(action);
        
        helper.doUpdateProspectList(component);
    
        helper.hidePopupHelper(component, 'disqualifieddialog', 'slds-fade-in-');
	    component.set("v.reason", "");
    },
    hideDisqualifedPopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'disqualifieddialog', 'slds-fade-in-');
	    component.set("v.reason", "");
    }
})