/* global svg4everybody */
({
    doInit : function(component, event, helper) {
		component.set('v.sponsorPackageObj', helper.applySchema({}, 'sponsorPackage'));
		helper.getRevenueRecognitionRuleSelectOptions(component);
		helper.getRevenueRecognitionTermRuleSelectOptions(component);
        if (!$A.util.isEmpty(component.get('v.eventObj.sponsorPackages')) &&
            component.get('v.eventObj.sponsorPackages').length  > 0) {
            helper.sortableOrder(component);
        }
        component.find('imageURL').setOtherAttributes({
            maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                viewport: {
                    width: 300,
                    height: 300,
                    type: 'square'
                },
                boundary: {
                    width: 400,
                    height: 400
                }
            },
            croppingResultParams : {
                type: "blob",
                size: {width : 300, height : 300},
                format : "jpeg",
                circle : false
            },
            allowCropping : true,
            additionalModalClass : 'sponsor-image-modal'});
        helper.getSponsorPackages(component);
    },

    addNewPackage : function (component, event, helper) {
        var spckgObj = helper.applySchema({}, 'sponsorPackage');
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'packageBuilder',refresh : true , data : spckgObj});
        compEvents.fire();
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'sponsorPackageBuilderCustomFields',refresh : true , data : {}});
        compEvents.fire();
        component.find('taxClass').setOtherAttributes({disabled : true},false);
        helper.resetFormTab(component);
        helper.updateSharingForLookups(component);
        helper.openModal(component);
        component.set('v.sponsorPackageObj',spckgObj);
        component.set('v.modalState',$A.get("$Label.EventApi.Create_Sponsor_Package_Event_Builder"));
    },
    deleteSponsorPackagePrompt : function(component, event, helper) {
		var deleteModal = component.find('deleteModal');
		var modalBackdrop = component.find('modalBackdrop');
		deleteModal.showModal();
		component.set('v.sponsorPackageIdToDelete',event.target.dataset.id);
		var compEvent = $A.get('e.EventApi:AddSelectorEvent');
		compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
		compEvent.fire();
    },
    deleteSponsorPackage : function(component,event,helper) {
        var action = component.get('c.deleteSponsorPackageObj');
        action.setParams({sponsorPackageId : component.get('v.sponsorPackageIdToDelete'),eventId :component.get('v.eventObj').eventId});
        action.setCallback(this,function(response){
            var eventObj = component.get('v.eventObj');
            eventObj.sponsorPackages = JSON.parse(response.getReturnValue());
            component.set('v.eventObj',eventObj);
            helper.closeModal(component);
        });
        $A.enqueueAction(action);
    },
    closeModal : function (component, event, helper) {
        helper.closeModal(component);
    },
    createForm : function(component) {
        var action = component.get('c.getFormUrlPrefix');
        action.setCallback(this,function(response){
            UrlUtil.navToUrl(
                response.getReturnValue(),
                '_blank'
            );
        });
        $A.enqueueAction(action);
    },
    saveSponsorPackageObj : function(component, event, helper) {
        component.find('sponsorPackageSaveModalButton').startIndicator();
		var sponsorPackageObj = component.get('v.sponsorPackageObj');
		sponsorPackageObj.eventId = component.get('v.eventObj').eventId;
		if (sponsorPackageObj.price === 0) {
			component.find('price').updateValue('0.00');
		}
		var formValidation = helper.validateForm(component);
		var deferredRevenueValidation = helper.validateDeferredRevenue(component);
		var taxClassValidation = helper.validateTaxClass(component);
		if (formValidation && deferredRevenueValidation && taxClassValidation) {
            sponsorPackageObj = CustomFieldUtils.cleanUpCustomFields(sponsorPackageObj);
			var setSponsorSales = false;
			if ($A.util.isEmpty(component.get('v.eventObj.sponsorPackages'))) {
                setSponsorSales = true;
                component.find('enableSponsorSales').updateValue(true);
            }
			var action = component.get('c.saveSponsorPackage');
			action.setParams({
			    sponsorPackageWrapperJSON: JSON.stringify(sponsorPackageObj),
			    eventId: sponsorPackageObj.eventId,
			    setSponsorSales: setSponsorSales
            });
			action.setCallback(this, function (response) {
				if (response.getState() === 'SUCCESS') {
					var responseObj = JSON.parse(response.getReturnValue());
					if (!$A.util.isEmpty(responseObj.error)) {
                        component.find('toastMessages').showMessage('',responseObj.error,false,'error');
                    }
                    else {
                        var eventObj = component.get('v.eventObj');
                        eventObj.sponsorPackages = responseObj;
                        component.set('v.eventObj', eventObj);
                        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                        compEvent.setParams({
                            operation: 'remove',
                            classes: 'slds-sidebar--modal-open',
                            idTarget: ['side-nav-div', 'topNavDiv']
                        });
                        compEvent.fire();
                        helper.closeModal(component);
                        helper.sortableOrder(component);
                    }
					component.find('sponsorPackageSaveModalButton').stopIndicator();
				}
			});
			$A.enqueueAction(action);
		}
		else {
			component.find('sponsorPackageSaveModalButton').stopIndicator();
		}
    },
    editSponsorPackage : function(component,event,helper) {
        var objToEdit = null;
        var objects = JSON.parse(JSON.stringify(component.get('v.eventObj').sponsorPackages));
        objects.forEach(function(element){
            if (element.sponsorPackageId === event.target.dataset.id) {
                objToEdit = element;
            }
        });
        if (!$A.util.isEmpty(objToEdit)) {
            helper.resetFormTab(component);
            component.set('v.sponsorPackageObj', helper.applySchema(objToEdit, 'sponsorPackage'));
            if ($A.util.isEmpty(objToEdit.isTaxable) || objToEdit.isTaxable === false) {
                component.find('taxClass').setOtherAttributes({disabled : true},false);
            }
            else {
                component.find('taxClass').setOtherAttributes({disabled : null},false);
            }
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : 'packageBuilder', type: 'value', data : objToEdit});
            compEvent.fire();
            CustomFieldUtils.preFormatCustomFieldValues(objToEdit.customFields);
            var compEvents = $A.get('e.Framework:RefreshInputField');
            compEvents.setParams({group : 'sponsorPackageBuilderCustomFields',type : 'value' , data : objToEdit.customFields});
            compEvents.fire();
            helper.updateSharingForLookups(component);
            helper.openModal(component);
        }
        component.set('v.modalState',$A.get("$Label.EventApi.Edit_Sponsor_Package_Event_Builder"));
    },
    changeTab : function (component,event,helper) {
        if (component.get('v.currentTabOpen') === 'description') {
            if (helper.validateForm(component)) {
                helper.showOtherTab(component,event);
            }
        }
        else if (component.get('v.currentTabOpen') === 'packageAccounting') {
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
        if (event.getParam('fieldId') === 'isTaxable') {
            if (component.get('v.sponsorPackageObj').isTaxable) {
                helper.activateDeactivateField(component,'taxClass',false,null);
            }
            else {
                helper.activateDeactivateField(component,'taxClass',true,true);
                component.find('taxClass').clearErrorMessages();
            }
        }
        else if (event.getParam('fieldId') === 'deferRevenue') {
            if (component.get('v.sponsorPackageObj').deferRevenue) {
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
        else if (event.getParam('fieldId') === 'enableSponsorSales') {
            if (component.get('v.eventObj.enableSponsorSales')) {
                helper.activateDeactivateField(component,'eventSponsorsOverview',false,null);
            }
            else {
                helper.activateDeactivateField(component,'eventSponsorsOverview',true,true);
            }
        }
    },
    changeMasterTab: function (component, event, helper) {
        helper.showMasterTab(component, event);
    },
    handleRichTextInputFieldModalEvent : function (component,event) {
        if (event.getParam('fieldId') === 'eventSponsorsOverview') {
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
        if (event.getParam('uniqueId') === 'sponsorPackages') {
            component.set('v.customFieldsFound', true);
            var customFields = CustomFieldUtils.saveFields(event.getParams(), 'sponsorPackages',false);
            component.set('v.customFields', customFields);
        }
    }
})