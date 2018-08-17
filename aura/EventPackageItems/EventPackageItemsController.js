({
    doInit: function (cmp, event, helper) {
        var hashEvent = $A.get("e.LTE:HashChangingEvent");
        hashEvent.setParams({hash: "rp-recommended"});
        hashEvent.fire();

        helper.doInit(cmp);
        helper.loadSlider(cmp);
    },
    openItemModal: function (cmp, event, helper) {
        helper.openItemModal(cmp);
    },
    handleSalesOrderLineDeletedEvent : function(component,event,helper) {
        if (!$A.util.isEmpty(event.getParam('so'))) {
            component.set('v.salesOrderObj', event.getParam('so'));
        }
    },
    closeItemModal: function (cmp, event, helper) {
        helper.closeItemModal(cmp);
    },
    purchase : function (component,event,helper){
        helper.purchase(component);
    },
    addToCart: function(cmp, event, helper) {
        helper.addToCart(cmp, event.currentTarget.dataset.id, event.currentTarget.dataset.itemid);
    },
    handleFieldUpdateEvent: function (cmp, event, helper) {
        if (event.getParam('fieldId') === 'attendeePicklist') {
            var solId = event.getParam('value');
            if (solId && solId.length > 0) {
                cmp.set('v.lastNonBlankSOL', solId);
            }
            helper.filterItems(cmp, solId, true);
        }
    },
    next: function(cmp, event, helper) {
        helper.next(cmp);
    },
    prev: function(cmp, event, helper) {
        helper.prev(cmp);
    },
    openCancelModal : function(component) {
        component.find('cancelPrompt').showModal();
    },
    fireCancelRegEvent : function(component) {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
    handleRequiredPackageItemClassEvent : function(cmp, event, helper) {
        if (!$A.util.isEmpty(event.getParam('soObj'))) {
            cmp.set('v.salesOrderObj', event.getParam('soObj'));
            helper.setRequiredItemClassNames(cmp);
        }
    }
})