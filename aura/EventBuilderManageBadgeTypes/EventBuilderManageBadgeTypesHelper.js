({
    rebuildDragNDrop : function(component,otherAttributes,showModal) {
        var self = this;
        this.buildAvailableSelectedValues(component,otherAttributes);
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                fieldType: 'multidragdrop',
                'aura:id': 'badgesDragDrop',
                label: '',
                labelStyleClasses: ' hidden',
                value: component.get('v.existingBadgesObj'),
                otherAttributes: otherAttributes
            },
            function (cmp) {
                cmp.set('v.value', component.get('v.existingBadgesObj'));
                cmp.setOtherAttributes(otherAttributes);
                var divComponent = component.find("manageBadgesDiv");
                divComponent.set('v.body', [cmp]);
                if (showModal) {
                    self.openModal(component);
                }
            }
        );
    },
    buildAvailableSelectedValues : function (component,otherAttributes) {
        otherAttributes.availableValues = [];
        otherAttributes.selectedValues = [];
        var badgeTypesWrapperObj = component.get('v.badgeTypesWrapperObj');
        if (!$A.util.isEmpty(badgeTypesWrapperObj)) {
            badgeTypesWrapperObj.badgeTypes.forEach(function (badgeType) {
                var alreadySelected = false;
                badgeTypesWrapperObj.badgeWorkflows.forEach(function (badgeWorkflow) {
                    if (badgeWorkflow.badgeTypeId === badgeType.id) {
                        otherAttributes.selectedValues.push({label: badgeType.name, value: badgeType.id});
                        alreadySelected = true;
                    }
                });
                if (!alreadySelected) {
                    otherAttributes.availableValues.push({label: badgeType.name, value: badgeType.id});
                }
            });
        }
    },
    openModal : function (component) {
        var manageBadgeTypesModal = component.find('manageBadgeTypesModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(manageBadgeTypesModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    closeModal : function (component) {
        var manageBadgeTypesModal = component.find('manageBadgeTypesModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(manageBadgeTypesModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    doInit : function (component,showModal,showDragnDrop) {
        component.set('v.badgeTypeObj',{});
        var action = component.get('c.getBadgeTypes');
        action.setParams({itemId : component.get('v.ticketTypeId')});
        action.setCallback(this,function(result){
            var badgeTypeObj = result.getReturnValue();
            component.set('v.badgeTypesWrapperObj',badgeTypeObj);
            if (showDragnDrop) {
                this.rebuildDragNDrop(component, {
                    firstListName: 'Available Badges',
                    secondListName: 'Selected Badges'
                }, showModal);
            }
            if (!component.get('v.customFieldsFound')) {
                component.find('badgesApi').getFieldsFromLayout('OrderApi__Badge_Type__c');
            }
        });
        $A.enqueueAction(action);
    },
    createBadgeWorkflows : function (component) {
        var action = component.get('c.saveBadgeWorkflows');
        action.setParams({workflowStr : JSON.stringify(component.get('v.existingBadgesObj.badgesDragDrop')),itemId : component.get('v.ticketTypeId'),itemName : component.get('v.ticketTypeName')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                this.closeModal(component);
            }
            component.find('createBadgeWorkflowsBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    createBadgeType : function (component) {
        var validated = CustomFieldUtils.validateCustomFields(component,'customField');
        if (validated) {
            var badgeTypeObj = component.get('v.badgeTypeObj');
            badgeTypeObj = CustomFieldUtils.cleanUpCustomFields(badgeTypeObj);
            var action = component.get('c.saveBadgeTypeObj');
            action.setParams({badgeTypeStr : JSON.stringify(badgeTypeObj),itemId : component.get('v.ticketTypeId'),itemName : component.get('v.ticketTypeName')});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('saveBadgeTypeBtn').stopIndicator();
                }
                else {
                    component.set('v.existingBadges',true);
                    this.doInit(component,false,true);
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveBadgeTypeBtn').stopIndicator();
        }
    }
})