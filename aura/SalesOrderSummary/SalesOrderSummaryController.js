({
    doInit: function(component, event, helper ) {
        helper.constructItemLines(component);
    },
    handleSalesOrderUpdate : function(component, event, helper) {
        helper.handleSalesOrderUpdate(component, event);
    },
    applyDiscount : function(component, event, helper) {
        helper.applyDiscount(component);
    },
    handleDisableComponentEvent : function (component) {
        component.find('sourceCodeName').setOtherAttributes({'disabled' : true},false);
        component.find('discountButton').set('v.disable',true);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        helper.handleFieldUpdateEvent(component,event);
    },
    handleProcessingChangesEvent : function(component,event) {
        if (event.getParam('processingChanges')) {
            $A.util.removeClass(component.find('processingChanges'),'hidden');
        }
        else {
            $A.util.addClass(component.find('processingChanges'),'hidden');
        }
    }
})