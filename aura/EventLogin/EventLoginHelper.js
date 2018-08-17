/* global FontevaHelper */
/* global $ */

({
    loginUser : function(component) {
        component.find('userName').validate();
        component.find('password').validate();
        if (component.find('userName').get('v.validated') && component.find('password').get('v.validated')) {
            if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                component.find('guestRegistrationButton').set('v.disable',true);
            }
            var action = component.get('c.loginUser');
            var redirectUrl = component.get('v.returnUrl');

            if ($A.util.isEmpty(redirectUrl)) {
                redirectUrl = location.href;
            }
            action.setParams({
                userObjString : JSON.stringify(component.get('v.loginData')),
                redirectUrl : redirectUrl
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                    if (!$A.util.isEmpty(component.find('loginBtn'))) {
                        component.find('loginBtn').stopIndicator();
                    }
                    if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                        component.find('guestRegistrationButton').set('v.disable',false);
                    }
                }
                else {
                    if (!component.get('v.showOverview')) {
                        FontevaHelper.clearCacheItem('usrObj');
                        FontevaHelper.cacheItem('loginUser', true);
                    }
                    sessionStorage.clear();
                    FontevaHelper.flushAll();
                    $(location).attr('href',result.getReturnValue());
                }
                component.find('loginBtn').stopIndicator();
            });
            $A.enqueueAction(action);
        } else {
            component.find('loginBtn').stopIndicator();
        }
    },
    forgotPassword : function(component) {
        var self = this;
        var action = component.get('c.sendEmailforgotPassword');
        action.setParams({userName : component.get('v.loginData.forgotUserName')});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: "Success!",
                    message: $A.get("$Label.LTE.Login_Component_Email_Sent"),
                    type: 'success'
                });
                toastEvent.fire();
                self.hideForgotPasswordModal(component);
            }
            component.find('forgotPasswordButton').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    hideForgotPasswordModal : function(component) {
        $A.util.removeClass(component.find('slds-modal--forgotPassword'),'slds-fade-in-open');
        $A.util.removeClass(component.find('loginBackdrop'),'slds-backdrop--open');
    },
    validateContact : function(component) {
        if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
            component.find('guestRegistrationButton').set('v.disable', false);
            component.find('guestRegistrationButton').startIndicator();
        }
        var action = component.get('c.findContact');
        action.setParams({
            userObjString : JSON.stringify(component.get('v.loginData')),
            storeObj : JSON.stringify(component.get('v.storeObj'))
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                var contactFound = result.getReturnValue();
                component.set('v.foundContact', contactFound);
                if (!$A.util.isEmpty(contactFound) && !$A.util.isEmpty(contactFound.id)) {
                    $A.util.addClass(component.find("newContactFields"), 'hidden');
                } else {
                    $A.util.removeClass(component.find("newContactFields"), 'hidden');
                }
            }
            if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                component.find('guestRegistrationButton').stopIndicator();
            }
        });
        $A.enqueueAction(action);
    },
    fireGuestCheckoutEvent : function (component,contactObj) {
        FontevaHelper.cacheItem('checkoutAsGuest', true);
        FontevaHelper.cacheItem('guestCheckoutContact', contactObj);
        var compEvent = $A.get('e.LTE:LoginComponentEvent');
        compEvent.setParams({
            enabled : true,
            guestContact : contactObj,
            showOverview : false
        });
        compEvent.fire();
    },
    createContactAndContinue : function(component) {
        var self = this;
        var contactFound = component.get('v.foundContact');
        if (!$A.util.isEmpty(contactFound) && !$A.util.isEmpty(contactFound.id)) {
            if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                component.find('guestRegistrationButton').stopIndicator();
            }
            self.fireGuestCheckoutEvent(component,contactFound);
        } else {
            if ($A.util.isEmpty(component.get('v.siteObj.loginOverrideUrl')) && !$A.util.isEmpty(component.find('loginBtn'))) {
                component.find('loginBtn').set('v.disable', true);
            }
            var action = component.get('c.createContact');
            action.setParams({
                userObjString : JSON.stringify(component.get('v.loginData')),
                storeObj : JSON.stringify(component.get('v.storeObj')),
                fields : JSON.stringify(component.get('v.guestRegistrationFields'))
            });
            action.setCallback(this, function (result) {
                console.log(result);
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                    if ($A.util.isEmpty(component.get('v.siteObj.loginOverrideUrl')) && !$A.util.isEmpty(component.find('loginBtn'))) {
                        component.find('loginBtn').set('v.disable', false);
                    }
                    if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                        component.find('guestRegistrationButton').stopIndicator();
                    }
                }
                else {
                    FontevaHelper.enableBodyScroll();
                    self.fireGuestCheckoutEvent(component,result.getReturnValue());
                }
            });
            $A.enqueueAction(action);
        }
    },
    createUserAndContinue : function(component) {
        if ($A.util.isEmpty(component.get('v.siteObj.loginOverrideUrl')) && !$A.util.isEmpty(component.find('loginBtn'))) {
            component.find('loginBtn').set('v.disable', true);
        }
        var action = component.get('c.createUser');
        var redirectUrl = component.get('v.returnUrl');
        if ($A.util.isEmpty(redirectUrl)) {
            redirectUrl = location.href;
        }
        action.setParams({
            userObjString : JSON.stringify(component.get('v.loginData')),
            storeObj : JSON.stringify(component.get('v.storeObj')),
            redirectUrl : redirectUrl,
            fields : JSON.stringify(component.get('v.guestRegistrationFields'))
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
                if ($A.util.isEmpty(component.get('v.siteObj.loginOverrideUrl')) && !$A.util.isEmpty(component.find('loginBtn'))) {
                    component.find('loginBtn').set('v.disable', false);
                }
            }
            else {
                if (!component.get('v.showOverview')) {
                    FontevaHelper.clearCacheItem('usrObj');
                    FontevaHelper.cacheItem('loginUser', true);
                }
                FontevaHelper.flushAll();
                $(location).attr('href', result.getReturnValue());
            }
            if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                component.find('guestRegistrationButton').stopIndicator();
            }
        });
        $A.enqueueAction(action);
    },
    checkIfGuestRegistrationEnabled : function(component) {
        var action = component.get('c.checkIfGuestRegistrationEnabled');
        action.setParams({});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.isGuestRegistrationEnabled', result.getReturnValue());
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    retrieveFieldSetDescriptions : function(component) {
        var action = component.get('c.retrieveFieldSetDescriptions');
        action.setParams({
            storeObj : JSON.stringify(component.get('v.storeObj')),
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                component.set('v.guestRegistrationFields', result.getReturnValue());
                var fields = component.get('v.guestRegistrationFields');
                var divComponent = component.find("fieldSetDiv");
                var divBody = divComponent.get("v.body");
                var guestRegistrationFieldsGlobals = [];
                fields.forEach(function(element) {
                    var otherAttributes = {};
                    if (element.fieldType.toLowerCase() === 'picklist') {
                        otherAttributes.objectName = 'Contact';
                        otherAttributes.field = element.fieldId;
                    }
                    $A.createComponent(
                        'markup://Framework:InputFields',
                        {
                            group : 'guestForm',
                            fieldType : element.fieldType,
                            'aura:id' : element.fieldId,
                            isRequired : element.isRequired,
                            label : element.fieldLabel,
                            value : component.get('v.loginData'),
                            otherAttributes : otherAttributes
                        }, function(cmp) {
                            cmp.set('v.value',component.get('v.loginData'));
                            divBody.push(cmp);
                            guestRegistrationFieldsGlobals.push(cmp.getGlobalId());
                        }
                    );
                });
                divComponent.set('v.body', divBody);
                component.set('v.guestRegistrationFieldsGlobals', guestRegistrationFieldsGlobals);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    validateGuestForm : function(component) {
        var validated = true;
        component.find('firstName').validate();
        component.find('lastName').validate();
        component.find('email').validate();
        if (!component.find('firstName').get('v.validated') || !component.find('lastName').get('v.validated')
            || !component.find('email').get('v.validated')) {
            validated = false;
        }
        if (component.get('v.storeObj.contactMatchRule') === 'CUSTOM') {
            component.find('matchingField').validate();
            if (!component.find('matchingField').get('v.validated')) {
                validated = false;
            }
        }
        if (!$A.util.isEmpty(component.get('v.loginData.createUser')) && component.get('v.loginData.createUser')) {
            component.find('guestPassword').validate();
            var validPwd = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%!]).{6,20})$/.test(component.get('v.loginData.guestPassword'));
            if (!component.find('guestPassword').get('v.validated') || !validPwd) {
                validated = false;
                FontevaHelper.showErrorMessage($A.get("$Label.LTE.Login_Component_Password_Validation"));
            }
        }
        if ($A.util.isEmpty(component.get('v.foundContact.id'))) {
            var guestRegistrationFieldsGlobals = component.get('v.guestRegistrationFieldsGlobals');
            if (!$A.util.isEmpty(guestRegistrationFieldsGlobals)) {
                guestRegistrationFieldsGlobals.forEach(function(element) {
                    var temp = $A.getComponent(element);
                    temp.validate();
                    if (!temp.get('v.validated')) {
                        validated = false;
                    }
                });
            }
        }
        return validated;
    },
    cleanUpOnLoad : function(component) {
        this.checkIfFieldExists(component,'userName');
        this.checkIfFieldExists(component,'password');
        this.checkIfFieldExists(component,'firstName');
        this.checkIfFieldExists(component,'lastName');
        this.checkIfFieldExists(component,'email');
        this.checkIfFieldExists(component,'registerGuestUserName');
        this.checkIfFieldExists(component,'guestPassword');
        this.checkIfFieldExists(component,'forgotUserName');
    },
    checkIfFieldExists : function(component,fieldName) {
        if (!$A.util.isEmpty(component.find(fieldName))) {
            component.find(fieldName).updateValue(null, false);
        }
    }
})