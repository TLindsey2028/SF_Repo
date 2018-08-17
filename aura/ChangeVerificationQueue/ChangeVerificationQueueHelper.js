({
	getChangesList : function(component) {
        var action = component.get("c.getSoftEdits");
        action.setCallback(this, function(data) {
            component.set("v.changes", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
	getChangeSet : function(component) {
        var cn = component.get("v.currentChangeNumber");
        var action = component.get("c.getChangesSet");
        action.setParams({
            "changeNumber": cn
        });
        action.setCallback(this, function(data) {
            component.set("v.changeSet", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
	doDoUndo : function(component, whichOne) {
        var cn = component.get("v.currentChangeNumber");
        var changes = component.get("v.changes");
        var refId = changes.Id;
        var action = component.get("c.getUndoChanges");
        action.setParams({
            "changeNumber": cn
        });
        action.setCallback(this, function(data) {
            var error = data.getReturnValue();
            if (error != '') {
				if (error == null)
            	    component.set("v.errorMessage",'An error occurred.  Please skip this record.');
                else
            	    component.set("v.errorMessage", error);
                this.showPopupHelper(component, 'modalErrorMessage', 'slds-fade-in-');
           	}
            else {
                this.getChangesList(component);
                
                var action = component.get("c.getChangesSummary");
                action.setParams({
                    "refId": refId
                });
                action.setCallback(this, function(data) {
                    component.set("v.changeSummary", data.getReturnValue());
                    var c = component.get("v.changeSummary");
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
                    	this.getChangesList(component);
                    	component.set("v.changeIndex", -1);
                	}
                });
                $A.enqueueAction(action);
            }
        });
        $A.enqueueAction(action);
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
    }
})