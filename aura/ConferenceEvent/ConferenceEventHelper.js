/* global FontevaHelper */
({
    divId : 'conference-event-wrapper',
    REGISTER_INITIATED: 'lte_REGISTER_INITIATED',
    registerEvent: function (component) {
        var usr = component.get('v.params.usr');
        var checkoutAsGuest = FontevaHelper.getCacheItem('checkoutAsGuest');
        if ((!$A.util.isEmpty(usr) && usr.isAuthenticated) || (!$A.util.isEmpty(checkoutAsGuest) && checkoutAsGuest)) {
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            compEvent.setParams({
                componentName: 'LTE:EventRegistrationWrapper',
                componentParams: {
                    attendeeObj: component.get('v.params.attendeeObj'),
                    usr: component.get('v.params.usr'),
                    eventObj: component.get('v.params.record'),
                    siteObj: component.get('v.params.siteObj'),
                    storeObj: component.get('v.params.storeObj'),
                    salesOrderObj: null,
                    identifier: 'EventWrapper'
                }
            });
            compEvent.fire();
        } else {
            var dataObj = {
                returnUrl: location.href,
                storeObj: component.get('v.params.storeObj'),
                siteObj: component.get('v.params.siteObj'),
                eventId: component.get('v.params.record.id')
            };
            this.toggleRegButtonClass(component);
            window.localStorage.setItem(this.REGISTER_INITIATED, 'yes');
            FontevaHelper.showComponent(component, 'LTE:Login', dataObj, this.divId);
        }
    },
    showMainView : function (component) {
        var data = {
            eventObj: component.get('v.params.record'),
            siteObj: component.get('v.params.siteObj'),
            storeObj: component.get('v.params.storeObj'),
            isPreview : component.get('v.isPreview'),
            usr : component.get('v.params.usr')
        };
        FontevaHelper.showComponent(component, 'LTE:EventMainView', data, this.divId);
        document.title = component.get('v.params.record.name');
    },
    registerForTickets : function (component,usrObj,ttWaitlistObj) {
        var self = this;
        if (Object.keys(ttWaitlistObj.tickets).length === 0 && Object.keys(ttWaitlistObj.waitlistTickets).length === 0) {
            FontevaHelper.showErrorMessage('At Least One Ticket Should Be Selected.');
        }
        else {
            var contactId;
            if (!$A.util.isEmpty(usrObj)) {
                contactId = usrObj.contactId;
            }
            if ($A.util.isEmpty(contactId) && !$A.util.isEmpty(FontevaHelper.getCacheItem('guestCheckoutContact'))) {
                contactId = FontevaHelper.getCacheItem('guestCheckoutContact').id;
            }
            var soId;
            var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
            if (!$A.util.isEmpty(soCookie)) {
                soCookie = JSON.parse(soCookie);
                if (contactId === soCookie.contact && usrObj.id === soCookie.usr) {
                    soId = soCookie.salesOrderId;
                }
            }
            var action = component.get('c.registerForTickets');
            action.setParams({
                salesOrderId: soId,
                contactId: contactId,
                businessGroup : component.get('v.params.storeObj.businessGroup'),
                gateway : component.get('v.params.storeObj.gateway'),
                ticketsToPurchase: JSON.stringify(ttWaitlistObj.tickets),
                ticketsToWaitlist: JSON.stringify(ttWaitlistObj.waitlistTickets),
                ticketGroupTypes : JSON.stringify(ttWaitlistObj.ticketGroupTypes),
                eventId : component.get('v.params.record.id'),
                sourceCode : FontevaHelper.getUrlParameter('sourcecode')
            });
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var salesOrderObj = result.getReturnValue();
                    try {
                        FontevaHelper.setCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart',
                            JSON.stringify({contact: contactId, usr: usrObj.id, salesOrderId: salesOrderObj.id}), 1);
                    }
                    catch (err) {
                    }
                    self.pollQueuableJob(component,salesOrderObj);

                }
            });
            $A.enqueueAction(action);
        }
    },
    pollQueuableJob : function (component,salesOrderObj) {
        var self = this;
        var soCompletedCalled = false;
        var interval = setInterval($A.getCallback(function(){
            var action = component.get('c.pollQueueableJob');
            action.setParams({jobId : salesOrderObj.queuableJobId});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    if (result.getReturnValue()) {
                        clearInterval(interval);
                        if (!soCompletedCalled) {
                            soCompletedCalled = true;
                            self.getCompletedSalesOrder(component, salesOrderObj);
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }),300);
    },
    getCompletedSalesOrder : function (component,salesOrderObj) {
        var regGroupId = null;
        if (!$A.util.isEmpty(component.get('v.params')) && !$A.util.isEmpty(component.get('v.params.usr')) && !$A.util.isEmpty(component.get('v.params.usr.attendeeObj'))) {
            regGroupId = component.get('v.params.usr.attendeeObj.regGroupId');
        }
        ActionUtils.executeAction(this, component, 'c.getCompletedSalesOrder', {
            salesOrderId : salesOrderObj.id,
            eventId : component.get('v.params.record.id'),
            regGroupId : regGroupId
        })
        .then(function(returnObj) {
            returnObj.waitlistEntries = salesOrderObj.waitlistEntries;
            var compEvent = $A.get('e.Framework:ShowComponentEvent');
            var secondaryCompName = 'LTE:EventRegistrationAttendeeSelection';
            if (component.get('v.params.record.isSeatingEvent') && returnObj.lines.length > 0) {
                secondaryCompName = 'LTE:EventRegistrationSeatingWrapper';
            }

            var paramObj = {
                componentName: 'LTE:'+'EventRegistrationWrapper',
                componentParams: {
                    attendeeObj : component.get('v.params.attendeeObj'),
                    usr : component.get('v.params.usr'),
                    eventObj : component.get('v.params.record'),
                    siteObj : component.get('v.params.siteObj'),
                    storeObj : component.get('v.params.storeObj'),
                    salesOrderObj: returnObj,
                    secondaryCompName : secondaryCompName,
                    previousComponent: 'markup://LTE:'+'EventRegistrationTicketSelection',
                    identifier: 'EventWrapper'
                }
            };

            if (returnObj.lines.length === 1 && returnObj.waitlistEntries.length === 0 &&
                  !returnObj.lines[0].hasForm && !component.get('v.params.record.isSeatingEvent') && !component.get('v.params.record.sessionsEnabled')) {
                paramObj = {
                    componentName: 'LTE:'+'EventRegistrationWrapper',
                    componentParams : {
                        attendeeObj : component.get('v.params.attendeeObj'),
                        usr : component.get('v.params.usr'),
                        eventObj : component.get('v.params.record'),
                        siteObj : component.get('v.params.siteObj'),
                        storeObj : component.get('v.params.storeObj'),
                        salesOrder : returnObj.id,
                        salesOrderObj : returnObj,
                        secondaryCompName : 'markup://LTE:'+'EventRegistrationCheckoutSummary',
                        identifier : 'EventWrapper'
                    }
                };
            }

            compEvent.setParams(paramObj);
            compEvent.fire();
        });
    },
    cancelReg : function (component,showMainComponent) {
        var self = this;
        var action = component.get('c.cancelRegistration');
        var soId;
        var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
        if (!$A.util.isEmpty(soCookie)) {
            soCookie = JSON.parse(soCookie);
            soId = soCookie.salesOrderId;
        }
        action.setParams({eventId : component.get('v.params.record.id'),
        salesOrder : soId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                if (showMainComponent) {
                    self.logoutGuestUser(component);
                    var compEvent = $A.get('e.Framework:ShowComponentEvent');
                    compEvent.setParams({
                        componentName: 'LTE:EventMainView',
                        componentParams: {
                            attendeeObj : component.get('v.params.attendeeObj'),
                            usr: component.get('v.params.usr'),
                            eventObj: component.get('v.params.record'),
                            siteObj: component.get('v.params.siteObj'),
                            storeObj: component.get('v.params.storeObj'),
                            identifier: 'ConfMainView'
                        }

                    });
                    compEvent.fire();
                }
            }
        });
        $A.enqueueAction(action);
    },
    logoutGuestUser : function (component) {
        if (component.get('v.params.usr.isGuest')) {
            component.set('v.params.usr.isAuthenticated',false);
            component.set('v.params.usr.isGuest',false);
        }
        FontevaHelper.clearCacheItem('checkoutAsGuest');
        FontevaHelper.clearCacheItem('guestCheckoutContact');
    },
    showNewPanel : function(component,panelToShow,pageName) {
        var linkPanelToShowObj = null;
        component.find('linkPanel').forEach(function(element){
            $A.util.removeClass(element,'active');
            if (element.getElement().dataset.type === panelToShow) {
                linkPanelToShowObj = element;
            }
        });


        if (!$A.util.isEmpty(linkPanelToShowObj)) {
            $A.util.addClass(linkPanelToShowObj,'active');
            if (!$A.util.isEmpty(pageName)) {
                document.title = pageName+' - '+component.get('v.params.record.name');
            }
        }
        var compEvent = $A.get('e.LTE:EventChangePageEvent');
        compEvent.setParams({title : pageName,type : panelToShow});
        compEvent.fire();
        this.toggleSideNav(component);
    },
    toggleSideNav : function (component) {
        setTimeout($A.getCallback(function(){
            $A.util.toggleClass(component.find('slds-page'),'active');
            $A.util.toggleClass(component.find('side-nav'),'active');
        }),200);
    },
    addEvent : function( obj, type, fn ) {
        if ( obj.attachEvent ) {
            obj['e'+type+fn] = fn;
            obj[type+fn] = function(){obj['e'+type+fn]( window.event );};
            obj.attachEvent( 'on'+type, obj[type+fn] );
        } else {
            obj.addEventListener( type, fn, false );
        }
    },
    loadMainView : function (component) {
        var data = {
            eventObj: component.get('v.params.record'),
            siteObj: component.get('v.params.siteObj'),
            storeObj: component.get('v.params.storeObj'),
            usr: component.get('v.params.usr'),
            isPreview: component.get('v.params.isPreview'),
            attendeeObj: component.get('v.params.attendeeObj')
        };
        FontevaHelper.showComponent(component, 'LTE:'+'EventMainView', data, this.divId);
        this.cancelReg(component, false);
    },
    showLogin : function (component) {
        var compEvent = $A.get('e.Framework:'+'ShowComponentEvent');
        compEvent.setParams({
            componentName: 'markup://LTE:'+'Login',
            componentParams: {
                storeObj: component.get('v.params.storeObj'),
                siteObj : component.get('v.params.siteObj'),
                returnUrl : location.href,
                showOverview : true,
                identifier: 'ConfMainView'
            }

        });
        compEvent.fire();
        this.toggleSideNav(component);
    }
})