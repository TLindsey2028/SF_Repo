({
    doInit : function (component,event,helper) {
        if ($A.util.isEmpty(component.get('v.category.id'))) {
            component.set('v.category',{
                id : null,
                name : null,
                sites : null,
                site : null,
                businessGroup : null,
                siteEventCategories : []
            });
        }
        helper.doInit(component);
    },
    handleFieldUpdateEvent : function (component,event) {
        if (event.getParam('group') === 'siteCategory') {
            if ($A.util.isEmpty(event.getParam('value'))) {
                component.find('addSiteBtn').set('v.disable',true);
            }
            else {
                component.find('addSiteBtn').set('v.disable',false);
            }
        }
    },
    cancelCategory : function(component,event,helper) {
        helper.cancelCategory();
    },
    saveAndClose : function(component,event,helper) {
        helper.saveAndClose(component);
    },
    addSite : function (component,evnet,helper) {
        helper.addSite(component);
    },
    handleEventCategorySiteDeleteEventHandler : function (component,event,helper) {
        helper.deleteSite(component,event.getParam('siteToDelete'));
    }
})