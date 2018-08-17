({
    updateTransactions: function(component) {
        var b = component.get("v.batchItem");
        b.AQB__ChartOfAccounts__r = null;
        b.AQB__ChartOfAccounts2__r = null;
        b.AQB__ChartOfAccounts3__r = null;
        b.AQB__ChartOfAccounts4__r = null;
        b.AQB__ChartOfAccounts5__r = null;
        var action = component.get("c.getSaveTransactions");
        action.setParams({
            "batchItem": b
        });
        $A.enqueueAction(action);        
    },

    closeTransactionsPopup : function(component) {
    	var closeEvent = component.getEvent("closeTransactionsPopup");
       	closeEvent.setParams({ "refresh" : component.get("v.refresh") });
        closeEvent.fire();
        component.destroy();
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