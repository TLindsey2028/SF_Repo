({
    doInit : function (component,event,helper) {
        helper.doInit(component,false,false);
    },
    showModal : function (component,event,helper) {
        component.set('v.existingBadges',true);
        helper.doInit(component,true,true);
    },
    addNewBadge : function (component) {
        component.set('v.existingBadges',false);
    },
    backToBadges : function (component,event,helper) {
        component.set('v.existingBadges',true);
        helper.doInit(component,false,true);
    },
    saveBadgeType : function (component,event,helper) {
        helper.createBadgeType(component);
    },
    createBadgeWorkflows : function (component,event,helper) {
        helper.createBadgeWorkflows(component);
    },
    closeModal : function(component,event,helper) {
        component.set('v.existingBadges',true);
        helper.closeModal(component);
    },
    handleUIApiResponseEvent : function (component,event) {
        if (event.getParam('uniqueId') === component.get('v.uiApiUniqueId')) {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveAllFields(event.getParams(), component.get('v.uiApiUniqueId'),true);
            component.set('v.customFields', customFields);
        }
    },
})