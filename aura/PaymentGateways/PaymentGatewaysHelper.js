({
    getGatewayTypeObjs : function(component) {
        var self = this;
        var action = component.get('c.getGatewayTypes');
        action.setCallback(this,function(result){
            if (result.getState() === 'SUCCESS') {
                var responseObj = JSON.parse(result.getReturnValue());
                component.set('v.gatewayOptions',responseObj);
                var selectOptions = [];
                for (var key in responseObj) {
                    if (responseObj.hasOwnProperty(key)) {
                        selectOptions.push({label : responseObj[key].company,value : responseObj[key].type});
                    }
                }
                component.find('gatewayType').setSelectOptions(selectOptions.reverse());
                component.find('businessGroup').updateValue(component.get('v.businessGroupId'));
                component.find('name').updateValue('');
                component.find('requirePhone').updateValue(false);
                component.find('requireCVV').updateValue(false);
                component.find('requireEmail').updateValue(false);
                component.find('attempt3ds').updateValue(false);
                component.find('useOffsite').updateValue(false);
                component.find('gatewayType').updateValue(null);
                component.find('ccImageUrl').updateValue('');
                self.setOtherAttributesImage(component);
                component.find('avsConfiguration').setOtherAttributes({objectName : 'OrderApi__Payment_Gateway__c',field : 'OrderApi__AVS_Configuration__c'});
                self.fireComponentLoadedEvent(component);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    setCredentialObject : function (component,selectedGateway) {
        var credentialObj = {};
        if (!$A.util.isEmpty(selectedGateway) && !$A.util.isEmpty(selectedGateway.authMethods)) {
            selectedGateway.authMethods.forEach(function(element){
                if (!$A.util.isEmpty(element.creds)) {
                    element.creds.forEach(function(credElement){
                        credentialObj[credElement.name] = null;
                    });
                }
            })
        }
        component.set('v.credentialsObj',credentialObj);
    },
    getExistingPaymentGatewayObj : function(component) {
        var self = this;
        var action = component.get('c.getExistingPaymentGateway');
        action.setParams({gatewayId : component.get('v.paymentGatewayId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'SUCCESS') {
                component.find('avsConfiguration').setOtherAttributes({objectName : 'OrderApi__Payment_Gateway__c',field : 'OrderApi__AVS_Configuration__c'});
                var resultObj = result.getReturnValue();
                component.set('v.paymentGatewayObj',resultObj);
                self.setOtherAttributesImage(component);
                var compEvent = $A.get('e.Framework:RefreshInputField');
                compEvent.setParams({group : 'paymentGatewayPrimary',data : resultObj});
                compEvent.fire();
                setTimeout($A.getCallback(function(){
                    component.find('avsConfiguration').updateValue(resultObj.avsConfiguration);
                    component.find('businessGroup').updateValue(resultObj.businessGroup);
                    component.find('depositAccount').updateValue(resultObj.depositAccount);
                }),1000);
                if (!resultObj.isTest) {
                    $A.util.removeClass(component.find('detailConfigPaymentGateway'),'hidden');
                    self.setCredentialObject(component,JSON.parse(resultObj.gatewayTypeJSON));
                    component.set('v.selectedGatewayOption',JSON.parse(resultObj.gatewayTypeJSON));
                }
            }
            self.fireComponentLoadedEvent(component);
        });
        $A.enqueueAction(action);
    },
    connectToSelectedGateway : function(component) {
        var action = component.get('c.connectToGateway');
        action.setParams({selectedGateway : JSON.stringify(component.get('v.selectedGatewayOption')),
                          paymentGatewayJSON : JSON.stringify(component.get('v.paymentGatewayObj')),
                          credentialsJSON : JSON.stringify(component.get('v.credentialsObj'))});
        action.setCallback(this,function(result){
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
                    UrlUtil.navToSObject(component.get('v.businessGroupId'));
                }
            }
            else {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                component.find('connectPaymentGateway').stopIndicator();
            }
        });
        $A.enqueueAction(action);
    },
    validateForm : function(inputObj,component) {
        var isFormValid;
        for (var property in inputObj) {
            if (inputObj.hasOwnProperty(property) && component.find(property) != null) {
                component.find(property).validate();
                if (!component.find(property).get('v.validated')) {
                    isFormValid = false;
                }
            }
        }
        if (isFormValid == undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    setOtherAttributesImage : function(component) {
        var otherAttributes = {
            maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                viewport: {
                    width: 540,
                    height: 35,
                    type: 'square'
                },
                boundary: {
                    width: 640,
                    height: 200
                }
            },
            croppingResultParams : {
                type: "blob",
                size: {width : 540, height : 35},
                format : "jpeg",
                circle : false
            },
            allowCropping : true,
            additionalModalClass : 'banner-image-modal'
        };

        component.find('ccImageUrl').setOtherAttributes(otherAttributes,true);
    }
})