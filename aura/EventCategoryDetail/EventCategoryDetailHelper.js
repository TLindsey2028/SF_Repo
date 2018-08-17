({
    editCategory : function (component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: 'EventApi:EventCategoryCreateEdit',
            componentParams: {
                category : component.get('v.category'),
                identifier: 'EventCategories'
            }
        });
        compEvent.fire();
    },
    showDeleteCategoryPrompt : function (component) {
        var iconUrl = UrlUtil.addSitePrefix('/resource/Framework__SLDS_Icons/icons/utility/warning_60.png');
        var withEventsMessage = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center"><img src="'+iconUrl+'" width="52" /></div></div>';
        withEventsMessage += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">Cannot delete Event Category because there are events associated to the category</div></div>';
        component.find('deleteCategoryWithEvents').updateMessage(withEventsMessage);

        withEventsMessage = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center"><img src="'+iconUrl+'" width="52" /></div></div>';
        withEventsMessage += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">Are you sure you want to delete this Event Category?</div></div>';
        component.find('deleteCategoryNoEvents').updateMessage(withEventsMessage);

        if (component.get('v.category.events') > 0) {
            component.find('deleteCategoryWithEvents').showModal();
        }
        else {
            component.find('deleteCategoryNoEvents').showModal();
        }
    },
    deleteCategory : function (component) {
        var action = component.get('c.deleteCategoryObj');
        action.setParams({id : component.get('v.category.id')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                component.find('deleteCategoryNoEvents').stopIndicator();
            }
            else {
                component.find('deleteCategoryNoEvents').hideModal();
                var compEvent = $A.get('e.EventApi:EventCategoriesReload');
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }
})