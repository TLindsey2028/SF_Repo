({
	myAction : function(component, event, helper) {
        component.set("v.status", "");
        component.set("v.maxBatchSize", 50);
        component.set("v.currentSort", "");
        helper.getWriteOffs(component, event);
    },
    
    sortItems : function(component, event, helper) {
        var sort = event.target.id;
        var s = component.get("v.currentSort");
        var o = component.get("v.currentOrder");
        if (s == sort && o == "") {
            component.set("v.currentOrder", "DESC");            
        }
        else 
            component.set("v.currentOrder", "");
        component.set("v.currentSort", sort);
        helper.getWriteOffs(component);    
    },
    
    editItem: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = event.target.id.split('^');
        component.set("v.currentEditObj", split[1]);
        $A.get('e.force:editRecord').setParams({ recordId: split[0] }).fire();
    },
    
    Refresh: function(component, event, helper) {
    	component.set("v.status", "");
        helper.getWriteOffs(component); 
    },
    
    confirmDeleteItem: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = whichOne.split('^');
        component.set("v.currentItemId", split[0]);
        component.set("v.currentAccountName", split[1]);
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteItem: function(component, event, helper) {
        var action = component.get("c.getDeleteItem");
        action.setParams({
            "itemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getWriteOffs(component);  
        });
        $A.enqueueAction(action);
    },
    
    hideConfirmDeletePopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    }, 
    
    verify: function(component, event, helper) {    
        component.set("v.status", "Verifying");
        var action = component.get("c.getVerify");
        action.setCallback(this, function(data) {
            if (data.getReturnValue() == 'VERIFIED') {
            	component.set("v.status", "Verified");
                helper.getWriteOffs(component);  
            }
            else if (data.getReturnValue() == 'NOT VERIFIED') {
                component.set("v.status", "");
               	helper.getWriteOffs(component);  
            }
            else {
                component.set("v.status", "");
                helper.showError(component, data.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }, 
    
    process: function(component, event, helper) {
        var today = new Date();
        var fdate = (today.getMonth() + 1) + "/";  
        fdate += today.getDate() + "/";  
        fdate += today.getFullYear();  
        component.set("v.newTrans.AQB__DonorDate__c", fdate);
        helper.showPopupHelper(component, 'confirmStartDialog', 'slds-fade-in-');
    }, 
    
    processWriteOffs: function(component, event, helper) {
        var action = component.get("c.getStartBatchWriteOff");
        action.setParams({
            "trans": component.get("v.newTrans")
        });
        action.setCallback(this, function(data) {  
            helper.hidePopupHelper(component, 'confirmStartDialog', 'slds-fade-in-');
            if (data.getReturnValue() == 'started') {
                component.set("v.status", 'Processing');
            	helper.getWriteOffs(component);  
            }
            else {
                component.set("v.status", "");
                helper.showError(component, data.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }, 
    
    hideConfirmStartPopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'confirmStartDialog', 'slds-fade-in-');
    }, 
    
    hideErrorPopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'errorDialog', 'slds-fade-in-');
    }
})