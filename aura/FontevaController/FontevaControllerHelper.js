/* global FontevaHelper */
/* global $ */
/* global _ */
({
    divId : 'fontevaBody',
    loaderHidden: false,
    siteCookieName : 'apex__fonteva_site',
    getRecordAndShowComponent : function (component) {
        var self = this;
        var componentName;
        if (!$A.util.isEmpty(FontevaHelper.getUrlParameter('id'))) {
            component.set('v.recordId', FontevaHelper.getUrlParameter('id'));
        }

        if (!$A.util.isEmpty(FontevaHelper.getUrlParameter('isPreview'))) {
            component.set('v.isPreview',FontevaHelper.getUrlParameter('isPreview'))
        }
        var urlVars = FontevaHelper.getUrlVars();
        if (!$A.util.isEmpty(component.get('v.urlVars'))) {
            urlVars = component.get('v.urlVars');
        }
        if ($A.util.isUndefinedOrNull(urlVars.site)) {
            urlVars.site = FontevaHelper.getCookie(this.siteCookieName);
        }

        try {
            if (!$A.util.isEmpty(component.get('v.recordId'))) {
                var begin;
                var end;
                var action = component.get('c.getObjectAndRoute');
                action.setParams({
                    recordId: component.get('v.recordId'),
                    isPreview : component.get('v.isPreview'),
                    urlVars : JSON.stringify(urlVars)
                });
                action.setCallback(this, function (result) {
                    end = Date.now();
                    try {
                        if (result.getState() === 'ERROR') {
                            result.getError().forEach(function (error) {
                                FontevaHelper.showErrorMessage(error.message);
                            });
                        }
                        else {
                            var recordAndRoute = result.getReturnValue();
                            componentName = recordAndRoute.component;
                            FontevaHelper.showComponent(component,componentName,recordAndRoute,self.divId);
                            if (!this.loaderHidden) {
                                this.loaderHidden = true;
                                setTimeout(function () { //pause 100ms to allow the CSS to load
                                    $A.util.addClass(component.find('mainLoader'), 'slds-hide');
                                    $A.util.removeClass(component.find('mainContent'), 'slds-hide');
                                }, 100);
                            }
                        }
                    }
                    catch (err) {
                    }
                });
                if (!component.get('v.isPreview')) {
                    action.setStorable();
                }
                begin = Date.now();
                $A.enqueueAction(action);
            }
        }
        catch (err) {
        }
    }
})