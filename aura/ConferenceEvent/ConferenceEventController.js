/* global FontevaHelper */
/* global $ */
({
    doInit : function(component, event, helper) {
        FontevaHelper.cacheItem('organizationId', component.get('v.params.organizationId'), 600000000000);
        component.set('v.params.storeObj.environmentKey',component.get('v.params.environmentKey'));
        if ($A.util.isEmpty(component.get('v.params.record.id'))) {
            document.title = $A.get('$Label.LTE.Event_Not_Found');
        }
        else {
            document.title = component.get('v.params.record.name');
            var tabParam = FontevaHelper.getCacheItem('loginUser');
            FontevaHelper.clearCacheItem('loginUser');
            var existingConfig = FontevaHelper.getCacheItem('registrationTickets');
            // var registerWasInitiated = window.localStorage.getItem(helper.REGISTER_INITIATED);
            // window.localStorage.removeItem(helper.REGISTER_INITIATED);
            if (!$A.util.isEmpty(tabParam) && tabParam) {
                if (!$A.util.isUndefinedOrNull(existingConfig)) {
                    FontevaHelper.clearCacheItem('registrationTickets');
                    helper.registerForTickets(component, component.get('v.params.usr'), existingConfig);
                }
                // } else if (registerWasInitiated === 'yes') {
                //     helper.registerEvent(component);
                // }
                else {
                    helper.loadMainView(component);
                }
            } else {
                helper.loadMainView(component);
            }
        }

        var page = document.getElementById('eventPage');
        var parents = [];
        while (page) {
            parents.push(page = page.parentElement);
        }
        for (var i = 0; i < parents.length; i++) {
            if (parents[i]) {
                parents[i].style.height = '100%';
            }
        }

    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'ConfMainView') {
            FontevaHelper.showComponent(component, event.getParam('componentName'), event.getParam('componentParams'),helper.divId,true);
        }
    },
    handleLoginComponentEvent : function (component,event,helper) {
        if (event.getParam('showOverview')) {
            helper.showMainView(component);
        }
        else {
            if (!$A.util.isEmpty(event.getParam('cancelLoginProcess')) && event.getParam('cancelLoginProcess')) {
                helper.showMainView(component);
                FontevaHelper.clearCacheItem('registrationTickets');
            } else {
                var usrObj = {contactId: event.getParam('guestContact').id, isAuthenticated: true, isGuest: true};
                FontevaHelper.cacheItem('usrObj', usrObj);
                component.set('v.params.usr', usrObj);
                var existingConfig = FontevaHelper.getCacheItem('registrationTickets');
                if (!$A.util.isEmpty(existingConfig)) {
                    FontevaHelper.clearCacheItem('registrationTickets');
                    helper.registerForTickets(component, component.get('v.params.usr'), existingConfig);
                }
                else {
                    helper.registerEvent(component);
                }
            }
        }
    },
    registerEvent : function(component, event, helper) {
        helper.registerEvent(component);
    },
    handleEventToggleSideNaveEvent : function(component) {
        $A.util.toggleClass(component.find('side-nav'),'active');
        $A.util.toggleClass(component.find('slds-page'),'active');
    },
    showTab : function(component,event,helper) {
        event.preventDefault();
        helper.showNewPanel(component,event.currentTarget.dataset.type,event.currentTarget.dataset.title);
    },
    showMyRegistration : function(component,event,helper) {
        helper.showNewPanel(component,'registration-panel',$A.get('$Label.LTE.Manage_Registration_Tab_Name'));
    },
    showRegisterNow : function(component,event,helper) {
        if (component.get('v.params.usr.isAuthenticated')) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentName: 'markup://LTE:' + 'EventRegistrationWrapper',
                componentParams: {
                    usr: component.get('v.params.usr'),
                    eventObj: component.get('v.params.record'),
                    siteObj: component.get('v.params.siteObj'),
                    storeObj: component.get('v.params.storeObj'),
                    showRegisterButton: false,
                    identifier: 'EventWrapper'
                }
            });
            compEvent.fire();
            helper.toggleSideNav(component);
        }
        else {
            helper.showLogin(component);
        }
    },
    showLogin : function (component,event,helper) {
        helper.showLogin(component);
    },
    logout : function (component) {
        sessionStorage.clear();
        FontevaHelper.flushAll();
        var sitePrefix = component.get('v.params.siteObj.pathPrefix').replace(/\/s$/,'');
        window.location.href = sitePrefix+'/secur/logout.jsp?retUrl='+encodeURIComponent(sitePrefix+'/EventApi__router?event='+component.get('v.params.record.id')+'&site='+component.get('v.params.siteObj.id'));
    }
})