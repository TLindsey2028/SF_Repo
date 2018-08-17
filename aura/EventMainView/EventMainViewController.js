({
    doInit : function(component,event,helper) {
        var hash = window.location.hash;
        if (hash === '#loginredirectTT') {
            $A.util.addClass(component.find('eventMainView'), 'slds-hide');
            helper.registerEvent(component);
        } else {
            helper.loadBasedOnHash(component);
            component.set('v.menuNumber', component.get('v.eventObj.eventPages.length'));
            helper.buildLoginCmp(component);
            helper.buildManageCmp(component);
        }
    },
    registerEvent: function(component, event, helper) {
        helper.registerEvent(component);
    },
    showTab: function(component,event,helper) {
        event.preventDefault();
        helper.showNewPanel(component,event.currentTarget.dataset.type,event.currentTarget.dataset.title);
    },
    showSideNav : function() {
        var compEvent = $A.get('e.LTE:EventToggleSideNavEvent');
        compEvent.fire();

        var footer = document.querySelector('.slds-col--padded.comm-content-footer.comm-layout-column');
        var body = document.querySelector('body');
        var nav = document.getElementById('navbar');

        $A.util.toggleClass(footer,'sidenav-active');
        $A.util.toggleClass(body, 'sidenav-active');
        $A.util.toggleClass(nav, 'active');

    },
    handleEventChangePageEvent : function(component,event,helper) {
        if (event.getParam('type') === 'registration-panel') {
            helper.showMyRegistration(component);
        }
        else {
            helper.showNewPanel(component, event.getParam('type'), event.getParam('title'));
        }
    },
    handleHashChangedEvent: function(component, event, helper) {
        helper.handleHashChangedEvent(component);
    },
    showMyRegistration : function(component,event,helper) {
        helper.showMyRegistration(component);
    },
    showLogin : function (component, event, helper) {
        helper.showLogin(component,'login');
    },
    logout : function (component) {
        sessionStorage.clear();
        FontevaHelper.flushAll();
        var sitePrefix = component.get('v.siteObj.pathPrefix').replace(/\/s$/,'');
        window.location = sitePrefix+'/secur/logout.jsp?retUrl='+encodeURIComponent(sitePrefix+'/EventApi__router?event='+component.get('v.eventObj.id')+'&site='+component.get('v.siteObj.id'));
    }
})