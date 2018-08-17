({
    doInit: function (component, event, helper) {
        if ($A.util.isEmpty(window.location.hash) && window.location.href.indexOf('#') > -1) {
            window.location = window.location.href.substr(0, window.location.href.indexOf('#'));
        }
        FontevaHelper.setCookie(helper.siteCookieName,component.get('v.params.siteObj.id'));
        helper.checkComponentToLoad(component);
        if (!$A.util.isUndefinedOrNull(component.get('v.params.error'))) {
            FontevaHelper.showErrorMessage(component.get('v.params.error'));
            component.set('v.params.error', null);
        }
        if ($A.get("$Browser.isPhone")) {
            $A.util.addClass(component.find('eventFooter'),'slds-hide')
        }

        //setup detectBackOrFoward
        window.hashHistory = [window.location.hash];
        window.historyLength = window.history.length;

        window.onhashchange = $A.getCallback(function() {
            helper.detectBackOrForward(component, function (cmp, prevHash) {helper.onHashChange(cmp, prevHash)});
        });
    },
    updateSalesOrder: function(component, event, helper) {
        if (event.getParam('hasSOUpdated')) {
            component.set('v.so', event.getParam('so'))
        }
    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'EventWrapper') {
            FontevaHelper.showComponent(component, event.getParam('componentName'), event.getParam('componentParams'),helper.divId,true);
        }
    },
    handleCancelRegistration : function(component,event,helper) {
        helper.cancelReg(component,event.getParam('showMainComponent'));
    },
    handleHashChangingEvent : function(component,event,helper) {
        helper.handleHashChangingEvent(component,event.getParam('hash'));
    },
    handleConfirmWaitlistEvent : function(component,event,helper) {
        helper.confirmWaitlist(component, event);
    },
    summaryModal : function(component, event, helper) {
        var wrapper = component.find('regFlowSummary');
        var container = wrapper.find('modalContainer');
        var backdrop = component.find('modalBackdrop');
        var body = document.body;

        $A.util.addClass(container, 'slds-fade-in-open');
        $A.util.addClass(backdrop, 'slds-backdrop_open');
        $A.util.addClass(body, 'noscroll');
        helper.getUpdatedSalesOrder(component);
    }
})