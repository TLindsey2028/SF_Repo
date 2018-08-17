({
    doInit : function(component, event, helper) {
        helper.fireRegistrationProcessSetGlobalObjectsEvent(component);
        if ($A.util.isEmpty(component.get('v.tickets')) && !$A.util.isEmpty(component.get('v.eventObj'))) {
            helper.getTicketTypes(component, event);
        } else {
            helper.toggleLinesClearButton(component);
        }
    },
    editAssignment : function(component, event, helper) {
        helper.toggleProcessingChanges(component, 'remove');
        helper.editAssignment(component, event);
    },
    editItem : function(component, event, helper) {
        var dataset = event.currentTarget.dataset;
        helper.toggleProcessingChanges(component, 'remove');
        if (!$A.util.isEmpty(dataset.packageid)) {
            if ($A.util.isEmpty(component.get('v.subPlans'))) {
                helper.getSubPlans(component, dataset);
            } else {
                helper.editRecommendedItem(component, dataset);
            }
        } else if (!$A.util.isEmpty(dataset.itemid)) {
            helper.getSessionItemsWithForm(component, dataset);
            var sessEvent = $A.get('e.LTE:SessionSelectEvent');
            sessEvent.setParams({
                hasSOUpdated : true,
                so: _.cloneDeep(component.get('v.so'))
            });
            sessEvent.fire();

            var waitlistEntryCount = ($A.util.isEmpty(component.get('v.so').waitlistEntries)) ? 0 : component.get('v.so').waitlistEntries.length;
            var itemCount = component.get('v.so').numberOfLines + waitlistEntryCount;
            var shoppingCartItemCountEvent = $A.get('e.LTE:UpdateShoppingCartItemCountEvent');
            shoppingCartItemCountEvent.setParams({
                count : itemCount,
                itemId : component.get('v.so').itemIds
            });
            shoppingCartItemCountEvent.fire();
        }
    },
    handleKnownAddressesChangeEvent : function(component, event, helper) {
        helper.toggleProcessingChanges(component, 'remove');
        setTimeout($A.getCallback(function(){
            helper.toggleProcessingChanges(component, 'add');
        }),750);
        try {
            var wrapper = document.querySelector('[data-name="addressModalWrapper"] use');
            var attr = wrapper.getAttribute('href');
            if (attr) {
                wrapper.setAttribute('href',attr.replace(attr.substring(attr.indexOf('#')),'#close'));
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    removeItemLine : function(component, event, helper) {
        helper.removeLine(component, helper.itemObjtoDelete.id);
    },
    removeTicketLine : function(component, event, helper) {
        helper.removeLine(component, helper.ticketObjtoDelete.id);
    },
    removeWaitlistEntry : function(component, event, helper) {
        helper.removeWaitlistEntry(component, helper.waitlistObjtoDelete.id);
    },
    showTicketModal : function(component, event, helper) {
        helper.showTicketModal(component, event);
    },
    showItemModal : function(component, event, helper) {
        helper.showItemModal(component, event);
    },
    showWaitlistModal : function(component, event, helper) {
        helper.showWaitlistModal(component, event);
    },
    handleEventSummaryUpdateEvent : function(component, event, helper) {
        helper.handleEventSummaryUpdateEvent(component, event);
    },
    closeModal : function (component,event,helper) {
        component.find('ticketPrompt').hideModal();
        component.find('itemPrompt').hideModal();
        component.find('waitlistPrompt').hideModal();
        helper.fireDeleteButtonEvent();
    }
})