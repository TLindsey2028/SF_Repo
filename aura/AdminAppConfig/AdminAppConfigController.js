({
	doInit : function(component, event, helper) {
        component.set('v.appConfigObj',{
            newSetupOwnerType : null,
            configId : null,
            userName: null,
            profileName: null,
            user: null,
            profile: null,
            arAccount: null,
            adjustmentAccount: null,
            businessGroup: null,
            depositAccount: null,
            discountAccount: null,
            incomeAccount: null,
            individualAccountNameExtension: null,
            paymentGateway: null,
            paymentTerms: null,
            refundAccount: null,
            requiredTaxfield: null,
            enableIndividualAccounts : false,
            disableSavePymntMethodOptn : false,
            enableBillingSyncBypass : false,
            updateContactStandardEmailField : false,
            updateContactStandardPhoneField : false,
            calculateSalesTax : false});
        component.set('v.settingObjs',[]);
        component.set('v.newAppConfigObj',{
            newSetupOwnerType : 'User',
            configId : null,
            userName: null,
            profileName: null,
            newUser: null,
            newProfile: null,
            newARAccount: null,
            newAdjustmentAccount: null,
            newBusinessGroup: null,
            newDepositAccount: null,
            newDiscountAccount: null,
            newIncomeAccount: null,
            newIndAcctNmExt: null,
            newPaymentGateway: null,
            newPaymentTerms: null,
            newRefundAccount: null,
            newTaxLocale : null,
            newTaxAccount : null,
            requiredTaxfield: null,
            newEnableIndividualAccounts : false,
            newDisableSavePymntMethodOptn : false,
            newEnableBillingSyncBypass : false,
            newUpdateContactStandardEmailField : false,
            newUpdateContactStandardPhoneField : false,
            newCalculateSalesTax : false});
		component.find('calculateSalesTax').updateValue(null);
		component.find('enableIndividualAccounts').updateValue(null);
		component.find('enableBillingSyncBypass').updateValue(null);
		component.find('disableSavePymntMethodOptn').updateValue(null);
		component.find('updateContactStandardPhoneField').updateValue(null);
		component.find('updateContactStandardEmailField').updateValue(null);
		component.find('newCalculateSalesTax').updateValue(null);
		component.find('newEnableIndividualAccounts').updateValue(null);
		component.find('newEnableBillingSyncBypass').updateValue(null);
		component.find('newDisableSavePymntMethodOptn').updateValue(null);
		component.find('newUpdateContactStandardPhoneField').updateValue(null);
		component.find('newUpdateContactStandardEmailField').updateValue(null);
        helper.loadData(component,true);
        helper.loadProfiles(component);
		helper.loadExistingSettings(component);
	},
	saveOrgDefaultValues : function(component, event, helper) {
		var action = component.get('c.saveOrgDefaults');
		action.setParams({jsonData : JSON.stringify(component.get('v.appConfigObj'))});
		action.setCallback(this,function(response){
			if (response.getError() && response.getError().length) {
				return null;
			}
			component.find('successModal').showModal();
			helper.loadData(component,false);
		});

		$A.enqueueAction(action);
	},
	saveNewAppConfigSettings : function(component,event,helper) {
		var action = component.get('c.saveUserProfile');
		action.setParams({jsonData : JSON.stringify(component.get('v.newAppConfigObj'))});
		action.setCallback(this,function(response){
			if(response.getError() && response.getError().length) {
				return null;
			}
			helper.resetModal(component);
			helper.loadExistingSettings(component);
			helper.closeModal(component);
		});

		$A.enqueueAction(action);
	},
	showModal : function(component,event,helper) {
		var type = event.target.dataset.type;
		if (type == 'new') {
			helper.resetModal(component);
		}
		else {
			helper.loadExistingSettingToEdit(component,event.target.dataset.id);
		}
        helper.openModal(component);
	},
	hideModal : function(component,event,helper) {
        helper.closeModal(component);
    },
	deleteObject : function(component,event,helper) {
		event.preventDefault();
		var action = component.get('c.deleteConfig');
		action.setParams({objectToDelete : event.target.dataset.id});
		action.setCallback(this,function(response){
			helper.loadExistingSettings(component);
		});
		$A.enqueueAction(action);
	}
})