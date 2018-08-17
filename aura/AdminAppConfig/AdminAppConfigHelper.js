({
    loadData : function(component,initialLoad) {
        var self = this;
        var action = component.get('c.getOrgDefaultsAppConfig');
        action.setCallback(this,function(response){
            if (initialLoad) {
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
            }
            if (response.getError() && response.getError().length) {
                return $A.error('Unexpected error: ' + response.getError()[0].message);
            }
            var appConfig = JSON.parse(response.getReturnValue());
            if(appConfig != null) {
                component.set('v.appConfigObj',appConfig);
                var compEvents = $A.get('e.Framework:RefreshInputField');
                compEvents.setParams({group : 'orgDefaultAcctPrefs',type:'value' , data : appConfig});
                compEvents.fire();
                component.find('calculateSalesTax').updateValue(appConfig.calculateSalesTax);
                component.find('enableIndividualAccounts').updateValue(appConfig.enableIndividualAccounts);
                component.find('enableBillingSyncBypass').updateValue(appConfig.enableBillingSyncBypass);
                component.find('disableSavePymntMethodOptn').updateValue(appConfig.disableSavePymntMethodOptn);
                component.find('updateContactStandardPhoneField').updateValue(appConfig.updateContactStandardPhoneField);
                component.find('updateContactStandardEmailField').updateValue(appConfig.updateContactStandardEmailField);
            }
            self.buildSelectData(component);
        });
        $A.enqueueAction(action);
    },
    loadExistingSettings : function(component) {
        var action = component.get('c.getExistingSettings');
        action.setCallback(this,function(response){
            if(response.getError() && response.getError().length) {
                return null;
            }
            component.set('v.settingObjs',JSON.parse(response.getReturnValue()));
        });
        $A.enqueueAction(action);
    },
    loadExistingSettingToEdit : function(component,objToEditId) {
        var objects = component.get('v.settingObjs');
        var objToEdit = null;
        objects.forEach(function(obj,index){
            if (obj.configId == objToEditId) {
                objToEdit = obj;
            }
        });
        if (objToEdit != null) {
            var compEvents = $A.get("e.Framework:RefreshInputField");
            compEvents.setParams({group :'newSettings', data : objToEdit});
            compEvents.fire();
        }
    },
    loadProfiles : function(component) {
        var action = component.get('c.getProfiles');
        action.setCallback(this,function(response){
            if (response.getError() && response.getError().length) {
                return null;
            }
            component.find('newProfile').setSelectOptions(JSON.parse(response.getReturnValue()));
        });
        $A.enqueueAction(action);
    },
    buildSelectData : function(component) {
        var options  = [
            {label : "User",value : "User"},
            {label : 'Profile', value :'Profile'}
        ];
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'newSettings',type:'selectOptions' , data : {'newSetupOwnerType' : options}});
        compEvents.fire();
    },
    resetModal : function (component) {
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
            requiredTaxfield: null,
            newTaxLocale : null,
            newTaxAccount : null,
            newEnableIndividualAccounts : false,
            newEnableBillingSyncBypass : false,
            newDisableSavePymntMethodOptn : false,
            newUpdateContactStandardEmailField : false,
            newUpdateContactStandardPhoneField : false,
            newCalculateSalesTax : false});
        component.find('newUser').updateValue(null);
        component.find('newProfile').updateValue(null);
        component.find('newARAccount').updateValue(null);
        component.find('newAdjustmentAccount').updateValue(null);
        component.find('newBusinessGroup').updateValue(null);
        component.find('newDepositAccount').updateValue(null);
        component.find('newDiscountAccount').updateValue(null);
        component.find('newIncomeAccount').updateValue(null);
        component.find('newIndAcctNmExt').updateValue(null);
        component.find('newPaymentTerms').updateValue(null);
        component.find('newRefundAccount').updateValue(null);
        component.find('newTaxLocale').updateValue(null);
        component.find('newTaxAccount').updateValue(null);
        component.find('newEnableIndividualAccounts').updateValue(false);
        component.find('newEnableBillingSyncBypass').updateValue(false);
        component.find('newDisableSavePymntMethodOptn').updateValue(false);
        component.find('newUpdateContactStandardEmailField').updateValue(false);
        component.find('newUpdateContactStandardPhoneField').updateValue(false);
        component.find('newCalculateSalesTax').updateValue(false);
    },
    openModal : function(component) {
        var modal = component.find('newprofileSettings');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
    },
    closeModal : function(component) {
        var modal = component.find('newprofileSettings');
        var modalBackdrop = component.find('modalBackdrop');

        $A.util.removeClass(modal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
    },
})