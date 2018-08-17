({
    deleteSite : function (component) {
        var compEvent = $A.get('e.EventApi:EventCategorySiteDeleteEvent');
        compEvent.setParams({siteToDelete : component.get('v.siteEventCategory.site')});
        compEvent.fire();
    }
})