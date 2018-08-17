({
	myAction : function(component, event, helper) {
        component.set("v.refresh", false);
		var t = component.get("v.batchItem");
        var num = 0;
        if (t.AQB__Amount__c != null) 
        	num++;
        if (t.AQB__Amount2__c != null) 
        	num++;
        if (t.AQB__Amount3__c != null) 
        	num++;
        if (t.AQB__Amount4__c != null) 
        	num++;
        if (t.AQB__Amount5__c != null) 
        	num++;
        component.set("v.numberOfTransactions", num);
    },
    
    confirmDelete: function(component, event, helper) {
       	var whichOne = event.target.id;
        component.set("v.currentTransaction", whichOne);
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },

    deleteTransaction: function(component, event, helper) {
        var b = component.get("v.batchItem");
        var transNum = component.get("v.currentTransaction");
        var n = 6 - Number(transNum);
        if (n == 5) {
            b.AQB__Amount__c = b.AQB__Amount2__c;
            b.AQB__CheckNumber__c = b.AQB__CheckNumber2__c;
            b.AQB__Reference__c = b.AQB__Reference2__c;
            b.AQB__ChartOfAccounts__c = b.AQB__ChartOfAccounts2__c;
            b.AQB__Description__c = b.AQB__Description2__c;
        }
        if (n >= 4) {
            b.AQB__Amount2__c = b.AQB__Amount3__c;
            b.AQB__CheckNumber2__c = b.AQB__CheckNumber3__c;
            b.AQB__Reference2__c = b.AQB__Reference3__c;
            b.AQB__ChartOfAccounts2__c = b.AQB__ChartOfAccounts3__c;
            b.AQB__Description2__c = b.AQB__Description3__c;
        }
        if (n >= 3) {
            b.AQB__Amount3__c = b.AQB__Amount4__c;
            b.AQB__CheckNumber3__c = b.AQB__CheckNumber4__c;
            b.AQB__Reference3__c = b.AQB__Reference4__c;
            b.AQB__ChartOfAccounts3__c = b.AQB__ChartOfAccounts4__c;
            b.AQB__Description3__c = b.AQB__Description4__c;
        }
        if (n >= 2) {
            b.AQB__Amount4__c = b.AQB__Amount5__c;
            b.AQB__CheckNumber4__c = b.AQB__CheckNumber5__c;
            b.AQB__Reference4__c = b.AQB__Reference5__c;
            b.AQB__ChartOfAccounts4__c = b.AQB__ChartOfAccounts5__c;
            b.AQB__Description4__c = b.AQB__Description5__c;
        }
        if (n >= 4) {
            b.AQB__Amount2__c = null;
            b.AQB__CheckNumber2__c = '';
            b.AQB__Reference2__c = '';
            b.AQB__ChartOfAccounts2__c = null;
            b.AQB__Description2__c = '';
        }
        if (n >= 3) {
            b.AQB__Amount3__c = null;
            b.AQB__CheckNumber3__c = '';
            b.AQB__Reference3__c = '';
            b.AQB__ChartOfAccounts3__c = null;
            b.AQB__Description3__c = '';
        }
        if (n >= 2) {
            b.AQB__Amount4__c = null;
            b.AQB__CheckNumber4__c = '';
            b.AQB__Reference4__c = '';
            b.AQB__ChartOfAccounts4__c = null;
            b.AQB__Description4__c = '';
        }
        b.AQB__Amount5__c = null;
        b.AQB__CheckNumber5__c = '';
        b.AQB__Reference5__c = '';
        b.AQB__ChartOfAccounts5__c = null;
        b.AQB__Description5__c = '';
        
        component.set("v.batchItem", b);
        helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    hideConfirmDeletePopup: function(component, event, helper) {
        helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    }, 
    
    saveTransactions: function(component, event, helper) {
        helper.updateTransactions(component);
        helper.closeTransactionsPopup(component);
    },
    
    closeTransactions : function(component, event, helper) {
    	helper.closeTransactionsPopup(component);
    }
})