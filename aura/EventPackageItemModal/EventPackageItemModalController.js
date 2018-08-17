({
    openItemModal: function (cmp, event, helper) {
        helper.openItemModal(cmp, event);
    },
    closeItemModal: function (cmp, event, helper) {
        helper.closeItemModal(cmp);
    },
    purchase: function(cmp, event, helper) {
        helper.purchase(cmp, event);
    },
    handleFieldUpdateEvent: function(cmp, event, helper) {
        if (event.getParam('fieldId') === 'subPlanId') {
            helper.autoRenew(cmp, event.getParam('value'));
        }
    }
})