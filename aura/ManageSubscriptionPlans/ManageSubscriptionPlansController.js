({
    doInit : function(component,event,helper) {
        helper.getItem(component);
    },
    save : function(component,event,helper) {
        helper.savePlan(component);
    },
    cancel : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.itemId')
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToUrl('/'+component.get('v.retUrl'));
        }
    },
    handleFieldUpdateEvent : function(component, event) {
        if (event.getParam('fieldId') === 'isSelected' && !component.get('v.hasDefault')) {
            var plans = component.get('v.item').planOptions;
            var indexToUpdate;
            plans.forEach(function(element,index){
                if (element.isSelected) {
                    indexToUpdate = index;
                }
            });
            var defaultOptions = component.find('isDefault');
            if (!$A.util.isArray(defaultOptions)) {
                defaultOptions.updateValue(true);
            }
            else {
                defaultOptions[indexToUpdate].updateValue(true);
            }
            component.set('v.hasDefault',true);
        }
    }
})