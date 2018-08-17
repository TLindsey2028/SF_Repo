/* global svg4everybody */
/* global $ */
/* global _ */
({
	doInit : function(component, event, helper) {
		component.set('v.ticketTypeObj',{
			earlyBirdEndDate : moment(new Date(component.get('v.eventObj.ticketSalesStartDate'))).format('YYYY-MM-DD'),
			ticketName : null,
			price : null,
			ticketQuantity : null,
			isActive : true,
            isPublished : false,
			isTaxable : false,
			deferRevenue : false,
            enableRefundRequest : false,
            refundRequestPolicy : '',
            ticketInformation : '',
			ticketImageUrl : '',
			termInMonths : null,
			revenueRecognitionRule : '--None--',
			revenueRecognitionTermRule : '--None--',
			deferredRevenueAccount : '',
			taxClass : '',
			arAccount : '',
			incomeAccount : '',
			refundAccount : '',
			adjustmentAccount : '',
			form : '',
			isGroupTicketType : false,
            customFields : {}
		});
		helper.getTickets(component);
		helper.getRevenueRecognitionRuleSelectOptions(component);
		helper.getRevenueRecognitionTermRuleSelectOptions(component);
		helper.getGLAccountPreferences(component);
		helper.createTicketImage(component);
	},
    managePackageItems: function(cmp, event, helper) {
		helper.managePackageItems(cmp, event.currentTarget.dataset.id,event.currentTarget.dataset.tt);
	},
	addNewTicket : function (component, event, helper) {
        helper.getCustomFields(component);
		var ttObj = {
			earlyBirdEndDate : moment(new Date(component.get('v.eventObj.ticketSalesStartDate'))).format('YYYY-MM-DD'),
			ticketName : null,
			price : null,
			ticketQuantity : null,
			isActive : true,
            isPublished : false,
			isTaxable : false,
			deferRevenue : false,
            enableRefundRequest : false,
            refundRequestPolicy : '',
			ticketImageUrl : '',
            ticketInformation : '',
            termInMonths : null,
			revenueRecognitionRule : '--None--',
			revenueRecognitionTermRule : '--None--',
			deferredRevenueAccount : '',
			taxClass : '',
			arAccount : '',
			incomeAccount : '',
			refundAccount : '',
			adjustmentAccount : '',
			form : '',
			isGroupTicketType : false,
            customFields : {},
            customFieldValues : {}
		};

		var compEvents = $A.get('e.Framework:RefreshInputField');
		compEvents.setParams({group : 'ticketTypeBuilder',refresh : true , data : ttObj});
		compEvents.fire();
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'ticketTypeBuilderCustomFields',refresh : true , data : ttObj.customFieldValues});
        compEvents.fire();

		component.find('taxClass').setOtherAttributes({disabled : true},false);
        component.find('deferredRevenueAccount').updateValue(null);
		component.find('taxClass').updateValue(null);
		component.find('arAccount').updateValue(null);
		component.find('incomeAccount').updateValue(null);
		component.find('refundAccount').updateValue(null);
		component.find('form').updateValue(null);
		component.find('adjustmentAccount').updateValue(null);
		helper.updateSharingForLookups(component);
		helper.resetFormTab(component);
		helper.openModal(component);
		component.set('v.ticketTypeObj',ttObj);

		component.set('v.modalState',$A.get("$Label.EventApi.Create_Ticket_Type_Event_Builder"));
	},
	closeModal : function (component, event, helper) {
		helper.closeModal(component);
	},
	changeTab : function (component,event,helper) {
		if (component.get('v.currentTabOpen') === 'description') {
			if (helper.validateForm(component)) {
				helper.showOtherTab(component,event);
			}
		}
        else if (component.get('v.currentTabOpen') === 'ticketAltPricing') {
            if (helper.validateEarlyBirdDate(component) && helper.validateEarlyBirdPrice(component)) {
                helper.showOtherTab(component,event);
            }
        }
		else if (component.get('v.currentTabOpen') === 'ticketAccounting') {
			var deferredRev = helper.validateDeferredRevenue(component);
			var taxValidation = helper.validateTaxClass(component);
			if (deferredRev && taxValidation) {
				helper.showOtherTab(component, event);
			}
		}
		else {
			helper.showOtherTab(component,event);
		}
	},
	handleFieldUpdateEvent : function(component,event,helper) {
		if (event.getParam('fieldId') === 'restrictQuantity') {
		    helper.updateTicketQuantityRestriction(component);
		}
        else if (event.getParam('fieldId') === 'isGroupTicketType') {
            if (component.get('v.ticketTypeObj').isGroupTicketType) {
                helper.activateDeactivateField(component,'groupType',false,null,{min : 1});
                helper.activateDeactivateField(component,'numberOfAttendees',false,null,{min : 1});
            }
            else {
                helper.activateDeactivateField(component,'groupType',true,true,{min : 1});
                helper.activateDeactivateField(component,'numberOfAttendees',true,true,{min : 1});
                component.find('groupType').updateValue(null,false);
                component.find('numberOfAttendees').updateValue(null,false);
            }
        }
        else if (event.getParam('fieldId') === 'enableRefundRequest') {
            if (component.get('v.ticketTypeObj').enableRefundRequest) {
					helper.activateDeactivateField(component,'refundRequestPolicy',false,null,{});
            }
            else {
                helper.activateDeactivateField(component,'refundRequestPolicy',true,true,{});
                component.find('refundRequestPolicy').updateValue(null,false);
            }
        }
		else if (event.getParam('fieldId') === 'price') {
			component.find('listPriceOutput').updateValue(component.get('v.ticketTypeObj').price);
		}
		else if (event.getParam('fieldId') === 'isTaxable') {
			if (component.get('v.ticketTypeObj').isTaxable) {
				helper.activateDeactivateField(component,'taxClass',false,null);
			}
			else {
				helper.activateDeactivateField(component,'taxClass',true,true);
				component.find('taxClass').clearErrorMessages();
			}
		}
		else if (event.getParam('fieldId') === 'enableEarlyBirdPrice') {
			if (component.get('v.ticketTypeObj').enableEarlyBirdPrice) {
				helper.activateDeactivateField(component,'earlyBirdPrice',false,null,{min : 0});
				helper.activateDeactivateField(component,'earlyBirdEndDate',false,null);
				component.find('earlyBirdEndDate').set('v.isRequired',true);
				component.find('earlyBirdPrice').set('v.isRequired',true);
			}
			else {
				helper.activateDeactivateField(component,'earlyBirdPrice',true,true);
				helper.activateDeactivateField(component,'earlyBirdEndDate',true,true);
				component.find('earlyBirdPrice').updateValue(null,false,{min : 0});
				component.find('earlyBirdEndDate').updateValue(null,false);
				component.find('earlyBirdEndDate').set('v.isRequired',false);
				component.find('earlyBirdPrice').set('v.isRequired',false);
			}
		}
		else if (event.getParam('fieldId') === 'enableOnSitePrice') {
			if (component.get('v.ticketTypeObj').enableOnSitePrice) {
				helper.activateDeactivateField(component,'onSitePrice',false,null,{min : 0});
			}
			else {
				helper.activateDeactivateField(component,'onSitePrice',true,true,{min : 0});
				component.find('onSitePrice').updateValue(null,false);
			}
		}
		else if (event.getParam('fieldId') === 'deferRevenue') {
			if (component.get('v.ticketTypeObj').deferRevenue) {
				helper.activateDeactivateField(component,'termInMonths',false,null,{min : 0});
				helper.activateDeactivateField(component,'revenueRecognitionRule',false,null);
				helper.activateDeactivateField(component,'revenueRecognitionDate',false,null);
				helper.activateDeactivateField(component,'revenueRecognitionTermRule',false,null);
				helper.activateDeactivateField(component,'flexDayOfMonth',false,null,{min : 0, max : 31});
				helper.activateDeactivateField(component,'deferredRevenueAccount',false,null);
			}
			else {
				helper.activateDeactivateField(component,'termInMonths',true,true,{min : 0});
				helper.activateDeactivateField(component,'revenueRecognitionRule',false,true);
				helper.activateDeactivateField(component,'revenueRecognitionDate',true,true);
				helper.activateDeactivateField(component,'revenueRecognitionTermRule',false,true);
				helper.activateDeactivateField(component,'flexDayOfMonth',true,true,{min : 0,max : 32});
				helper.activateDeactivateField(component,'deferredRevenueAccount',true,true);
				component.find('deferredRevenueAccount').clearErrorMessages();
			}
		}
		else if (event.getParam('fieldId') === 'ticketFilter') {
			helper.getTickets(component);
		}
		else if (event.getParam('fieldId') === 'enableRegistrationGroups') {
			if (component.get('v.eventObj').enableRegistrationGroups) {
				helper.activateDeactivateField(component,'groupRegistrationInstructions',false,null);
			}
			else {
				helper.activateDeactivateField(component,'groupRegistrationInstructions',true,true);
			}
		}
		else if (event.getParam('fieldId') === 'ticketSelected' && event.getParam('group') === 'ticketBlockGroup') {
            var atLeastOneTicketBlockSelected = _.some(component.get('v.ticketsWithBlocks'), {ticketSelected: true});
            if (atLeastOneTicketBlockSelected) {
                component.find('unGroupSelectedBtn').set('v.disable',false);
            }
            else {
                component.find('unGroupSelectedBtn').set('v.disable',true);
            }
		}
        else if (event.getParam('fieldId') === 'ticketSelected' && event.getParam('group') === 'nonTicketBlockGroup') {
            var atLeastOneTicketSelected = _.some(component.get('v.ticketsWithoutBlocks'), {ticketSelected: true});
            if (atLeastOneTicketSelected) {
				component.find('groupSelectedBtn').set('v.disable',false);
                helper.enableDisableBlockAddButtons(component,false);
			}
			else {
                component.find('groupSelectedBtn').set('v.disable',true);
                helper.enableDisableBlockAddButtons(component,true);
			}
        }
        else if (event.getParam('fieldId') === 'quantity' || event.getParam('fieldId') === 'blockQuantity') {
            helper.updateCapacity(component);
        }
	},
	createForm : function(component) {
		var action = component.get('c.getFormUrlPrefix');
		action.setCallback(this,function(response){
            UrlUtil.navToUrl(response.getReturnValue(),
                '_blank');
		});
		$A.enqueueAction(action);
	},
	editTicketType : function(component,event,helper) {
        helper.getCustomFields(component);
		var objToEdit = null;
		var objects = JSON.parse(JSON.stringify(component.get('v.eventObj').ticketTypes));
		objects.forEach(function(element){
			if (element.ticketTypeId === event.target.dataset.id) {
				objToEdit = element;
			}
		});
		if (!$A.util.isEmpty(objToEdit)) {
			helper.resetFormTab(component);
			component.set('v.ticketTypeObj',objToEdit);
			if ($A.util.isEmpty(objToEdit.isTaxable) || objToEdit.isTaxable === false) {
				component.find('taxClass').setOtherAttributes({disabled : true},false);
			}
			else {
				component.find('taxClass').setOtherAttributes({disabled : null},false);
			}
			var compEvent = $A.get('e.Framework:RefreshInputField');
			compEvent.setParams({group : 'ticketTypeBuilder', type: 'value', data : objToEdit});
			compEvent.fire();
            CustomFieldUtils.preFormatCustomFieldValues(objToEdit.customFields);
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : 'ticketTypeBuilderCustomFields', type: 'value', data : objToEdit.customFields});
            compEvent.fire();
            helper.updateSharingForLookups(component);
            helper.updateTicketQuantityRestriction(component);
            component.find('deferredRevenueAccount').updateValue(objToEdit.deferredRevenueAccount);
            component.find('taxClass').updateValue(objToEdit.taxClass);
            component.find('arAccount').updateValue(objToEdit.arAccount);
            component.find('incomeAccount').updateValue(objToEdit.incomeAccount);
            component.find('refundAccount').updateValue(objToEdit.refundAccount);
            component.find('adjustmentAccount').updateValue(objToEdit.adjustmentAccount);
            component.find('form').updateValue(objToEdit.form);
            setTimeout($A.getCallback(function(){
                helper.openModal(component);
			}),1500);
		}
		component.set('v.modalState',$A.get("$Label.EventApi.Edit_Ticket_Type_Event_Builder"));
	},
	deleteTicketType : function(component,event,helper) {
		var action = component.get('c.deleteTicketTypeObj');
		action.setParams({ticketTypeId : component.get('v.ticketIdToDelete'),eventId :component.get('v.eventObj').eventId, ticketFilter: component.get('v.eventObj').ticketFilter});
		action.setCallback(this,function(response){
		    if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');

                });
                helper.closeModal(component);
            } else {
			var eventObj = component.get('v.eventObj');
			var responseObj = JSON.parse(response.getReturnValue());
			eventObj.ticketTypes = responseObj.ticketTypes;
			component.set('v.eventObj',eventObj);
			//update capacity
			component.set('v.eventCapacity', responseObj.ticketQuantity);
            var reloadEvent = $A.get('e.EventApi:reloadEventCapacity');
            reloadEvent.setParams({eventQuantity: responseObj.ticketQuantity});
            reloadEvent.fire();
            helper.closeModal(component);
            }
		});
		$A.enqueueAction(action);
	},
	deleteTicketTypePrompt : function(component, event, helper) {
		var deleteModal = component.find('deleteModal');
		var modalBackdrop = component.find('modalBackdrop');
		deleteModal.showModal();
		component.set('v.ticketIdToDelete',event.target.dataset.id);
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
	},
	saveTicketTypeObj : function(component,event,helper) {
		component.find('ticketTypeSaveModalButton').startIndicator();
		var ticketTypeObj = component.get('v.ticketTypeObj');
		ticketTypeObj.eventId = component.get('v.eventObj').eventId;
		if (isNaN(ticketTypeObj.earlyBirdPrice)) {
			ticketTypeObj.earlyBirdPrice = 0;
		}

		if (ticketTypeObj.price === 0) {
			component.find('price').updateValue('0.00');
		}
		var formValidation = helper.validateForm(component);
		var deferredRevenueValidation = helper.validateDeferredRevenue(component);
		var taxClassValidation = helper.validateTaxClass(component);
		var earlyBirdDateValidation = helper.validateEarlyBirdDate(component);
		var earlyBirdPriceValidation = helper.validateEarlyBirdPrice(component);
		var minMaxTicketQuantityValidation = helper.validateMinMaxTicketQuantity(component);
		var validateGroupTicket = helper.validateGroupTicket(component);
		var glAccountValidation = helper.validateGLAccounts(component);
		var customFieldValidation = CustomFieldUtils.validateCustomFields(component,'customField');
		if (customFieldValidation && formValidation && deferredRevenueValidation && taxClassValidation && earlyBirdDateValidation && earlyBirdPriceValidation && minMaxTicketQuantityValidation && validateGroupTicket && glAccountValidation) {
            ticketTypeObj = CustomFieldUtils.cleanUpCustomFields(ticketTypeObj);
			var action = component.get('c.saveTicketType');
			action.setParams({ticketTypeWrapperJSON: JSON.stringify(ticketTypeObj), eventId: ticketTypeObj.eventId, ticketFilter: component.get('v.eventObj').ticketFilter});
			action.setCallback(this, function (response) {
				if (response.getState() === 'SUCCESS') {
				    var responseObj = JSON.parse(response.getReturnValue());
					var eventObj = component.get('v.eventObj');
					eventObj.ticketTypes = responseObj.ticketTypes;
					component.set('v.eventObj', eventObj);
					//update capacity
					component.set('v.eventCapacity', responseObj.ticketQuantity);
					var reloadEvent = $A.get('e.EventApi:reloadEventCapacity');
                    reloadEvent.setParams({eventQuantity: responseObj.ticketQuantity});
                    reloadEvent.fire();
					var compEvent = $A.get('e.EventApi:AddSelectorEvent');
					compEvent.setParams({
						operation: 'remove',
						classes: 'slds-sidebar--modal-open',
						idTarget: ['side-nav-div', 'topNavDiv']
					});
					compEvent.fire();
					helper.closeModal(component);
					component.find('ticketTypeSaveModalButton').stopIndicator();
				}
				else {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('ticketTypeSaveModalButton').stopIndicator();
				}
			});
			$A.enqueueAction(action);
		}
		else {
			component.find('ticketTypeSaveModalButton').stopIndicator();
		}
	},
    editPriceRules : function (component,event) {
        UrlUtil.navToUrl('/apex/OrderApi__pricerule?id='+event.currentTarget.dataset.prid+'&retURL=/'+encodeURIComponent(UrlUtil.addSitePrefix('/'+event.currentTarget.dataset.id)),'_blank');
	},
	validate : function(component) {
		if (!$A.util.isEmpty(component.get('v.eventObj.ticketSalesStartDate'))) {
            if (new Date(component.get('v.eventObj.endDate').replace(/-/g,'/')) >= new Date(component.get('v.eventObj.ticketSalesStartDate').replace(/-/g,'/'))) {
              component.set('v.validated',true);
            }
            else {
                component.set('v.validated',false);
                component.find('toastMessages').showMessage('','Ticket Sales Start Date Cannot Be After Event End Date',false,'error');
            }
		}
	},
    showInventoryModal : function (component,event,helper) {
 		helper.getTicketBlocks(component);
	},
    removeTicketFromBlock : function (component,event,helper) {
		var ticketTypeId = event.currentTarget.dataset.ticketid;
		helper.removeTicketFromBlock(component,ticketTypeId);
	},
    groupSelectedIntoBlock : function (component,event,helper) {
		helper.groupSelectedIntoBlock(component);
	},
    unGroupTicketBlock : function (component,event,helper) {
        helper.unGroupTicketBlock(component);
    },
    addToSelectedTicketBlock : function (component,event,helper) {
		helper.addToSelectedTicketBlock(component,event);
	},
    saveTicketBlocks : function (component,event,helper) {
		helper.saveTicketBlocks(component);
	},
    manageBadgeTypes : function (component,event) {
		component.find('manageBadgeTypes').set('v.ticketTypeName',event.currentTarget.dataset.name);
        component.find('manageBadgeTypes').set('v.ticketTypeId',event.currentTarget.dataset.id);
        component.find('manageBadgeTypes').showModal();
	},
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'registrationInstructions' || event.getParam('fieldId') === 'groupRegistrationInstructions') {
            if (event.getParam('action') === 'open') {
                var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                compEvent.setParams({
                    operation: 'add',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent.fire();
            }
            else {
                var compEvent2 = $A.get('e.EventApi:AddSelectorEvent');
                compEvent2.setParams({
                    operation: 'remove',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent2.fire();
            }
        }
    },
    handleUIApiResponseEvent : function (component,event) {
        if (event.getParam('uniqueId') === 'tickets') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'tickets',false);
            component.set('v.customFields', customFields);
        }
	},
	handleFileUploadCropEvent: function (component, event) {
        if (event.getParam('fieldId') === 'ticketImageUrl')  {
            var modal = component.find('ticketsModal');
            if (event.getParam('action') === 'open') {
               $A.util.addClass(modal,'active');
            }
            else {
               $A.util.removeClass(modal,'active');
            }
        }
    }
})