({
    doInit : function(component,event,helper) {
        helper.cachePrefix = component.get('v.cachePrefix');
        helper.getOrgId(component);
        helper.getSite(component);
        helper.getUserInfo(component);
    }
})