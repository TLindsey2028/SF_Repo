/* global FontevaHelper */
({
    doInit : function(component, event, helper) {
        component.set('v.loginData',{
            email : null,
            password : null,
            firstName : null,
            lastName : null,
            registerGuestUserName : null,
            guestPassword : null,
            forgotUserName : null,
            createUser : false,
            userName : null,
            account : null,
            accountId : null
        });
        helper.checkIfGuestRegistrationEnabled(component);
        helper.retrieveFieldSetDescriptions(component);
        helper.buildAccounts(component);
    },
    loginAction : function(component, event, helper) {
        helper.loginUser(component);
    },
    showForgotPasswordModal : function(component) {
        $A.util.addClass(component.find('sldsModalForgotPassword'),'slds-fade-in-open');
        $A.util.addClass(component.find('loginBackdrop'),'slds-backdrop--open');
    },
    hideForgotPasswordModal : function(component, event, helper) {
        helper.hideForgotPasswordModal(component);
    },
    forgotPassword : function(component, event, helper) {
        component.find('forgotUserName').validate();
        if (component.find('forgotUserName').get('v.validated')) {
            helper.forgotPassword(component);
        } else {
            component.find('forgotPasswordButton').stopIndicator();
        }
    },
    checkoutAsGuest : function(component, event, helper) {
        helper.checkoutAsGuest(component);
    },
    fireCancelEvent : function() {
        var compEvent = $A.get('e.LTE:LoginComponentEvent');
        compEvent.setParams({
            cancelLoginProcess : true
        });
        compEvent.fire();
    },
    handleFieldChangeEvent : function(component, event, helper) {
        if (event.getParam('group') === 'guestForm') {
            if (event.getParam('fieldId') === 'email') {
                if ($A.util.isEmpty(component.get('v.siteObj.createAccountOverrideUrl'))) {
                    component.find('registerGuestUserName').updateValue(component.get('v.loginData.email'), false);
                }
                if (!component.get('v.storeObj.showMatchField')) {
                    if ($A.util.isEmpty(component.get('v.loginData.email'))) {
                        component.find('guestRegistrationButton').set('v.disable', true);
                        $A.util.addClass(component.find("newContactFields"), 'hidden');
                    } else {
                        helper.validateContact(component);
                    }
                }
                else if (component.get('v.storeObj.showMatchField')) {
                    if ($A.util.isEmpty(component.get('v.loginData.matchingField'))) {
                        component.find('guestRegistrationButton').set('v.disable', true);
                        $A.util.addClass(component.find("newContactFields"), 'hidden');
                    } else {
                        helper.validateContact(component);
                    }
                }
            } else if (event.getParam('fieldId') === 'matchingField'){
                if ($A.util.isEmpty(component.get('v.loginData.matchingField'))) {
                    component.find('guestRegistrationButton').set('v.disable', true);
                    $A.util.addClass(component.find("newContactFields"), 'hidden');
                } else {
                    helper.validateContact(component);
                }
            }
            else if (event.getParam('fieldId') === 'createUser') {
                component.find('guestPassword').updateValue(null);
            }
        }
    },
    loginFormKeyUp : function(component, event, helper) {
        if (event.keyCode === 13) {
            if (event.path.indexOf(document.getElementById('login-section')) > -1) {
                helper.loginUser(component);
            }
            else {
                if (!component.find('guestRegistrationButton').get('v.disable')) {
                    component.find('guestRegistrationButton').startIndicator();
                    helper.checkoutAsGuest(component);
                }
            }
        }
    },
    loginOverride : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.siteObj')) && !$A.util.isUndefinedOrNull(component.get('v.siteObj.loginOverrideUrl'))) {
            sessionStorage.clear();
            window.location = component.get('v.siteObj.loginOverrideUrl');
        }
    },
    createAccountOverride : function (component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.siteObj')) && !$A.util.isUndefinedOrNull(component.get('v.siteObj.createAccountOverrideUrl'))) {
            sessionStorage.clear();
            window.location = component.get('v.siteObj.createAccountOverrideUrl');
        }
    },
    loginSocialUrl : function(component,event,helper) {
        helper.loginSocialUrl(component,event.currentTarget.dataset['social-url']);
    }
})