({
    // doInit: function(cmp, event, helper) {
    //     helper.doInit(cmp, event);
    // },
    itemIdChange: function(cmp, event, helper) {
        helper.itemIdChange(cmp, event);
    },
    addItem: function(cmp, event, helper) {
        helper.addItem(cmp);
    },
    editItem: function(cmp, event, helper) {
        helper.editItem(cmp, event.currentTarget.dataset.id);
    },
    deleteItem: function(cmp, event, helper) {
        helper.deleteItem(cmp, event.currentTarget.dataset.id);
    },
    doDelete: function(cmp, event, helper) {
        helper.doDelete(cmp);
    },
    closeModal: function(cmp, event, helper) {
        helper.closeModal(cmp);
    },
    save: function(cmp, event, helper) {
        if (helper.validateForm(cmp)) {
            helper.save(cmp);
        } else {
            cmp.find('upsertPackageItem').stopIndicator();
        }
    },
    handleFieldUpdateEvent: function (component, event, helper) {
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