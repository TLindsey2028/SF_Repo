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

        if (component.get('v.storeObj.defaultCheckout') && component.get('v.storeObj.defaultCheckout') === 'Guest Checkout' && component.get('v.storeObj.guestCheckoutEnabled')) {
            component.set('v.showLoginModal', false);
            helper.retrieveFieldSetDescriptions(component);
        } else {
            component.set('v.showLoginModal', true);
        }
        var loginModal = component.find('loginModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(loginModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
        FontevaHelper.disableBodyScroll();
        helper.cleanUpOnLoad(component);
    },
    loginAction : function(component, event, helper) {
        helper.loginUser(component);
    },
    showForgotPasswordModal : function(component) {
        $A.util.addClass(component.find('slds-modal--forgotPassword'),'slds-fade-in-open');
        $A.util.addClass(component.find('loginBackdrop'),'slds-backdrop--open');
        $A.util.removeClass(component.find('loginModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
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
        if (helper.validateGuestForm(component)) {
            if (component.get('v.loginData.createUser')) {
                helper.createUserAndContinue(component);
            } else {
                helper.createContactAndContinue(component);
            }
        } else {
            if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                component.find('guestRegistrationButton').stopIndicator();
            }
        }
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
                        if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                            component.find('guestRegistrationButton').set('v.disable', true);
                        }
                        $A.util.addClass(component.find("newContactFields"), 'hidden');
                    } else {
                        helper.validateContact(component);
                    }
                }
            } else if (event.getParam('fieldId') === 'matchingField'){
                if ($A.util.isEmpty(component.get('v.loginData.matchingField'))) {
                    if (!$A.util.isEmpty(component.find('guestRegistrationButton'))) {
                        component.find('guestRegistrationButton').set('v.disable', true);
                    }
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
            helper.loginUser(component);
        } else if (event.keyCode === 27) {
            $A.util.removeClass(component.find('loginModal'), 'slds-fade-in-open');
            $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        }
    },
    hideLoginModal : function(component) {
        $A.util.removeClass(component.find('loginModal'), 'slds-fade-in-open');
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        FontevaHelper.enableBodyScroll();
    },
    showGuestModal : function(component, event, helper) {
        component.set('v.showLoginModal', false);
        helper.retrieveFieldSetDescriptions(component);
        FontevaHelper.disableBodyScroll();
    },
    showLoginModal : function(component) {
        component.set('v.showLoginModal', true);
        FontevaHelper.disableBodyScroll();
    },
    loginOverride : function (component) {
        sessionStorage.clear();
        $(location).attr('href',component.get('v.siteObj.loginOverrideUrl'));
    },
    createAccountOverride : function (component) {
        sessionStorage.clear();
        $(location).attr('href',component.get('v.siteObj.createAccountOverrideUrl'));
    }
})