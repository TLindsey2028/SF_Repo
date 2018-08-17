({
    doInit : function(component,event,helper) {
        if (!$A.util.isEmpty(component.get('v.recordId'))) {
            component.set('v.themeId',component.get('v.recordId'));
        }
        if ($A.util.isEmpty(component.get('v.themeObj.id'))) {
            helper.getExistingThemeObj(component);
        }
        else {
            helper.loadThemeObj(component);
        }

    },
    changeTab : function(component,event,helper) {
        helper.changeActiveTab(component,event.target.dataset.tabid);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        try {
            if (event.getParam('fieldId') === 'brandPrimary') {
                helper.changeStyleColor(component, 'themeBrandPrimaryPreview', component.get('v.themeObj').brandPrimary);
            }
            else if (event.getParam('fieldId') === 'brandSecondary') {
                helper.changeStyleColor(component, 'themeBrandSecondaryPreview', component.get('v.themeObj').brandSecondary);
            }
            else if (event.getParam('fieldId') === 'textColor') {
                helper.changeStyleColors(component, 'themeBodyTextPreview', component.get('v.themeObj').textColor);
            }
            else if (event.getParam('fieldId') === 'linkColor') {
                helper.changeStyleColors(component, 'themeBodyLinkPreview', component.get('v.themeObj').linkColor);
            }
            else if (event.getParam('fieldId') === 'bodyBackgroundColor') {
                helper.changeStyleColor(component, 'themeBodyBackgroundPreview', component.get('v.themeObj').bodyBackgroundColor);
            }
            else if (event.getParam('fieldId') === 'navbarBackgroundColor') {
                helper.changeStyleColor(component, 'themeNavbarBackgroundPreview', component.get('v.themeObj').navbarBackgroundColor);
            }
            else if (event.getParam('fieldId') === 'navbarLinkColor') {
                helper.changeStyleColors(component, 'themeNavbarLinkPreview', component.get('v.themeObj').navbarLinkColor);
            }
            else if (event.getParam('fieldId') === 'supernavTextColor') {
                helper.changeStyleColor(component, 'themeSupernavTextPreview', component.get('v.themeObj').supernavTextColor);
            }
            else if (event.getParam('fieldId') === 'supernavLinkColor') {
                helper.changeStyleColors(component, 'themeSupernavLinkPreview', component.get('v.themeObj').supernavLinkColor);
            }
            else if (event.getParam('fieldId') === 'supernavBackgroundColor') {
                helper.changeStyleColor(component, 'themeSupernavBackgroundPreview', component.get('v.themeObj').supernavBackgroundColor);
            }
            else if (event.getParam('fieldId') === 'logoImage' && component.get('v.themeObj').logoImage !== null) {
                component.set('v.showLogoImage', true);
            }
            else if (event.getParam('fieldId') === 'faviconImage' && component.get('v.themeObj').faviconImage !== null) {
                component.set('v.showFaviconImage', true);
            }
        }
        catch (e) {
            console.log(e);
        }
    },
    saveThemeObjExit : function(component,event,helper) {
        helper.saveThemeObj(component,true);
    },
    saveThemeObj : function(component,event,helper) {
        helper.saveThemeObj(component,false);
    },
    cancelThemeObj : function(component,event,helper) {
        helper.cancelThemeObj(component);
    }
})