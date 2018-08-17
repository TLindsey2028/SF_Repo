/* global FontevaHelper */
/* global $ */

({
    loginUser : function(component) {
        component.find('userName').validate();
        component.find('password').validate();
        if (component.find('userName').get('v.validated') && component.find('password').get('v.validated')) {
            component.find('guestRegistrationButton').set('v.disable',true);
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
                    component.find('guestRegistrationButton').set('v.disable',false);
                    component.find('loginBtn').stopIndicator();
                }
                else {
                    if (!component.get('v.showOverview')) {
                        FontevaHelper.clearCacheItem('usrObj');
                        FontevaHelper.cacheItem('loginUser', true);
                    }
                    var ticketObject = FontevaHelper.getCacheItem('registrationTickets');
                    FontevaHelper.flushAll();
                    if (!$A.util.isUndefinedOrNull(ticketObject)) {
                        FontevaHelper.cacheItem('registrationTickets', ticketObject);
                    }
                    FontevaHelper.cacheItem('loginUser', true);
                    window.location.href = result.getReturnValue();
                }
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
        $A.util.removeClass(component.find('sldsModalForgotPassword'),'slds-fade-in-open');
        $A.util.removeClass(component.find('loginBackdrop'),'slds-backdrop--open');
    },
    validateContact : function(component) {
        component.find('guestRegistrationButton').set('v.disable', false);
        component.find('guestRegistrationButton').startIndicator();
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
            component.find('guestRegistrationButton').stopIndicator();
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
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                    if ($A.util.isEmpty(component.get('v.siteObj.loginOverrideUrl')) && !$A.util.isEmpty(component.find('loginBtn'))) {
                        component.find('loginBtn').set('v.disable', false);
                    }
                    component.find('guestRegistrationButton').stopIndicator();
                }
                else {
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
                window.location = result.getReturnValue();
            }
            component.find('guestRegistrationButton').stopIndicator();
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
                    if (element.fieldId === 'LastName'|| element.fieldId === 'FirstName' ||
                        element.fieldId === 'Email') {
                        return;
                    }
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
    checkoutAsGuest : function(component) {
        if (this.validateGuestForm(component)) {
            if (component.get('v.loginData.createUser')) {
                this.createUserAndContinue(component);
            } else {
                this.createContactAndContinue(component);
            }
        } else {
            component.find('guestRegistrationButton').stopIndicator();
        }
    },
    buildAccounts : function (component) {

        if (component.get('v.storeObj.enableAccountSearch') && component.get('v.storeObj.accountMatchCriteria') === 'All Accounts') {
            var fieldsNames = ['Name'];
            var fields = component.get('v.storeObj.accountSearchResultFields');
            if (!$A.util.isEmpty(fields)) {
                var fieldList = fields.split(',');
                fieldsNames.concat(fieldList);
            }
            $A.createComponent(
                'markup://Framework:InputFields',
                {
                    label: 'Account',
                    fieldType: 'lookup',
                    'aura:id': 'accountId',
                    value: component.get('v.loginData'),
                    otherAttributes: {
                        allowCreate: false,
                        advanced: true,
                        enforceSharingRules: false,
                        concatenateLabel: true,
                        types: {
                            Account: {
                                fieldNames: fieldsNames,
                                filter: component.get('v.queryFilter'),
                                initialLoadFilter: component.get('v.queryFilter')
                            }
                        },
                        otherMethods: {
                            create: false,
                            render: {
                                item: function (item, escape) {
                                    console.log(item);
                                    return '<div class="slds-grid">' +
                                        '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                        '<div class="slds-col slds-size--1-of-1">' +
                                        '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                        '</div>';
                                },
                                option: function (item, escape) {
                                    var lowerText = '';
                                    var fields = component.get('v.storeObj.accountSearchResultFields');
                                    if (!$A.util.isEmpty(fields)) {
                                        var fieldList = fields.split(',');
                                        fieldList.forEach(function (element) {
                                            if (item.sObj.hasOwnProperty(element.trim())
                                                && !$A.util.isEmpty(item.sObj[element.trim()])
                                                && element.trim().toLowerCase() !== 'name') {
                                                if (lowerText === '') {
                                                    lowerText = item.sObj[element.trim()];
                                                } else {
                                                    lowerText += '&nbsp;&nbsp;' + '&bull;' + '&nbsp;&nbsp;' + escape(item.sObj[element.trim()].trim());
                                                }
                                            }
                                        });
                                    }
                                    return '<div class="slds-grid">' +
                                        '<div class="slds-p-right--x-small slds-p-top--xxx-small">' +
                                        '<img src="' + $A.get('$Resource.Framework__SLDS_Icons') +
                                        '/icons/utility/user_60.png" width="12"/>' +
                                        '</div>' +
                                        '<div class="slds-grid slds-wrap slds-size--1-of-1">' +
                                        '<div class="slds-col slds-size--1-of-1">' +
                                        '<strong>' + escape(item.sObj.Name) + '</strong>' +
                                        '</div>' +
                                        '<div class="slds-col slds-size--1-of-1 slds-text-body--small">' +
                                        lowerText +
                                        '</div>' +
                                        '</div>' +
                                        '</div>';
                                }
                            }
                        }
                    }
                }, function (cmp) {
                    cmp.set('v.value', component.get('v.loginData'));
                    component.find('bodycomp').set('v.body', cmp);
                }
            );
        }
    },
    loginSocialUrl : function (component,socialUrl) {
        var updateAttendeePromise = ActionUtils.executeAction(this, component, 'c.loginSocialUrl', {
            socialUrl: socialUrl,
            startUrl: window.location.href.split('#')[0]
        });
        updateAttendeePromise.then(
            $A.getCallback(function (result) {
                window.location = result;
            }));
    }
})