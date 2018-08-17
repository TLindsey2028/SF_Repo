({
    cookieName : 'cookie_prompt',
    doInit : function (component) {
        var action = component.get('c.showPrompt');
        action.setParams({contactId : component.get('v.contact'),siteId : component.get('v.site')});
        action.setCallback(this,function(result){
            if (result.getState() === 'SUCCESS') {
                var returnObj = result.getReturnValue();
                component.set('v.cookieObj',returnObj);
                var cookie = FontevaHelper.getCookie(this.cookieName);
                var cookieAlreadyAccepted = false;
                if (!$A.util.isEmpty(cookie)) {
                    cookie = JSON.parse(cookie);
                    if (cookie.organizationId === returnObj.organizationId) {
                        cookieAlreadyAccepted = true;
                    }
                }
                if (!component.get('v.isGuest') && cookieAlreadyAccepted) {
                    FontevaHelper.setCookie(this.cookieName,{},-1);
                    this.saveCookieResponse(component);
                }
                if (returnObj.cookieEnabled && !returnObj.cookieAccepted && !cookieAlreadyAccepted) {
                    component.find('cookieUsagePrompt').showModal();
                    FontevaHelper.disableBodyScroll();
                }

            }
            else if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    redirect : function (component) {
        window.location = component.get('v.cookieObj.cookieRedirectUrl');
    },
    saveCookieResponse : function (component) {
       if (component.get('v.isGuest')) {
            FontevaHelper.setCookie(this.cookieName,JSON.stringify({organizationId : component.get('v.cookieObj.organizationId'),cookieAccepted : true}),30);
            component.find('cookieUsagePrompt').hideModal();
            FontevaHelper.enableBodyScroll();
        }
        else if (!$A.util.isEmpty(component.get('v.contact'))) {
            var action = component.get('c.saveCookieResponseValue');
            action.setParams({contactId: component.get('v.contact')});
            action.setCallback(this, function (result) {
                component.find('cookieUsagePrompt').hideModal();
                FontevaHelper.enableBodyScroll();
            });
            $A.enqueueAction(action);
        }
    }
})