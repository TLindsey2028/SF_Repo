/* global FontevaHelper */
/* global _ */
({
    doInit: function (component) {
        document.title = $A.get('$Label.LTE.Event_Purchase_Summary_Title')+' - '+component.get('v.eventObj.name');

        var self = this;
        setTimeout($A.getCallback(function(){
            self.pullTicketSummary(component, $A.getCallback(function (so) {
                if ($A.util.isEmpty(so.lines) && !$A.util.isEmpty(so.waitlistEntries)) {
                    so.waitlistOnly = true;
                }
                component.set('v.lines', so.lines);
                component.set('v.ownerName', so.purchaser);
                component.set('v.so', so);
                component.set('v.isFreeOrder', so.isFreeOrder);
                if (component.get('v.so.isPosted') === true) {
                    window.location.hash = '';
                    return;
                }
                else if (window.location.hash !== "#rp-checkout") {
                    var hashEvent = $A.get("e.LTE:HashChangingEvent");
                    hashEvent.setParams({hash: "rp-checkout"});
                    hashEvent.fire();
                }
                self.showSummaryDetail(component, so);
                self.loadPayNow(component);
                self.loadAddressDiv(component);
                FontevaHelper.showLoadedData(component);
                FontevaHelper.showMainData();
                component.find('eventRegistrationSummary').set('v.so',so);
                component.find('eventRegistrationSummary').doInit();
            }));
        }), 1000);
    },
    pullTicketSummary: function(component, cb) {
        var attendeeObj = component.get('v.attendeeObj');
        var registrationGroup = null;
        // Use registrationGroupId if New Attendee was clicked in ManageRegistration form
        if (attendeeObj && attendeeObj.useExistingRegistrationGroup) {
            registrationGroup = attendeeObj.regGroupId;
        }
        if (!$A.util.isEmpty(component.get('v.usr.attendeeObj')) &&
            !$A.util.isEmpty(component.get('v.usr.attendeeObj.regGroupId'))) {
            registrationGroup = component.get('v.usr.attendeeObj.regGroupId');
        }
        var invitedAttendee = null,
            contactId = component.get('v.usr.contactId');
        if (component.get('v.eventObj.isInvitationOnly')) {
            invitedAttendee = attendeeObj.id;
            // For invitation only event logged in user can be different than invited user (id from RSVP link)
            // Replace contact id and reg group id using RVSP attendee
            contactId = attendeeObj.contactId;
            if (attendeeObj.regGroupId) {
                registrationGroup = attendeeObj.regGroupId;
            }
        }
        ActionUtils.executeAction(this, component, 'c.getTicketSummary', {
            eventId: component.get('v.eventObj.id'),
            salesOrderId: component.get('v.salesOrderObj.id'),
            createContactForAttendees : component.get('v.eventObj.createContactForAttendees'),
            regGroupId: registrationGroup,
            contactId: contactId,
            invitedAttendee: invitedAttendee,
            closeSalesOrder : true})
        .then(
            function (result) {
                cb && cb(result);
            },
            function(error){});
    },
    previousStep: function (component) {
        var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');
        toolBarEvent.setParams({
            total: component.get('v.salesOrderObj.total'),
            title: $A.get('$Label.LTE.Registration_Selection')
        });
        toolBarEvent.fire();

        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        compEvent.setParams({action  : 'previous'});
        compEvent.fire();
    },
    checkout: function (component,fireCustomPayment) {
        var taxShippingValidated = true;
        if (component.get('v.so.hasTaxItems')) {
            $A.getComponent(component.get('v.addressGlobalId')).validate();
            taxShippingValidated = $A.getComponent(component.get('v.addressGlobalId')).get('v.validated');
        }

        if (taxShippingValidated) {
            if (fireCustomPayment) {
                if (!component.get('v.disableCustomSubmit')) {
                    component.set('v.disableCustomSubmit', true);
                    var compEvent = $A.get('e.OrderApi:SubmitOffsitePaymentEvent');
                    compEvent.fire();
                }
            }
            else {
                this.fireDisableProgressBarEvent(component, true);
                $A.getComponent(component.get('v.paymentGlobalId')).processTokenPayment();
            }
        }
        else {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Tax_Required_Field_Missing'));
            var buttonEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
            buttonEvent.setParams({
                group : 'paymentButtons',
                action : 'stop'
            });
            buttonEvent.fire();
        }
    },
    confirmWaitlistObj: function (component) {
        var action = component.get('c.confirmWaitlistObj');
        var invitedAttendee = null;
        if (component.get('v.eventObj.isInvitationOnly')) {
          invitedAttendee = component.get('v.attendeeObj.id');
        }
        action.setParams({
          salesOrderId: component.get('v.salesOrderObj.id'),
          invitedAttendee: invitedAttendee
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                FontevaHelper.showErrorMessage($A.get('$Label.LTE.Waitlist_Confirmation_Text'), 'success', $A.get('$Label.LTE.Waitlist_Confirmation_Title'));

                var compEvent = $A.get('e.LTE:ConfirmWaitlistEvent');
                var attendeeObj = result.getReturnValue();
                if (!$A.util.isEmpty(invitedAttendee)) {
                    compEvent.setParams({attendeeObj: attendeeObj});
                }
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    confirmFreeOrder: function (component) {
        var taxShippingValidated = true;
        if (component.get('v.so.hasTaxItems') && !$A.util.isEmpty($A.getComponent(component.get('v.addressGlobalId')))) {
            $A.getComponent(component.get('v.addressGlobalId')).validate();
            taxShippingValidated = $A.getComponent(component.get('v.addressGlobalId')).get('v.validated');
        }

        if (taxShippingValidated) {
            var attendeeObj = component.get('v.attendeeObj');
            var registrationGroup = null;
            // Use registrationGroupId if New Attendee was clicked in ManageRegistration form
            if (attendeeObj && attendeeObj.useExistingRegistrationGroup) {
                registrationGroup = attendeeObj.regGroupId;
            }
            if (!$A.util.isEmpty(component.get('v.usr.attendeeObj')) &&
                !$A.util.isEmpty(component.get('v.usr.attendeeObj.regGroupId'))) {
                registrationGroup = component.get('v.usr.attendeeObj.regGroupId');
            }
            var invitedAttendee = null;
            var contactId = component.get('v.usr.contactId');
            if (component.get('v.eventObj.isInvitationOnly')) {
                invitedAttendee = attendeeObj.id;
                contactId = attendeeObj.contactId;
                if (!$A.util.isEmpty(attendeeObj.regGroupId)) {
                    registrationGroup = attendeeObj.regGroupId;
                }
            }
            var action = component.get('c.confirmOrder');
            action.setParams({
                salesOrderId: component.get('v.salesOrderObj.id'),
                regGroupId: registrationGroup,
                contactId: contactId,
                eventId: component.get('v.eventObj.id'),
                invitedAttendee: invitedAttendee
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var compEvent = $A.get('e.Framework:ShowComponentEvent');
                    compEvent.setParams({
                        componentName: 'markup://LTE:EventPaymentReceipt',
                        componentParams: {
                            salesOrder: component.get('v.salesOrderObj.id'),
                            eventObj: component.get('v.eventObj'),
                            siteObj: component.get('v.siteObj'),
                            usr: component.get('v.usr'),
                            identifier: 'EventRegistrationWrapper'
                        }

                    });
                    compEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }
        else {
            FontevaHelper.showErrorMessage($A.get('$Label.LTE.Tax_Required_Field_Missing'));
            var buttonEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
            buttonEvent.setParams({
                group : 'paymentButtons',
                action : 'stop'
            });
            buttonEvent.fire();
        }
    },
    loadAddressDiv : function(component) {
         if (!component.get('v.so.waitlistOnly')) {
             setTimeout($A.getCallback(function(){
                 var buttonElement = component.find('processPayment');
                 if (!$A.util.isEmpty(buttonElement)) {
                    if ($A.util.isArray(component.find('processPayment'))) {
                        buttonElement = component.find('processPayment')[0];
                    }
                     buttonElement.set('v.disable', false);
                 }
             }),750);
         }
    },
    hexToRgb: function(hex) {
        if ($A.util.isEmpty(hex)) {
            return "";
        }
        var bigint = parseInt(hex.substring(1), 16); //strip the hash
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return "rgb(" + r + "," + g + "," + b + ")";
    },
    loadPayNow: function (component) {
        if (!component.get('v.paymentGlobalId')) {
            var paymentObject = component.get('v.so');
            var styles = component.get('v.eventObj').lightningStyles +  '.fonteva .slds-form-element__label {display: inline-block;color: #000;font-size: .75rem;line-height: 1.375;margin-right: .75rem;margin-bottom: .25rem;font-weight: 700;} abbr[title] {text-decoration: none;} @media(max-width:30rem){.slds-size--1-of-2.slds-m-bottom-x--small{ width: 100%;}}';
            if (component.get('v.lines').length > 0 && !component.get('v.isFreeOrder')) {
                var redirectUrl = window.location.origin+window.location.pathname+'?id='+FontevaHelper.getUrlParameter('id');
                if (!$A.util.isUndefinedOrNull(FontevaHelper.getUrlParameter('site'))) {
                    redirectUrl += '&site='+FontevaHelper.getUrlParameter('site');
                }

                $A.createComponent(
                    'markup://OrderApi:CheckoutWrapper',
                    {
                        salesOrderId : paymentObject.salesOrderId,
                        paymentObj : paymentObject,
                        isThemed : false,
                        customerId: component.get('v.salesOrderObj.customerId'),
                        storeId : component.get('v.storeObj.id'),
                        offsiteRedirectUrl : redirectUrl,
                        postbackRedirectUrl : redirectUrl,
                        suppressOffsiteButtons : true,
                        paymentSuccessReturnObj : {
                            componentName: 'markup://LTE:EventPaymentReceipt',
                            componentParams: {
                                salesOrder: component.get('v.salesOrderObj.id'),
                                eventObj : component.get('v.eventObj'),
                                siteObj : component.get('v.siteObj'),
                                usr : component.get('v.usr'),
                                identifier: 'EventRegistrationWrapper'
                            }
                        },
                        'renderAsTabs': true,
                        environmentKey: component.get('v.so.paymentEnvKey'),
                        'aura:id': 'payNowComp',
                        showOfflinePayment : component.get('v.storeObj.enableInvoicePayment'),
                        enableSavePayment : component.get('v.salesOrderObj.enableSavePayment'),
                        iFrameStyles: styles,
                        textColor : this.hexToRgb(component.get('v.eventObj').textColor)
                    }, function (cmp, status, message) {
                        if (status !== 'SUCCESS') {
                            FontevaHelper.showErrorMessage('Unable to create PayNow component. ' + message);
                            return;
                        }
                        var divComponent = component.find("payNow");
                        component.set('v.paymentGlobalId', cmp.getGlobalId());
                        divComponent.set('v.body', [cmp]);
                    }
                );
            }
        }
    },
    editAttendees: function (component) {
        var changeEvt = $A.get('e.LTE:ChangeStepEvent');
        changeEvt.setParams({'stepId': 0});
        changeEvt.fire();
    },
    showSummaryDetail: function(component, salesOrder) {
        try {
            var eventRegistrationSummary = component.find('eventRegistrationSummary');
            component.set('v.salesOrderObj', salesOrder);
            var params = {
                attendeeObj : component.get('v.attendeeObj'),
                usr : component.get('v.usr'),
                eventObj : component.get('v.eventObj'),
                siteObj : component.get('v.siteObj'),
                storeObj : component.get('v.storeObj'),
                so : component.get('v.salesOrderObj'),
                readOnly: false,
                initialPurchase: component.get('v.initialPurchase'),
                processingChangesCmp : eventRegistrationSummary.find('processingChanges')
            };
            var divComponent = eventRegistrationSummary.find('summaryDetailDiv');
            var divBody = divComponent.get("v.body");
            if (divBody.length > 0) {
                divBody.forEach(function (element) {
                    element.destroy();
                });
            }
            FontevaHelper.showComponent(eventRegistrationSummary, 'LTE:EventRegistrationSummaryDetail', params, 'summaryDetailDiv');
        }
        catch (e) {
            console.log(e);
        }
    },
    handleProcessingChangesEvent : function(component,processingChanges,so) {
        var self = this, eventRegistrationSummary = component.find('eventRegistrationSummary');
        if (processingChanges) {
            if (!$A.util.isUndefinedOrNull(component.find('processPayment'))) {
                var buttonElement = component.find('processPayment');
                if ($A.util.isArray(component.find('processPayment'))) {
                    buttonElement = component.find('processPayment')[0];
                }
                buttonElement.set('v.disable', true);
                if (!$A.util.isEmpty(eventRegistrationSummary)) {
                    $A.util.removeClass(eventRegistrationSummary.find('processingChanges'), 'hidden');
                }
            }
        }
        else {
            var asyncCallback = $A.getCallback(function (component, so) {
                var timer = 0;
                if (component.get('v.isFreeOrder') !== so.isFreeOrder) {
                    timer = 500;
                }
                component.set('v.isFreeOrder', so.isFreeOrder);

                //update summary
                self.showSummaryDetail(component, so);
                setTimeout($A.getCallback(function () {
                    if (!$A.util.isUndefinedOrNull(component.find('processPayment'))) {
                        var buttonElement = component.find('processPayment');
                        if ($A.util.isArray(component.find('processPayment'))) {
                            buttonElement = component.find('processPayment')[0];
                        }
                        buttonElement.set('v.disable', false);
                        if (!$A.util.isEmpty(eventRegistrationSummary)) {
                            $A.util.addClass(eventRegistrationSummary.find('processingChanges'), 'hidden');
                        }
                    }
                }), timer);
            });
            if (!$A.util.isUndefinedOrNull(so)) {
                asyncCallback(component, so);
            }
            else {
                this.pullTicketSummary(component, function (so) {
                    component.set('v.so', so);
                    asyncCallback(component, so);
                });
            }
        }
    },
    fireDisableProgressBarEvent : function(component, setDisable) {
        var disableProgressEvent = $A.get('e.LTE:DisableProgressFlowBarEvent');
        disableProgressEvent.setParams({
            setDisable : setDisable
        });
        disableProgressEvent.fire();
    }

})