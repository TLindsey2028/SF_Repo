({
    itemIdChange: function(cmp, event) {
        //load package items on value change
        if (cmp.get('v.parentItemId')) {
            var action = cmp.get('c.getPackageItems');
            action.setParams({itemId: cmp.get('v.parentItemId')});
            action.setCallback(this, function (result, status, errors) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        cmp.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    cmp.set('v.packageItems', result.getReturnValue());
                }
            });
            $A.enqueueAction(action);
            var compEvent = $A.get('e.EventApi:AddSelectorEvent');
            compEvent.setParams({
                operation: 'add',
                classes: 'slds-sidebar--modal-open',
                idTarget: ['side-nav-div', 'topNavDiv']
            });
            compEvent.fire();
        }
    },
    addItem: function(cmp) {
        cmp.set('v.packageObj', {
            type: 'item', itemClass: null, item: null, hasNoAdditionalCharge: true,
            minQuantity: 1, hasAdditionalCharge: false, parentItemId: cmp.get('v.parentItemId')
        });
        cmp.set('v.packageModalState', 'hide');

        var editorModal = cmp.find('newPackageModal');
        $A.util.addClass(editorModal, 'slds-fade-in-open');

        var packageObj = cmp.get('v.packageObj');
        this.buildItemLookUp(cmp);

        this.refreshInputFields(cmp, packageObj);
    },
    refreshInputFields : function(cmp, packageObj) {
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group: cmp.get('v.owner') + 'Package', type: 'value', data: packageObj});
        compEvents.fire();
    },
    save: function(cmp) {
        var action = cmp.get('c.savePackageDetails');
        var packageObj = _.cloneDeep(cmp.get('v.packageObj'));
        packageObj.isRequired = packageObj.isRequired === true;
        packageObj.hasAdditionalCharge = packageObj.hasAdditionalCharge === true;
        if (cmp.get('v.isTicket')) {
            packageObj.ticketTypeId = cmp.get('v.secondaryId');
        }
        else {
            packageObj.scheduleItemId = cmp.get('v.secondaryId');
        }
        action.setParams({
                packageJsonString: JSON.stringify(packageObj)
            }
        );
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    cmp.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                this.itemIdChange(cmp);
                this.closeModal(cmp);
            }
            cmp.find('upsertPackageItem').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    editItem: function(cmp, packageItemId) {
        var packageObj = _.cloneDeep(_.find(cmp.get('v.packageItems'), {packageItemId: packageItemId}));
        if (packageObj.maxQuantity === -1) {
            packageObj.maxQuantity = null;
        }
        if (packageObj.minQuantity === -1) {
            packageObj.minQuantity = null;
        }
        if (packageObj.maxQuantityPerItem === -1) {
            packageObj.maxQuantityPerItem = null;
        }

        cmp.set('v.packageObj', packageObj);
        cmp.set('v.packageModalState', 'hide');

        if (packageObj.type === 'item') {
            this.buildItemLookUp(cmp);
        } else {
            this.buildItemClassLookUp(cmp);
        }

        var editorModal = cmp.find('newPackageModal');
        $A.util.addClass(editorModal, 'slds-fade-in-open');

        this.refreshInputFields(cmp, packageObj);
    },
    deleteItem: function(cmp, packageItemId) {
        var packageObj = _.cloneDeep(_.find(cmp.get('v.packageItems'), {packageItemId: packageItemId}));
        cmp.set('v.packageObj', packageObj);
        cmp.set('v.packageModalState', 'hide');

        var deleteModal = cmp.find('deleteModal');
        $A.util.addClass(deleteModal, 'slds-fade-in-open');
    },
    doDelete: function(cmp) {
        var action = cmp.get('c.deletePackageItem');
        action.setParams({
                packageItemId: cmp.get('v.packageObj.packageItemId')
            }
        );
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    cmp.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                this.itemIdChange(cmp);
                this.closeModal(cmp);
            }
            cmp.find('doDelete').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    closeModal: function(cmp) {
        cmp.set('v.packageModalState', 'show');

        var packageModal = cmp.find('newPackageModal');
        if (packageModal) $A.util.removeClass(packageModal, 'slds-fade-in-open');
        var deleteModal = cmp.find('deleteModal');
        if (deleteModal) $A.util.removeClass(deleteModal, 'slds-fade-in-open');
    },
    buildItemLookUp: function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.pckgItemGlobalId')) && !$A.util.isUndefinedOrNull($A.getComponent(component.get('v.pckgItemGlobalId')))) {
            var divComponent = component.find("entityDiv");
            divComponent.set("v.body", []);
        }
        $A.createComponent(
            'Framework:InputFields', {
                value: component.get('v.packageObj'),
                fieldType: 'lookup',
                'aura:id': 'item',
                group: 'package1',
                label: $A.get("$Label.EventApi.Select_Package_Item_Event_Builder"),
                fireChangeEvent: true,
                isRequired: true,
                otherAttributes: {
                    advanced: true,
                    loadBaseValues: false,
                    concatenateLabel: true,
                    types: {
                        'OrderApi__Item__c': {
                            fieldNames: ['Name', 'OrderApi__Line_Description__c', 'OrderApi__Is_Subscription__c', 'OrderApi__Is_Contribution__c'],
                            filter: 'OrderApi__Is_Active__c = true AND EventApi__Schedule_Item__c = null AND EventApi__Ticket_Type__c = null AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false',
                            initialLoadFilter: 'OrderApi__Is_Active__c = true AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false ORDER BY OrderApi__Item_Class__r.OrderApi__Sold_Inventory__c DESC LIMIT 30'
                        }
                    },
                    otherMethods: {
                        searchField: ['sObjectLabel', 'Name', 'OrderApi__Line_Description__c', 'OrderApi__Is_Subscription__c', 'OrderApi__Is_Contribution__c', 'OrderApi__Item_Class__r.Name'],
                        render: {
                            option: function (item, escape) {
                                var lowerText = '';
                                if (item.sObj.OrderApi__Is_Subscription__c) {
                                    lowerText = escape('Subscriptions');
                                }
                                else if (item.sObj.OrderApi__Is_Contribution__c) {
                                    lowerText = escape('Contribution') + '&nbsp;&nbsp;-&nbsp;&nbsp;' + escape(item.sObj.OrderApi__Line_Description__c);
                                }
                                return '<div class="slds-grid">' +
                                    '<div class="slds-col item-lookup  slds-grid slds-wrap"><div class="slds-col item-lookup slds-size--1-of-1 slds-text-weight--regular">' + escape(item.sObj.Name) +
                                    '</div><div class="slds-col item-lookup slds-size--1-of-1 slds-text-body--small">' + lowerText + '</div></div></div>';
                            },
                            item: function (item, escape) {
                                return '<div>' + escape(item.sObj.Name) + '</div>';
                            }
                        }
                    }
                }
            }, function (cmp) {
                cmp.set('v.value', component.get('v.packageObj'));
                component.set('v.pckgItemGlobalId', cmp.getGlobalId());
                var divComponent = component.find("entityDiv");
                divComponent.set("v.body", [cmp]);
            }
        );
    },
    buildItemClassLookUp: function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.pckgItemClassGlobalId')) && !$A.util.isUndefinedOrNull($A.getComponent(component.get('v.pckgItemClassGlobalId')))) {
            var divComponent = component.find("entityDiv");
            divComponent.set("v.body", []);
        }
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                group: 'package1',
                fieldType: 'lookup',
                'aura:id': 'itemClass',
                fireChangeEvent: true,
                isRequired: true,
                label: $A.get("$Label.EventApi.Select_Package_Item_Class_Event_Builder"),
                value: component.get('v.packageObj'),
                otherAttributes: {
                    type: 'OrderApi__Item_Class__c',
                    filter: 'OrderApi__Is_Active__c = true AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Carrier__c = false AND (NOT Name LIKE \'%Schedule Class\')'
                }
            }, function (cmp) {
                component.set('v.pckgItemClassGlobalId', cmp.getGlobalId());
                cmp.set('v.value', component.get('v.packageObj'));
                var divComponent = component.find("entityDiv");
                divComponent.set("v.body", [cmp]);
            }
        );
    },
    validateForm: function (component) {
        var isFormValid;
        if ($A.util.isUndefinedOrNull(component.get('v.packageObj.isRequired')) || (!$A.util.isUndefinedOrNull(component.get('v.packageObj.isRequired')) &&
                !component.get('v.packageObj.isRequired'))) {
            if (component.get('v.packageObj').type === 'item') {
                component.find('minQuantity').validate();
                component.find('maxQuantity').validate();
                if (!component.find('minQuantity').get('v.validated') || !component.find('maxQuantity').get('v.validated')) {
                    isFormValid = false;
                }
                else if ((component.find('minQuantity').get('v.validated') && component.find('maxQuantity').get('v.validated')) && !$A.util.isUndefinedOrNull(component.get('v.packageObj').maxQuantity) && !$A.util.isUndefinedOrNull(component.get('v.packageObj').minQuantity) &&
                    component.get('v.packageObj').maxQuantity < component.get('v.packageObj').minQuantity) {
                    isFormValid = false;
                    component.find('maxQuantity').setErrorMessages([{message: 'Max Quantity cannot be less than Min Quantity'}])
                }
            }
            else { //itemClass
                component.find('displayName').validate();
                if (!component.find('displayName').get('v.validated')) {
                    isFormValid = false;
                }
            }
        }
        if (!$A.util.isEmpty(component.get('v.packageObj.isRequired')) && component.get('v.packageObj.isRequired') &&
            component.get('v.packageObj.type') === 'item') {
            component.find('minQuantity').validate();
            if (!component.find('minQuantity').get('v.validated')) {
                isFormValid = false;
            }
        }
        if (component.get('v.packageObj').type === 'item') {
            $A.getComponent(component.get('v.pckgItemGlobalId')).validate();
            if (!$A.getComponent(component.get('v.pckgItemGlobalId')).get('v.validated')) {
                isFormValid = false;
            }
        } else {
            $A.getComponent(component.get('v.pckgItemClassGlobalId')).validate();
            if (!$A.getComponent(component.get('v.pckgItemClassGlobalId')).get('v.validated')) {
                isFormValid = false;
            }
        }
        if (isFormValid == undefined) {
            isFormValid = true;
        }

        return isFormValid;
    }
})