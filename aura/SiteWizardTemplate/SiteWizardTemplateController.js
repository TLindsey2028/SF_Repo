({
    doInit: function(component, event, helper) {
        component.set('v.siteObj',{
            name : null,
            networkId : null,
            templateId : null,
            description : null
        });
        helper.getCommunities(component);
        helper.fireComponentLoadedEvent(component);
        var compEvent = $A.get('e.Framework:AnalyticsEvent');
        compEvent.setParams({pageName : 'SiteWizard'});
        compEvent.fire();
    },
    closeModal: function(component) {
        UrlUtil.navToUrl('/' + component.get('v.sitePrefix'));
    },
    saveModal: function(component, event, helper) {
        helper.save(component);
    }
})