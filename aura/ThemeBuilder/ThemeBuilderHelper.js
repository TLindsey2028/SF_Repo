/* global $ */
({
    changeActiveTab : function(component,tabIdToActivate) {
        $A.util.removeClass(component.find('templateNameColorSideLink'),'active');
        $A.util.removeClass(component.find('templateLogoSideLink'),'active');
        $A.util.removeClass(component.find('templateCustomCSSSideLink'),'active');
        $A.util.removeClass(component.find('templateHeaderSideLink'),'active');
        $A.util.removeClass(component.find('templateFooterSideLink'),'active');
        $A.util.removeClass(component.find('templateHTMLHeadSideLink'),'active');
        $A.util.removeClass(component.find('templateSupernavSideLink'),'active');
        $A.util.removeClass(component.find('templateAdvancedSettingsSideLink'),'active');
        $A.util.addClass(component.find(tabIdToActivate+'SideLink'),'active');

        $A.util.addClass(component.find('templateNameColor'),'hidden');
        $A.util.addClass(component.find('templateLogo'),'hidden');
        $A.util.addClass(component.find('templateCustomCSS'),'hidden');
        $A.util.addClass(component.find('templateHeader'),'hidden');
        $A.util.addClass(component.find('templateFooter'),'hidden');
        $A.util.addClass(component.find('templateHTMLHead'),'hidden');
        $A.util.addClass(component.find('templateSupernav'),'hidden');
        $A.util.addClass(component.find('templateAdvancedSettings'),'hidden');
        $A.util.removeClass(component.find(tabIdToActivate),'hidden');
    },
    changeStyleColor : function(component,divElementId,color) {
        if (!$A.util.isEmpty(color)) {
            component.find(divElementId).getElement().style.backgroundColor = color;
        }
    },
    changeStyleColors : function(component,divElementId,color) {
        if (!$A.util.isEmpty(color)) {
            component.find(divElementId).forEach(function (element) {
                element.getElement().style.backgroundColor = color;
            });
        }
    },
    saveThemeObj : function(component,exit) {
        var self = this;
        component.find('name').validate();
        if (self.validateForm(component.get('v.themeObj'),component) && component.find('name').get('v.validated')) {
            var themeObj = component.get('v.themeObj');
            themeObj.lightningStyles = ThemeGenerator.generateTheme(themeObj);
            var action = component.get('c.saveTheme');
            action.setParams({themeJSON: JSON.stringify(themeObj)});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('saveThemeTopObj').stopIndicator();
                    component.find('saveThemeObj').stopIndicator();
                }
                else {
                    var resultObj = JSON.parse(result.getReturnValue());
                    component.set('v.themeObj', resultObj);
                    if (exit) {
                        self.cancelThemeObj(component,resultObj);
                    }
                    else {
                        component.find('saveThemeTopObj').stopIndicator();
                        component.find('saveThemeObj').stopIndicator();
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveThemeTopObj').stopIndicator();
            component.find('saveThemeObj').stopIndicator();
        }
    },
    cancelThemeObj : function(component,themeObj) {
        if (component.get('v.fireReturnEvent')) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentParams : {
                    updatedTheme : themeObj
                }
            });
            compEvent.fire();
        }
        else {
            var navEvt = $A.get("e.force:navigateToObjectHome");
            if (!$A.util.isEmpty(navEvt)) {
                navEvt.setParams({
                    "scope": 'PagesApi__Theme__c'
                });
                navEvt.fire();
            }
            else {
                var action = component.get('c.cancelTheme');
                action.setCallback(this, function (result) {
                    UrlUtil.navToUrl(result.getReturnValue());
                });
                $A.enqueueAction(action);
            }
        }
    },
    getExistingThemeObj : function(component) {
        var self = this;
        var action = component.get('c.getExistingTheme');
        action.setParams({themeId: component.get('v.themeId')});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var themeObj = JSON.parse(result.getReturnValue());
                component.set('v.themeObj', themeObj);
                self.loadThemeObj(component);
            }
        });
        $A.enqueueAction(action)
    },
    loadThemeObj : function (component) {
        if (!$A.util.isEmpty(component.get('v.themeId'))) {
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({
                group: 'themeObj',
                data: component.get('v.themeObj')
            });
            compEvent.fire();
            this.changeStyleColor(component,'themeBrandPrimaryPreview',component.get('v.themeObj').brandPrimary);
            this.changeStyleColor(component,'themeBrandSecondaryPreview',component.get('v.themeObj').brandSecondary);
            this.changeStyleColors(component,'themeBodyTextPreview',component.get('v.themeObj').textColor);
            this.changeStyleColors(component,'themeBodyLinkPreview',component.get('v.themeObj').linkColor);
            this.changeStyleColor(component,'themeBodyBackgroundPreview',component.get('v.themeObj').bodyBackgroundColor);
            this.changeStyleColor(component,'themeNavbarBackgroundPreview',component.get('v.themeObj').navbarBackgroundColor);
            this.changeStyleColors(component,'themeNavbarLinkPreview',component.get('v.themeObj').navbarLinkColor);
            this.changeStyleColor(component,'themeSupernavTextPreview',component.get('v.themeObj').supernavTextColor);
            this.changeStyleColors(component,'themeSupernavLinkPreview',component.get('v.themeObj').supernavLinkColor);
            this.changeStyleColor(component,'themeSupernavBackgroundPreview',component.get('v.themeObj').supernavBackgroundColor);
            if (!$A.util.isEmpty(component.get('v.themeObj.logoImage'))) {
                component.set('v.showLogoImage',true);
            }
            if (!$A.util.isEmpty(component.get('v.themeObj.faviconImage'))) {
                component.set('v.showFaviconImage',true);
            }
        }
        this.fireComponentLoadedEvent(component);
    },
    validateForm : function(inputObj,component) {
        var isFormValid;
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null) {
                component.find(property).validate();
                if (!component.find(property).get('v.validated')) {
                    isFormValid = false;
                }
            }
        }
        if (isFormValid === undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.PagesApi:ComponentLoadedEvent');
        compEvent.fire();
    }
})