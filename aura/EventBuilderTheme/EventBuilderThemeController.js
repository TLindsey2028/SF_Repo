({
    doInit: function(component, event, helper) {
        helper.createBannerAndThumbnailComponent(component);
        helper.createEventLookup(component);
        if (component.get('v.eventObj.style') !== 'Lightning Event') {
            $A.util.removeClass(component.find('images'),'slds-hide');
            $A.util.addClass(component.find('images'),'slds-show');
            $A.util.addClass(component.find('imagesLabel'),'slds-active');
        }
    },
    handleFieldUpdateEvent: function(component, event, helper) {
        var fieldId = event.getParam('fieldId');
        if (fieldId === 'eventCloneThemeId') {
            var val = component.find('eventCloneThemeId').get('v.value');
            if (!$A.util.isEmpty(val.eventCloneThemeId)) {
                component.find('themeFieldsBtn').set('v.disable', false);
            } else {
                component.find('themeFieldsBtn').set('v.disable', true);
            }
        }
    },
    cloneThemeFields : function (component, event, helper) {
        var val = component.find('eventCloneThemeId').get('v.value');
        if (!$A.util.isEmpty(val.eventCloneThemeId)) {
            helper.updateThemeFields(component, val.eventCloneThemeId);
        }
    },
    changeTab: function (component, event, helper) {
        helper.showTabTab(component, event);
    },
    validateTheme : function(component,event,helper) {
        var isValid = true;
        try {
            if (!helper.validateForm(component.get('v.eventObj'), component)) {
                isValid = false;
            }
            component.set('v.validated', isValid);
        }
        catch (err) {
            component.set('v.validated', isValid);
        }
    },
    handleFileUploadCropEvent: function (component, event) {
        if (event.getParam('fieldId') === 'bannerImageUrl' || event.getParam('fieldId') === 'thumbnailImageUrl' || event.getParam('fieldId') === 'logoImage' )  {
            if (event.getParam('action') === 'open') {
                var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                compEvent.setParams({
                    operation: 'add',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent.fire();
            }
            else {
                var compEvent2 = $A.get('e.EventApi:AddSelectorEvent');
                compEvent2.setParams({
                    operation: 'remove',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent2.fire();
            }
        }
    }
})