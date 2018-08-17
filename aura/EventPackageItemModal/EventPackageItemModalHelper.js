({
    openItemModal: function (cmp, event) {
        var arguments = event.getParam('arguments');

        //get existing sol when user edit the item from checkout summary page
        var existingSOL = arguments.existingSOL;
        setTimeout($A.getCallback(function() {
            if (!$A.util.isEmpty(cmp.find('donationAmount'))) {
                if (!$A.util.isEmpty(existingSOL)) {
                    cmp.find('donationAmount').updateValue(existingSOL.total);
                } else {
                    cmp.find('donationAmount').updateValue(null);
                }
                if (!$A.util.isEmpty(cmp.find('autoRenew'))) {
                    cmp.find('autoRenew').updateValue(existingSOL.autoRenew);
                }
            }
        }), 500);

        var packageItem = arguments.packageItem;
        cmp.set('v.packageItem', packageItem);

        //set FormResponseId from SOL
        if ($A.util.isEmpty(cmp.get('v.formResponseId')) && !$A.util.isEmpty(arguments.existingSOL)) {
            cmp.set('v.formResponseId', arguments.existingSOL.formResponseId);
        }

        //cal quantities
        var quantities = this.generateQuantities(cmp, packageItem);
        if (!$A.util.isEmpty(cmp.find('quantity'))) {
            if (!$A.util.isEmpty(quantities)) {
                cmp.find('quantity').set('v.value', quantities[0]);
            }
            else {
                cmp.find('quantity').set('v.value', 1);
            }
        } else {
            var params = cmp.get('v.params');
            params.quantity = "1";
            cmp.set('v.params',params);
        }

        cmp.get('v.params').parentSOL = arguments.parentSOL;

        var subPlans = arguments.subPlans;
        cmp.set('v.subPlans', subPlans);

        if (!$A.util.isEmpty(arguments.onPurchase)) {
            this.onPurchase = arguments.onPurchase;
        }

        if (packageItem.type == 'sub') {
            var plans = _.map(subPlans, function (p) {
                return {
                    label: p.planName,
                    value: p.planId,
                    isSelected: p.isDefault
                }
            });
            //update subplan picklist
            if (!$A.util.isEmpty(existingSOL)) {
                cmp.find('subPlanId').setSelectOptions(plans, existingSOL.subPlanId);
            } else {
                cmp.find('subPlanId').setSelectOptions(plans, _.find(plans, function (p) {return p.isSelected;}).value);
            }
        }
        if (!$A.util.isUndefinedOrNull(packageItem.formId)) {
            cmp.set('v.hasForm',true);
            $A.createComponent('markup://LTE:EventRegistrationForm',{
                formId : packageItem.formId,
                autoSubmitForm : false,
                'aura:id' : 'piForm',
                subjectLookupField : 'OrderApi__Sales_Order_Line__c',
                formResponseId : cmp.get('v.formResponseId')
            },function(cm,status,message){
                console.log(status,message);
                cmp.find('formDiv').set('v.body',[cm]);

                var modal = cmp.find('packageItemModal');
                var backdrop = cmp.find('modalBackdrop');

                $A.util.addClass(modal, 'slds-fade-in-open');
                $A.util.addClass(backdrop, 'slds-backdrop_open');
                FontevaHelper.disableBodyScroll();


            });
        } else {
            cmp.set('v.hasForm',false);

            var modal = cmp.find('packageItemModal');
            var backdrop = cmp.find('modalBackdrop');

            $A.util.addClass(modal, 'slds-fade-in-open');
            $A.util.addClass(backdrop, 'slds-backdrop_open');
            FontevaHelper.disableBodyScroll();


        }
    },
    generateQuantities: function(cmp, packageItem) {
        var quantities = [];
        if (packageItem.isIndividual) {
            for (var i = (packageItem.minQuantity || 1); i <= (packageItem.maxQuantity || 9); i++) {
                quantities.push(i);
            }
        }
        else {
            for (var i = 1; i <= (packageItem.maxQuantityPerItem || 9); i++) {
                quantities.push(i)
            }
        }
        cmp.set('v.quantities', quantities);
        return quantities;
    },
    closeItemModal: function (cmp) {
        var modal = cmp.find('packageItemModal');
        var backdrop = cmp.find('modalBackdrop');

        $A.util.removeClass(modal, 'slds-fade-in-open');
        $A.util.removeClass(backdrop, 'slds-backdrop_open');
        FontevaHelper.enableBodyScroll();
        cmp.find('purchaseButton').stopIndicator();
    },
    purchase: function (cmp, event) {
        var validated = true;
        if (!$A.util.isEmpty(cmp.find('donationAmount'))) {
            cmp.find('donationAmount').validate();
            validated = cmp.find('donationAmount').get('v.validated');
        }
        if (validated) {
            var params = cmp.get('v.params');
            if (!$A.util.isEmpty(cmp.find('quantity'))) {
                params.quantity = cmp.find('quantity').get('v.value');
            }
            else {
                params.quantity = "1";
            }
            cmp.set('v.params',params);
            $A.enqueueAction(cmp.get('v.purchaseAction'));
        }
        else {
            cmp.find('purchaseButton').stopIndicator();
        }
    },
    autoRenew: function(cmp, selectedPlanId) {
        var selectedPlan = _.find(cmp.get('v.subPlans'), function(p) {return p.planId === selectedPlanId});
        if (selectedPlan.renewal === 'Enabled') {
            cmp.set('v.renewDisabled', false);
            cmp.set('v.renewVisible', true);
        }
        else if (selectedPlan.renewal === 'Required') {
            cmp.set('v.renewDisabled', true);
            cmp.set('v.renewVisible', true);
            cmp.find('autoRenew').updateValue(true);
        }
        else {
            cmp.set('v.renewVisible', false);
        }
        if (cmp.get('v.renewVisible')) {
            setTimeout($A.getCallback(function(){
                cmp.find('autoRenew').setOtherAttributes({disabled : cmp.get('v.renewDisabled')});
            }),50);
        }
    }
})