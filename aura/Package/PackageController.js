({
    doInit : function (component, event, helper) {
        helper.retrievePackageDetails(component);
    },
    cancel : function (component, event, helper) {
        helper.exitPage(component);
    },
    save : function (component, event, helper) {
        if (helper.validateForm(component)) {
            helper.save(component);
        } else {
            component.find('saveButton').stopIndicator();
        }
    },
    handleFieldUpdateEvent : function(component, event, helper) {
        if (event.getParam('fieldId') === 'type') {
            if (component.get('v.packageObj.type') === 'item') {
                helper.buildItemLookUp(component);
                if (component.get('v.packageObj.itemClass')) {
                    component.set('v.packageObj.itemClass', '');
                }
            }
            else if (component.get('v.packageObj.type') === 'itemClass') {
                helper.buildItemClassLookUp(component);
                if (component.get('v.packageObj.item')) {
                    component.set('v.packageObj.item', '');
                }
            }
        }
    }
})