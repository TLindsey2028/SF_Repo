({
    getWriteOffs : function(component) {
        var action = component.get("c.getWriteOffs");
        action.setParams({
            "sortBy": component.get("v.currentSort"),
            "sortOrder": component.get("v.currentOrder")
        });
        action.setCallback(this, function(data) {
            component.set("v.items", data.getReturnValue());
            var b = false;
            var m = component.get("v.items");
            component.set("v.currentItemCount", m.length);
        });
        $A.enqueueAction(action);
    },
    
    showError: function(component, errMsg) {
        component.set("v.errorMessage", errMsg);
        this.showPopupHelper(component, 'errorDialog', 'slds-fade-in-');
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