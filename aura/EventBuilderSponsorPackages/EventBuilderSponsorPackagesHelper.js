/* global $ */
/* global _ */
/* global Sortable */
({
    _schemas: {
      sponsorPackage: {
        price : null,
        isActive : true,
        isTaxable : false,
        deferRevenue : false,
        termInMonths : 1,
        imageURL : '',
        revenueRecognitionRule : 'Over Time',
        revenueRecognitionTermRule : 'No Partial Credit',
        deferredRevenueAccount : '',
        taxClass : '',
        incomeAccount : '',
        arAccount : '',
        refundAccount : '',
        adjustmentAccount : '',
        form : '',
        displayName: '',
        quantityAvailable: null,
        lineDescription: '',
        formHeading: '',
        isContribution: false,
        isTaxDeductible: false,
        revenueRecognitionDate: '',
        flexDayOfMonth: 0,
          customFields : {},
          customFieldValues: {}
		  }
    },
    getSponsorPackages : function(component) {
        var self = this;
        var action = component.get('c.getSponsorPackages');
        action.setParams({eventId: component.get('v.eventObj.eventId')});
        action.setCallback(this,function(response){
            component.set('v.eventObj.sponsorPackages',JSON.parse(response.getReturnValue()));
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
            setTimeout($A.getCallback(function(){
                self.sortableOrder(component,self);
            }),250);
        });
        $A.enqueueAction(action);
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
    openModal : function(component) {
        var packagesModal = component.find('packagesModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(packagesModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("packagesBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
        component.find('revenueRecognitionDate').clearErrorMessages();
        var self = this;
        setTimeout($A.getCallback(function(){
            self.getCustomFields(component);
        }),2000);
    },
    closeModal : function(component) {
        var packagesModal = component.find('packagesModal');
        var deleteModal = component.find('deleteModal');
        var modalBackdrop = component.find('modalBackdrop');

        $A.util.removeClass(packagesModal, 'slds-fade-in-open');
        deleteModal.hideModal();
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    activateDeactivateField : function(component,fieldId,clearValue,disable,otherAttributes) {
        if ($A.util.isEmpty(otherAttributes)) {
            otherAttributes = {};
        }
        otherAttributes.disabled = disable;
        if (!$A.util.isUndefinedOrNull(component.find(fieldId))) {
            component.find(fieldId).setOtherAttributes(otherAttributes, false);
        }
    },
    showOtherTab : function(component,event) {
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')+'Label'),'slds-active');
        $A.util.removeClass(component.find(component.get('v.currentTabOpen')),'active');
        $A.util.addClass(component.find(event.target.dataset.tab+'Label'),'slds-active');
        $A.util.addClass(component.find(event.target.dataset.tab),'active');
        component.set('v.currentTabOpen',event.target.dataset.tab);
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
    validateForm : function (component) {
        var isValidForm = false;
        component.find('displayName').validate();
        component.find('price').validate();
        if (component.find('displayName').get('v.validated') &&
            component.find('price').get('v.validated')) {
            isValidForm = true;
        }
        var customFieldValidation = CustomFieldUtils.validateCustomFields(component,'customField');
        if (!customFieldValidation) {
            isValidForm = false;
        }
        return isValidForm;
    },
    validateDeferredRevenue : function(component) {
        if (component.get('v.sponsorPackageObj').deferRevenue && ($A.util.isEmpty(component.get('v.sponsorPackageObj').deferredRevenueAccount) ||
            component.get('v.sponsorPackageObj').deferredRevenueAccount === '')) {
            component.find('deferredRevenueAccount').setErrorMessages([{message : 'Deferred Revenue Account Required'}]);
            return false;
        }
        return true;
    },
    validateTaxClass : function(component) {
        if (component.get('v.sponsorPackageObj').isTaxable && ($A.util.isEmpty(component.get('v.sponsorPackageObj').taxClass) ||
        component.get('v.sponsorPackageObj').taxClass === '')) {
            component.find('taxClass').setErrorMessages([{message : 'Tax Class required if taxable is enabled'}]);
            return false;
        }
        return true;
    },
    resetFormTab : function(component) {
        $A.util.removeClass(component.find('descriptionLabel'),'slds-active');
        $A.util.removeClass(component.find('description'),'active');

        $A.util.removeClass(component.find('packageAttachFormLabel'),'slds-active');
        $A.util.removeClass(component.find('packageAttachForm'),'active');

        $A.util.removeClass(component.find('packageAccountingLabel'),'slds-active');
        $A.util.removeClass(component.find('packageAccounting'),'active');

        $A.util.addClass(component.find('descriptionLabel'),'slds-active');
        $A.util.addClass(component.find('description'),'active');
        component.set('v.currentTabOpen','description');
    },
    sortableOrder : function(component,self) {
        if ($A.util.isEmpty(self)) {
            self = this;
        }
        if (!$A.util.isEmpty(document.getElementById('sponsorPackages-container'))) {
            Sortable.create(document.getElementById('sponsorPackages-container'), {
                ghostClass: "item--ghost",
                animation: 200,
                draggable: '.sponsorPackages-type',
                onEnd: $A.getCallback(function () {
                    var existingSteps = [];
                    var displayOrderArray = [];
                    $('#sponsorPackages-container').children().each(function (index) {
                        var stepRowId = $(this).data('id');
                        if (stepRowId !== null && $.inArray(stepRowId, existingSteps) === -1) {
                            displayOrderArray.push({'id': stepRowId, 'index': index});
                            existingSteps.push(stepRowId);
                        }
                    });
                    self.updateDisplayOrder(component, displayOrderArray);
                })
            });
        }
    },
    updateDisplayOrder : function(component, displayOrderArray) {
        var action = component.get('c.updateDisplayOrder');
        action.setParams({
            'displayOrderObjJSON' : JSON.stringify(displayOrderArray)
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    },
    updateSharingForLookups : function (component) {
        component.find('taxClass').setOtherAttributes({filter : "OrderApi__Is_Tax__c = true AND OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('deferredRevenueAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('incomeAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('refundAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('adjustmentAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
    },
    showMasterTab: function(component, event) {
      var tab = event.target.dataset.tab;
      var currentTab = component.get('v.currentOuterTab');

      $A.util.removeClass(component.find(currentTab + 'Label'), 'slds-active');
      $A.util.addClass(component.find(tab + 'Label'),'slds-active');

      $A.util.removeClass(component.find(currentTab), 'slds-show');
      $A.util.addClass(component.find(currentTab), 'slds-hide');

      $A.util.addClass(component.find(tab), 'slds-show');
      $A.util.removeClass(component.find(tab), 'slds-hide');

      component.set('v.currentOuterTab', event.target.dataset.tab);

      if (tab === 'sponsors') {
          this.buildSponsorsOnce(component);
      }
    },

    buildSponsorsOnce: function(component) {
        var divComponent = component.find('sponsorsBody');
        if (divComponent.get('v.body').length === 1) {
            return;
        }
        $A.createComponent(
            'markup://EventApi:'+'EventBuilderSponsors',
            {eventObj : component.get('v.eventObj'), organizationId : component.get('v.organizationId')},
            function(cmp) {
                cmp.set('v.eventObj',component.get('v.eventObj'));
                divComponent.set('v.body', cmp);
            }
        );
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('fieldUIApi').getFieldsFromLayout('EventApi__Sponsor_Package__c');
        }
    }
})