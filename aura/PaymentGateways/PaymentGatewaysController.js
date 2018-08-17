({
    doInit : function(component,event,helper) {
        if ($A.util.isEmpty(component.get('v.paymentGatewayObj.id'))) {
            component.set('v.paymentGatewayObj',
                {
                    gatewayType: null,
                    name: null,
                    businessGroup: null,
                    depositAccount: null,
                    requireCVV: false,
                    requireEmail: false,
                    requirePhone: false,
                    attempt3ds : false,
                    useOffsite : false,
                    avsConfiguration: null,
                    ccImageUrl: null
                });
            if (component.get('v.paymentGatewayId') === '') {
                helper.getGatewayTypeObjs(component);
            }
            else {
                component.set('v.hideTestGatewayButton', true);
                $A.util.removeClass(component.find('updateButtonSpan'), 'hidden');
                helper.getExistingPaymentGatewayObj(component);
                component.set('v.isEditMode', true);
            }
        }
        else {
            component.set('v.hideTestGatewayButton', true);
            $A.util.removeClass(component.find('updateButtonSpan'), 'hidden');
            component.set('v.isEditMode', true);
            helper.fireComponentLoadedEvent(component);
        }
        //helper.getLabelMap(component);
    },
    handleFieldUpdateEvent : function(component,event,helper) {
        if (event.getParam('fieldId') === 'gatewayType' && !component.get('v.isEditMode')) {
            if (component.get('v.paymentGatewayObj').gatewayType !== '' &&
            !$A.util.isUndefinedOrNull(component.get('v.paymentGatewayObj').gatewayType)) {
                component.set('v.hideTestGatewayButton',true);
                $A.util.removeClass(component.find('detailConfigPaymentGateway'),'hidden');
                $A.util.removeClass(component.find('connectButtonSpan'),'hidden');
                component.find('avsConfiguration').setOtherAttributes({objectName : 'OrderApi__Payment_Gateway__c',field : 'OrderApi__AVS_Configuration__c'});
                helper.setCredentialObject(component,component.get('v.gatewayOptions')[component.get('v.paymentGatewayObj').gatewayType]);
                component.set('v.selectedGatewayOption',component.get('v.gatewayOptions')[component.get('v.paymentGatewayObj').gatewayType]);
            }
            else {
                component.set('v.hideTestGatewayButton',false);
                $A.util.addClass(component.find('detailConfigPaymentGateway'),'hidden');
                $A.util.addClass(component.find('connectButtonSpan'),'hidden');
                component.set('v.selectedGatewayOption',null);
            }
        }
        else if(event.getParam('fieldId') == 'attempt3ds' && component.get('v.paymentGatewayObj').gatewayType == 'test' && component.get('v.paymentGatewayObj').attempt3ds){
            var paymentGatewayObj = component.get('v.paymentGatewayObj');
            paymentGatewayObj.useOffsite = false;
            component.set('v.paymentGatewayObj', paymentGatewayObj);
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : 'paymentGatewayPrimary',data : paymentGatewayObj});
            compEvent.fire();
            }
        else if(event.getParam('fieldId') == 'useOffsite' && component.get('v.paymentGatewayObj').useOffsite){
            var paymentGatewayObj = component.get('v.paymentGatewayObj');
            paymentGatewayObj.attempt3ds = false;
            component.set('v.paymentGatewayObj', paymentGatewayObj);
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : 'paymentGatewayPrimary',data : paymentGatewayObj});
            compEvent.fire();
        }
    },
    connectToSelectedGateway : function(component,event,helper) {
        if (helper.validateForm(component.get('v.paymentGatewayObj'),component)) {
            helper.connectToSelectedGateway(component);
        }
        else {
            component.find('connectPaymentGateway').stopIndicator();
        }
    },
    connectionToTestGatewayObj : function(component,event,helper) {
        if (helper.validateForm(component.get('v.paymentGatewayObj'),component)) {
            var action = component.get('c.connectToTestGateway');
            action.setParams({paymentGatewayJSON: JSON.stringify(component.get('v.paymentGatewayObj'))});
            action.setCallback(this, function (result) {
                if (result.getState() === 'SUCCESS') {
                    var paymentGatewayObj = result.getReturnValue();
                    if (component.get('v.fireReturnEvent')) {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({
                            componentParams : {
                                showListing : true,
                                updatedGateway : paymentGatewayObj
                            }
                        });
                        compEvent.fire();
                    }
                    else {
                        component.find('connectTestGateway').stopIndicator();
                        UrlUtil.navToSObject(paymentGatewayObj.id);
                    }
                }
                else {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('connectTestGateway').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('connectTestGateway').stopIndicator();
        }
    },
    updateGateway : function(component,event,helper) {
        if (helper.validateForm(component.get('v.paymentGatewayObj'),component)) {
            var action = component.get('c.updatePaymentGateway');
            action.setParams({paymentGatewayJSON: JSON.stringify(component.get('v.paymentGatewayObj')),selectedGateway : JSON.stringify(component.get('v.selectedGatewayOption')),
                credentialsJSON : JSON.stringify(component.get('v.credentialsObj'))});
            action.setCallback(this, function (result) {
                if (result.getState() === 'SUCCESS') {
                    var paymentGatewayObj = result.getReturnValue();
                    if (component.get('v.fireReturnEvent')) {
                        var compEvent = $A.get('e.Framework:ShowComponentEvent');
                        compEvent.setParams({
                            componentParams : {
                                showListing : true,
                                updatedGateway : paymentGatewayObj,
                                create : true
                            }
                        });
                        compEvent.fire();
                    }
                    else {
                        component.find('connectTestGateway').stopIndicator();
                        UrlUtil.navToSObject(paymentGatewayObj.id);
                    }
                }
                else {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('connectTestGateway').stopIndicator();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('updatePaymentGateway').stopIndicator()
        }
    },
    cancelGatewayCreation : function(component) {
        if (component.get('v.fireReturnEvent')) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentParams : {
                    showListing : true,
                    create : false
                }
            });
            compEvent.fire();
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.businessGroupId')) && component.get('v.businessGroupId') !== '') {
                UrlUtil.navToSObject(component.get('v.businessGroupId'));
            }
            else {
                UrlUtil.navToSObject(component.get('v.paymentGatewayObj').businessGroup);
            }
        }
    }
})