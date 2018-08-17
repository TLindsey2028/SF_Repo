/* global FontevaHelper */
/* global Absurd */
({
    cachePrefix : 'fonteva',
    cssCreated : false,
    siteCookieName : 'apex__fonteva_site',
    getOrgId : function(component){
        var self = this;
        try {
            var cachedItem = FontevaHelper.getCacheItem('organizationId');
            if (!$A.util.isEmpty(cachedItem)) {
                component.set('v.organizationId', cachedItem);
                self.getSalesOrder(component);
            }
            else {
                var action = component.get('c.getOrganizationId');
                action.setCallback(this, function (result) {
                    component.set('v.organizationId', result.getReturnValue());
                    FontevaHelper.cacheItem('organizationId', result.getReturnValue(), 600000000000);
                    self.getSalesOrder(component);
                });
                action.setStorable();
                $A.enqueueAction(action);
            }
        }
        catch (err) {
        }

    },
    getSalesOrder : function(component) {
        var soInfo = FontevaHelper.getCookie('apex__'+component.get('v.organizationId')+'-fonteva-lightning-shopping-cart');
        if (!$A.util.isEmpty(soInfo)) {
            try {
                var soObj = JSON.parse(decodeURIComponent(soInfo));
                component.set('v.salesOrder', soObj.salesOrderId);
            }
            catch (err) {

            }
        }
    },
    getUserInfo : function(component){
        var self = this;
        var action = component.get('c.getUser');
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                try {
                    var user = result.getReturnValue();
                    if ($A.util.isEmpty(user)) {
                        FontevaHelper.showErrorMessage($A.get('$Label.PagesApi.User_Not_Found_Query'));
                        return;
                    }
                    component.set('v.usr', user);
                    FontevaHelper.cacheItem('usrObj', component.get('v.usr'));
                    self.fireBaseLoadEvent(component, 'user');
                }
                catch (err) {
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    getTheme : function(component) {
        var self = this;
        var cachedItem = FontevaHelper.getCacheItem('theme');
        if (!$A.util.isEmpty(cachedItem)) {
            if (!this.cssCreated) {
                this.cssCreated = true;
            }
            component.set('v.themeObj',cachedItem);
            self.setLightningStyles(component,cachedItem.lightningStyles);
        }
        else {
            var action = component.get('c.getTheme');
            action.setParams({theme : this.getUrlParameter('theme')});
            action.setCallback(this, function (result) {
                if (!$A.util.isEmpty(result.getReturnValue())) {
                    if (!this.cssCreated) {
                        this.cssCreated = true;
                    }
                    component.set('v.themeObj', result.getReturnValue());
                    FontevaHelper.cacheItem('theme', result.getReturnValue());
                    self.setLightningStyles(component,result.getReturnValue().lightningStyles);
                }
                else {
                    FontevaHelper.showErrorMessage($A.get('$Label.PagesApi.Theme_Not_Found'));
                }
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
    },
    getSite : function(component) {
        var self = this;
        var siteId = FontevaHelper.getUrlParameter('site');
        if (!$A.util.isEmpty(component.get('v.siteIdValue'))) {
            siteId = component.get('v.siteIdValue');
        }
        if ($A.util.isEmpty(siteId)) {
            siteId = FontevaHelper.getCookie(this.siteCookieName);
        }
        var cachedItem = null;
        if ($A.util.isEmpty(siteId)) {
            cachedItem = FontevaHelper.getCacheItem(siteId);
        }
        if (!$A.util.isEmpty(cachedItem)) {
            component.set('v.siteObj',cachedItem);
            component.set('v.storeObj',cachedItem.storeObj);
            component.set('v.themeObj',cachedItem.themeObj);
            if (!$A.util.isEmpty(cachedItem.themeObj)) {
                self.setLightningStyles(component,cachedItem.themeObj.lightningStyles);
            }
            FontevaHelper.setCookie(self.siteCookieName,cachedItem.id);
            self.fireBaseLoadEvent(component, 'site');
        }
        else {
            var action = component.get('c.getSite');
            action.setParams({siteId : siteId});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    component.set('v.siteObj', result.getReturnValue());
                    component.set('v.storeObj', result.getReturnValue().storeObj);
                    component.set('v.themeObj', result.getReturnValue().themeObj);
                    FontevaHelper.cacheItem(result.getReturnValue().id,result.getReturnValue());
                    FontevaHelper.setCookie(self.siteCookieName,result.getReturnValue().id);
                    if (!$A.util.isEmpty(result.getReturnValue().themeObj)) {
                        self.setLightningStyles(component,result.getReturnValue().themeObj.lightningStyles);
                    }
                }
                self.fireBaseLoadEvent(component, 'site');
            });
            action.setStorable();
            $A.enqueueAction(action);
        }
    },
    fireBaseLoadEvent : function(component, objectLoaded) {
        var finishedObjectLoads = component.get('v.objectLoad');
        finishedObjectLoads.push(objectLoaded);
        component.set('v.objectLoad', finishedObjectLoads);
        if (finishedObjectLoads.length === 2) {
            var compEvent = $A.get('e.PagesApi:BaseComponentLoadCompleteEvent');
            compEvent.setParams({});
            compEvent.fire();
        }
    },
    setLightningStyles : function (component,lightningStyles) {
        if (component.get('v.isRecordPreview') && !$A.util.isEmpty(lightningStyles)) {
            lightningStyles = lightningStyles.replace(/\.slds /g,'.fonteva-slds ');
        }
        if (!component.get('v.disableThemeValue')) {
            component.set('v.stylesCss', lightningStyles);
        }
    }
})