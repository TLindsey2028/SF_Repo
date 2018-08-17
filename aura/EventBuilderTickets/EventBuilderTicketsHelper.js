/* global $ */
/* global _ */
({
    _schemas: {
      'ticketBlock': {
        ticketSelected: false,
        name: '',
        blockQuantity: 0,
        uniqueId: '',
        isGroupTicket : false,
        tickets: []
      },
      'ticket': {
        ticketSelected: false,
        name: '',
        quantity: 0,
        isGroupTicket : false
      }
    },
    applySchema: function(arrayOrObject, schemaName) {
      var schema = this._schemas[schemaName] || {};
      var result = _.chain([arrayOrObject])
        .flatten()
        .map(function(obj) {
          return _.extend({}, schema, obj);
        })
        .value();
      return _.isArray(arrayOrObject) ? result : result[0];
    },
    managePackageItems: function (component, itemId,ticketTypeId) {
        component.set('v.packageItemId', null); //force a change in value, in case user selects, then selects same item
        component.set('v.packageItemId', itemId);
        component.find('packageEditor').set('v.secondaryId',ticketTypeId);
        var itemName = _.find(component.get('v.eventObj.ticketTypes'), {ticketTypeItemId: itemId}).ticketName;
        component.set('v.packageItemName', itemName);
        component.set('v.packageModalState', 'show');

        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
    },
    showOtherTab : function(component,event) {
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')+'Label'),'slds-active');
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')),'active');
        $A.util.addClass(component.find(event.target.dataset.tab+'Label'),'slds-active');
        $A.util.addClass(component.find(event.target.dataset.tab),'active');
        component.set('v.currentTabOpen',event.target.dataset.tab);
    },
    activateDeactivateField : function(component,fieldId,clearValue,disable,otherAttributes) {
        if ($A.util.isEmpty(otherAttributes)) {
            otherAttributes = {};
        }
        otherAttributes.disabled = disable;
        component.find(fieldId).setOtherAttributes(otherAttributes,false);
    },
    getRevenueRecognitionRuleSelectOptions : function(component) {
        var action = component.get('c.getRevenueRecognitionRuleOptions');
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                component.find('revenueRecognitionRule').setSelectOptions(JSON.parse(response.getReturnValue()));
            }
        });
        $A.enqueueAction(action);
    },
    getRevenueRecognitionTermRuleSelectOptions : function(component) {
        var action = component.get('c.getRevenueRecognitionTermRuleOptions');
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                component.find('revenueRecognitionTermRule').setSelectOptions(JSON.parse(response.getReturnValue()));
            }
        });
        $A.enqueueAction(action);
    },
    openModal : function(component) {
        var ticketsModal = component.find('ticketsModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(ticketsModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("ticketBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
        component.find('earlyBirdEndDate').clearErrorMessages();
        component.find('revenueRecognitionDate').clearErrorMessages();
        if (!component.get('v.ticketTypeObj').restrictQuantity) {
            component.find('minimumQuantity').clearErrorMessages();
            component.find('maximumQuantity').clearErrorMessages();
        }
        var self = this;
        setTimeout($A.getCallback(function(){
            self.getCustomFields(component);
        }),2000);
    },
    closeModal : function(component) {
        var ticketsModal = component.find('ticketsModal');
        var deleteModal = component.find('deleteModal');
        var modalBackdrop = component.find('modalBackdrop');
        var ticketsMIModal = component.find('manageInventoryModal');

        $A.util.removeClass(ticketsModal, 'slds-fade-in-open');
        $A.util.removeClass(ticketsMIModal, 'slds-fade-in-open');
        deleteModal.hideModal();
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

        component.set('v.packageModalState', 'base');

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
        component.find('saveTicketBlockBtn').stopIndicator();
    },
    resetFormTab : function(component) {
        $A.util.removeClass(component.find('descriptionLabel'),'slds-active');
        $A.util.removeClass(component.find('description'),'active');

        $A.util.removeClass(component.find('ticketAttachFormLabel'),'slds-active');
        $A.util.removeClass(component.find('ticketAttachForm'),'active');

        $A.util.removeClass(component.find('ticketAltPricingLabel'),'slds-active');
        $A.util.removeClass(component.find('ticketAltPricing'),'active');

        $A.util.removeClass(component.find('ticketAccountingLabel'),'slds-active');
        $A.util.removeClass(component.find('ticketAccounting'),'active');

        $A.util.addClass(component.find('descriptionLabel'),'slds-active');
        $A.util.addClass(component.find('description'),'active');
        component.set('v.currentTabOpen','description');
    },
    getTickets : function(component) {
        var self = this;
        var action = component.get('c.getTicketTypeObjs');
        action.setParams({eventId : component.get('v.eventObj').eventId,ticketFilter : component.get('v.eventObj').ticketFilter});
        action.setCallback(this,function(response){
            var eventObj = component.get('v.eventObj');
            eventObj.ticketTypes = JSON.parse(response.getReturnValue());
            component.set('v.eventObj', eventObj);
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
        });
        $A.enqueueAction(action);
    },
    getGLAccountPreferences : function(component) {
        var action = component.get('c.getGLAccountPreferences');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            } else {
                component.set('v.glAccountPrefs', JSON.parse(response.getReturnValue()));
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    validateDeferredRevenue : function(component) {
        if (component.get('v.ticketTypeObj').deferRevenue && ($A.util.isEmpty(component.get('v.ticketTypeObj').deferredRevenueAccount) ||
            component.get('v.ticketTypeObj').deferredRevenueAccount === '')) {
            component.find('deferredRevenueAccount').setErrorMessages([{message : 'Deferred Revenue Account Required'}]);
            return false;
        }
        return true;
    },
    validateTaxClass : function(component) {
        if (component.get('v.ticketTypeObj').isTaxable && ($A.util.isEmpty(component.get('v.ticketTypeObj').taxClass) ||
        component.get('v.ticketTypeObj').taxClass === '')) {
            component.find('taxClass').setErrorMessages([{message : 'Tax Class required if taxable is enabled'}]);
            return false;
        }
        return true;
    },
    validateForm : function (component) {
        var isValidForm = false;
        component.find('ticketName').validate();
        component.find('price').validate();
        if (component.find('ticketName').get('v.validated') &&
            component.find('price').get('v.validated')) {
            isValidForm = true;
        }

        return isValidForm;
    },
    validateEarlyBirdDate : function(component) {
        if (component.get('v.ticketTypeObj').enableEarlyBirdPrice) {
            var earlyBirdDate = new Date(component.get('v.ticketTypeObj').earlyBirdEndDate);
            var eventStartDate = new Date(component.get('v.eventObj').startDate);
            if (!component.get('v.ticketTypeObj').earlyBirdEndDate) {
                component.find('earlyBirdEndDate').setErrorMessages([{message : 'Early Bird date required if Enable Early-Bird Price checked'}]);
                return false;
            }
            else if (earlyBirdDate >= eventStartDate) {
                component.find('earlyBirdEndDate').setErrorMessages([{message : 'Early Bird date should be before event start date'}]);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    validateEarlyBirdPrice : function(component) {
        if (component.get('v.ticketTypeObj').enableEarlyBirdPrice) {
            var earlyBirdPrice = component.get('v.ticketTypeObj').earlyBirdPrice;
            if (!earlyBirdPrice) {
                component.find('earlyBirdPrice').setErrorMessages([{message : 'Price required if Enable Early-Bird Price checked'}]);
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    validateMinMaxTicketQuantity : function(component) {
        if (component.get('v.ticketTypeObj').restrictQuantity) {
            var maximumQuantityCmp = component.find('maximumQuantity'),
                minimumQuantityCmp = component.find('minimumQuantity');
            maximumQuantityCmp.validate();
            minimumQuantityCmp.validate();

            if (!maximumQuantityCmp.get('v.validated') || !minimumQuantityCmp.get('v.validated')) {
                return false;
            }
            var maximumQuantity = component.get('v.ticketTypeObj').maximumQuantity;
            var minimumQuantity = component.get('v.ticketTypeObj').minimumQuantity;
            if (!maximumQuantity) {
                maximumQuantityCmp.setErrorMessages([{message : $A.get("$Label.EventApi.Ticket_Max_Quantity_Validation")}]);
                return false;
            } else if (!minimumQuantity) {
                minimumQuantityCmp.setErrorMessages([{message : $A.get("$Label.EventApi.Ticket_Min_Quantity_Validation")}]);
                return false;
            } else if(maximumQuantity < minimumQuantity) {
                maximumQuantityCmp.setErrorMessages([{message : $A.get("$Label.EventApi.Ticket_Min_Max_Validation")}]);
                return false;
            }
            else {
                return true;
            }
        } else {
            return true;
        }
    },
    validateGroupTicket : function(component) {
        var noErrorFound = true;
        if (component.get('v.ticketTypeObj.isGroupTicketType')) {
            if ($A.util.isEmpty(component.get('v.ticketTypeObj.groupType'))) {
                component.find('groupType').validate();
                noErrorFound = false;
            }
            if ($A.util.isEmpty(component.get('v.ticketTypeObj.numberOfAttendees'))) {
                component.find('numberOfAttendees').validate();
                noErrorFound = false;
            }
        }
        return noErrorFound;
    },
    validateGLAccounts : function(component) {
        if ($A.util.isEmpty(component.get('v.ticketTypeObj.arAccount')) && $A.util.isUndefinedOrNull(component.get('v.glAccountPrefs.arAccountId'))) {
            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.TicketType_No_AR_Account"),false,'error');
            return false;
        }
        else if ($A.util.isEmpty(component.get('v.ticketTypeObj.incomeAccount')) && $A.util.isUndefinedOrNull(component.get('v.glAccountPrefs.incomeAccountId'))) {
            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.TicketType_No_Income_Account"),false,'error');
            return false;
        }
        else if ($A.util.isEmpty(component.get('v.ticketTypeObj.adjustmentAccount')) && $A.util.isEmpty(component.get('v.glAccountPrefs.adjustmentAccountId'))) {
            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.TicketType_No_Adjustment_Account"),false,'error');
            return false;
        }
        else if ($A.util.isEmpty(component.get('v.ticketTypeObj.refundAccount')) && $A.util.isEmpty(component.get('v.glAccountPrefs.refundAccountId'))) {
            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.TicketType_No_Refund_Account"),false,'error');
            return false;
        }
        else {
            return true;
        }
    },
    getTicketBlocks : function (component) {
        var self = this;
        var action = component.get('c.getTicketBlockObjs');
        action.setParams({event : component.get('v.eventObj.eventId')});
        action.setCallback(this,function(response){
            var ticketWrappers = response.getReturnValue();
            component.set('v.ticketsWithBlocks', self.applySchema(ticketWrappers.ticketBlocks, 'ticketBlock'));
            component.set('v.ticketsWithoutBlocks', self.applySchema(ticketWrappers.tickets, 'ticket'));
            self.showMIModal(component);
            self.updateCapacity(component);
            component.find('manageInventoryBtn').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    showMIModal : function (component) {
        var ticketsModal = component.find('manageInventoryModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(ticketsModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    groupSelectedIntoBlock : function (component) {
        var ticketBlock = this.applySchema({}, 'ticketBlock');
        ticketBlock.uniqueId = ActionUtils.generateId(8);
        ticketBlock.tickets = [];
        var ticketsWithoutBlocks = [];
        component.get('v.ticketsWithoutBlocks').forEach(function(element){
            if (element.ticketSelected) {
                element.ticketSelected = false;
                ticketBlock.tickets.push(element);
            }
            else {
                ticketsWithoutBlocks.push(element);
            }
        });
        component.find('groupSelectedBtn').set('v.disable',true);
        var blocks = component.get('v.ticketsWithBlocks');
        blocks.push(ticketBlock);
        component.set('v.ticketsWithoutBlocks',ticketsWithoutBlocks);
        component.set('v.ticketsWithBlocks',blocks);
        this.updateCapacity(component);

    },
    unGroupTicketBlock : function (component) {
        var ticketBlocks = [];
        var tickets = _.cloneDeep(component.get('v.ticketsWithoutBlocks'));
        var self = this;
        component.get('v.ticketsWithBlocks').forEach(function(element){
            if (element.ticketSelected) {
                if (!$A.util.isEmpty(element.tickets)) {
                    element.tickets.forEach(function(ticketElement,index){
                       tickets.push(self.applySchema(element.tickets[index], 'ticket'));
                    });
                }
            }
            else {
                ticketBlocks.push(element);
            }
        });
        this.enableDisableBlockAddButtons(component,true);
        component.find('unGroupSelectedBtn').set('v.disable',true);
        component.set('v.ticketsWithoutBlocks',tickets);
        component.set('v.ticketsWithBlocks',ticketBlocks);
        this.updateCapacity(component);
    },
    enableDisableBlockAddButtons : function(component,disable) {
        var buttons = component.find('addSelectedTTTOBlock');
        if (!$A.util.isEmpty(buttons)) {
            if (!_.isArray(buttons)) {
                buttons = [buttons];
            }
            buttons.forEach(function(element){
                if (disable) {
                    element.getElement().setAttribute('disabled', disable);
                }
                else {
                    element.getElement().removeAttribute('disabled');
                }
            });
        }
    },
    addToSelectedTicketBlock : function (component,event) {
        var self = this;
        var blocks = _.cloneDeep(component.get('v.ticketsWithBlocks'));
        var tickets = _.cloneDeep(component.get('v.ticketsWithoutBlocks'));
        var updatedTickets = [];
        blocks.forEach(function(element,index){
           if (element.uniqueId === event.currentTarget.dataset.id) {
               tickets.forEach(function(ticketElement){
                   if (ticketElement.ticketSelected) {
                        blocks[index].tickets.push(ticketElement);
                   }
                   else {
                       updatedTickets.push(ticketElement);
                   }
               });
           }
        });
        component.set('v.ticketsWithBlocks',blocks);
        component.set('v.ticketsWithoutBlocks',updatedTickets);
        component.find('groupSelectedBtn').set('v.disable',true);
        self.updateCapacity(component);
    },
    removeTicketFromBlock : function(component,ticketToRemove) {
        var tickets = _.cloneDeep(component.get('v.ticketsWithoutBlocks'));
        var blocks = _.cloneDeep(component.get('v.ticketsWithBlocks'));
        var self = this;
        blocks.forEach(function(element,index){
            element.tickets.forEach(function(ticketElement,innerIndex){
                if (ticketToRemove === ticketElement.id) {
                  tickets.push(self.applySchema(ticketElement, 'ticket'));
                  blocks[index].tickets.splice(innerIndex,1);
                  if (blocks[index].tickets.length === 0) {
                      blocks.splice(index,1);
                      component.find('unGroupSelectedBtn').set('v.disable',true);
                  }
                }
            });
        });

        _.forEach(tickets, function(ticket) {
            if (ticketToRemove === ticket.id) {
                ticket.ticketSelected = false;
            }
        })

        component.set('v.ticketsWithBlocks',blocks);
        component.set('v.ticketsWithoutBlocks',tickets);
        self.updateCapacity(component);
    },
    saveTicketBlocks : function (component) {
        var blockNames = component.find('name');
        var blockQuantities = component.find('blockQuantity');
        var quantities = component.find('quantity');
        var isValid = true;

        if (!$A.util.isEmpty(blockNames) && !$A.util.isEmpty(blockQuantities)) {
            if (!_.isArray(blockNames)) {
                blockNames = [blockNames];
            }
            if (!_.isArray(blockQuantities)) {
                blockQuantities = [blockQuantities];
            }
            blockNames.forEach(function (element) {
                element.validate();
                if (!element.get('v.validated')) {
                    isValid = false;
                }
            });
            blockQuantities.forEach(function (element) {
                element.validate();
                if (!element.get('v.validated')) {
                    isValid = false;
                }
            });
        }
        if (!$A.util.isEmpty(quantities)) {
            if (!_.isArray(quantities)) {
                quantities = [quantities];
            }

            quantities.forEach(function (element) {
                element.validate();
                if (!element.get('v.validated')) {
                    isValid = false;
                }
                else if ($A.util.isUndefinedOrNull(element.get('v.value.quantity')) || element.get('v.value.quantity') === 0 || isNaN(element.get('v.value.quantity'))) {
                    element.setErrorMessages([{message : 'Input must be greater than: 0'}]);
                    isValid = false;
                }
            });
        }
        if (isValid) {
            var ticketWrapperObj = {
                tickets : component.get('v.ticketsWithoutBlocks'),
                ticketBlocks : component.get('v.ticketsWithBlocks')
            };

            var action = component.get('c.saveTicketsAndBlocks');
            action.setParams({ticketWrapperObjJSON : JSON.stringify(ticketWrapperObj)});
            action.setCallback(this,function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error) {
                        if (error.message.includes($A.get("$Label.EventApi.Ticket_Quantity_WaitList_Entry"))) {
                            component.find('toastMessages').showMessage('',$A.get("$Label.EventApi.Ticket_Quantity_WaitList_Entry"),false,'error','topCenter');
                        } else {
                            component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                        }
                    });
                    component.find('saveTicketBlockBtn').stopIndicator();
                }
                else {
                    var eventCapacity = response.getReturnValue();
                    component.set('v.eventCapacity', eventCapacity);
                    var reloadEvent = $A.get('e.EventApi:reloadEventCapacity');
                    reloadEvent.setParams({eventQuantity: eventCapacity});
                    reloadEvent.fire();
                    // Force reload seating sections
                    var compEvent = $A.get('e.EventApi:ReloadSectionListing');
                    if (!$A.util.isEmpty(compEvent)) {
                        compEvent.setParams({force: true});
                        compEvent.fire();
                    }

                    this.closeModal(component);
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveTicketBlockBtn').stopIndicator();
        }
    },
    updateSharingForLookups : function (component) {
        component.find('taxClass').setOtherAttributes({filter : "OrderApi__Is_Tax__c = true AND OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('deferredRevenueAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('incomeAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('arAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('refundAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('adjustmentAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
    },
	updateTicketQuantityRestriction : function(component) {
        var maximumQuantity = component.get('v.ticketTypeObj').maximumQuantity;
        var minimumQuantity = component.get('v.ticketTypeObj').minimumQuantity;
        var otherAttributes = {min: minimumQuantity, max: maximumQuantity};

        if (component.get('v.ticketTypeObj').restrictQuantity) {
            this.activateDeactivateField(component,'maximumQuantity',false,null, otherAttributes);
            this.activateDeactivateField(component,'minimumQuantity',false,null, otherAttributes);
        }
        else {
            this.activateDeactivateField(component,'maximumQuantity',true,true, otherAttributes);
            this.activateDeactivateField(component,'minimumQuantity',true,true, otherAttributes);
            component.find('maximumQuantity').updateValue(null,false);
            component.find('minimumQuantity').updateValue(null,false);
        }
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('ticketsUIApi').getFieldsFromLayout('EventApi__Ticket_Type__c');
        }
    },
    createTicketImage: function (component) {
        var otherAttributes = {
            showPreview: true,
            previewWidth: '100',
            maximumFileSize: 5242880,
            allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/tiff"],
            croppingParams: {
                enableExif: true,
                viewport: {
                    width: 100,
                    height: 100,
                    type: 'square'
                },
                boundary: {
                    width: 640,
                    height: 300
                }
            },
            croppingResultParams: {
                type: "blob",
                size: {width: 100, height: 100},
                format: "jpeg",
                circle: false
            },
            allowCropping: true,
            additionalModalClass: 'ticket-image-modal'
        };
        component.find('ticketImageUrl').setOtherAttributes(otherAttributes);
    },
    updateCapacity : function(component) {
        var self = this;
        var eventCapacity = 0;
        component.get('v.ticketsWithBlocks').forEach(function(withBlockElement) {
            var blockQuantity = parseInt(self.checkforNan(withBlockElement.blockQuantity),10)
            eventCapacity += blockQuantity;
        });
        component.get('v.ticketsWithoutBlocks').forEach(function(withoutBlockElement) {
            if (withoutBlockElement.isActiveTT) {
                var withoutBlockQuantity = parseInt(self.checkforNan(withoutBlockElement.quantity),10)
                if (withoutBlockElement.isGroupTicket) {
                    var groupTicketMaxAttendees = parseInt(self.checkforNan(withoutBlockElement.groupTicketMaxAttendees),10);
                    eventCapacity += (withoutBlockQuantity * groupTicketMaxAttendees);
                } else {
                    eventCapacity += withoutBlockQuantity;
                }
            }
        });
        component.set('v.eventCapacity', eventCapacity);
    },
    checkforNan : function(quantityValue) {
        return quantityValue = isNaN(quantityValue) ? 0 : quantityValue;
    }
})