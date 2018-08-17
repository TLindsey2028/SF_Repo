({
    doInit : function(component,event,helper) {
        helper.doInit(component,false);
    },
    newEventCategory : function(component,event,helper) {
        helper.newEventCategory(component);
    },
    filterCategories : function (component,event,helper) {
        helper.filterCategories(component);
    },
    clearSearch : function(component,event,helper) {
        component.find('eventCategorySearch').set('v.value',null);
        helper.filterCategories(component);
    },
    handleEventCategoriesReloadEvent : function (component,event,helper) {
        helper.doInit(component,true);
    }
})