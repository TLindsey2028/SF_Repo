({
    doInit : function(component,event,helper) {
        if (!component.get('v.showLoading')) {
            helper.buildItem(component);
        }
        helper.showBottomMargin(component);
    },
    handleItemInsertedEvent : function(component,event,helper) {
        if (event.getParam('uniqueIdentifier') === component.get('v.groupName')) {
            component.set('v.itemObj',event.getParam('orderItem'));
            helper.buildItem(component);
            helper.showBottomMargin(component);
        }
    },
    expandCard : function (component) {
        var card = component.find('itemCard');
        var icon = component.find('chevronDown');
        var wrapper = component.find('itemCardWrapper');
        $A .util.toggleClass(card,'slds-frame--expand slds-frame--expanded');
        $A.util.toggleClass(icon,'slds-rotate slds-rotate__180');
        $A.util.toggleClass(wrapper,'slds-p-bottom--none');
    },
    removeItemClick : function(component,event,helper) {
        helper.removeItemClick(component);
    },
    showItem : function(component) {
        window.open(
            '/'+component.get('v.itemObj').itemId,
            '_blank'
        );
    },
    handleItemUpdateEvent : function(component,event,helper) {
        helper.handleItemUpdateEvent(component,event);
    },
    handleItemCompleteEvent : function(component,event,helper) {
        helper.handleItemCompleteEvent(component,event);
    },
    handleItemDisableRemoveEvent : function(component) {
        $A.util.addClass(component.find('removeItemLink'),'hidden');
    }
})