({
	myAction : function(component, event, helper) {
        // check user security
        var action = component.get("c.getSecurity");
        action.setCallback(this, function(data) {
            component.set("v.access", data.getReturnValue());
            var a = component.get("v.access");
            if (a == 'Yes')
            	// get the current changes
           	 	helper.getChangesList(component);
        });
        $A.enqueueAction(action);
    },
    
    showDetails: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = whichOne.split('^');
        component.set("v.acId", split[0]);
        component.set("v.acName", split[1]);
        var action = component.get("c.getChangesSummary");
        action.setParams({
            "refId": split[0]
        });
        action.setCallback(this, function(data) {
            component.set("v.changeSummary", data.getReturnValue());
            var c = component.get("v.changeSummary");
            component.set("v.totalChanges", c.length);
            component.set("v.changeIndex", 0);
            component.set("v.currentChangeNumber", c[0].cnum);
            component.set("v.objectName", c[0].object);
            component.set("v.changeType", c[0].action)
            component.set("v.changeOwner", c[0].owner);
            component.set("v.changeDate", c[0].date)
            helper.getChangeSet(component);
        });
        $A.enqueueAction(action);
    },
    skip: function(component, event, helper) {
        var whichOne = event.target.id;
        var t = component.get("v.totalChanges");
        if (Number(whichOne) + 1 < Number(component.get("v.totalChanges"))) {
            whichOne++;
        	var c = component.get("v.changeSummary");
            component.set("v.changeIndex", whichOne);
            component.set("v.currentChangeNumber", c[whichOne].cnum);
            component.set("v.objectName", c[whichOne].object);
            component.set("v.changeType", c[whichOne].action)
            component.set("v.changeOwner", c[whichOne].owner);
            component.set("v.changeDate", c[whichOne].date)
            helper.getChangeSet(component);
        }
        else {
            component.set("v.changeIndex", -1);
        }
    },
    acceptChange: function(component, event, helper) {
        var whichOne = event.target.id;
        var cn = component.get("v.currentChangeNumber");
        var action = component.get("c.getAcceptChanges");
        action.setParams({
            "changeNumber": cn
        });
        action.setCallback(this, function(data) {
            var c = component.get("v.changeSummary");
            c.splice(whichOne, 1);
            component.set("v.changeSummary", c);
            component.set("v.totalChanges", c.length);
            if (Number(whichOne) < c.length) {
                component.set("v.changeIndex", whichOne);
                component.set("v.currentChangeNumber", c[whichOne].cnum);
                component.set("v.objectName", c[whichOne].object);
                component.set("v.changeType", c[whichOne].action)
                component.set("v.changeOwner", c[whichOne].owner);
                component.set("v.changeDate", c[whichOne].date)
                helper.getChangeSet(component);
            }
            else 
                component.set("v.changeIndex", -1);
            helper.getChangesList(component);
        });
        $A.enqueueAction(action);
    },
    undoChange: function(component, event, helper) {
        var whichOne = event.target.id;	
        var action = component.get("v.changeType");
        var object = component.get("v.objectName");
        if (action == 'Insert' && (object == 'Account' || object == 'Contact')) {
            helper.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
        }
        else {
            helper.doDoUndo(component, whichOne);
        }
    },
    updateChange: function(component, event, helper) {
        var c = component.get("v.changeSet");
        var ids = [];
        for (var i = 0; i < c.length; i++) {
            if (document.getElementById(c[i].Id).checked) {
                ids[i] = c[i].Id
            }
        }
        var whichOne = event.target.id;
        var action = component.get("c.getUpdateChanges");
        action.setParams({
            "Ids": ids
        });
        action.setCallback(this, function(data) {
            var error = data.getReturnValue();
            if (error != '') {
                if (error == null)
            	    component.set("v.errorMessage",'An error occurred.  Please skip this record.');
                else
            	    component.set("v.errorMessage", error);
                helper.showPopupHelper(component, 'modaldialog', 'slds-fade-in-');
            }
            else {
                var c = component.get("v.changeSummary");
                c.splice(whichOne, 1);
                component.set("v.changeSummary", c);
                component.set("v.totalChanges", c.length);
                if (Number(whichOne) < c.length) {
                    component.set("v.changeIndex", whichOne);
                    component.set("v.currentChangeNumber", c[whichOne].cnum);
                    component.set("v.objectName", c[whichOne].object);
                    component.set("v.changeType", c[whichOne].action)
                    component.set("v.changeOwner", c[whichOne].owner);
                    component.set("v.changeDate", c[whichOne].date)
                    helper.getChangeSet(component);
                }
                else {
                    helper.getChangesList(component);
                    component.set("v.changeIndex", -1);
                }
            }
        });
        $A.enqueueAction(action);
    },
    confirmDelete: function(component, event, helper) {
    	helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
		helper.doDoUndo(component, component.get("v.changeIndex"));
    },
    cancelDelete: function(component, event, helper) {
        helper.hidePopupHelper(component, 'modaldialog', 'slds-fade-in-');
	},
    confirmErrorMessage: function(component, event, helper) {
    	helper.hidePopupHelper(component, 'modalErrorMessage', 'slds-fade-in-');
	}
    
})