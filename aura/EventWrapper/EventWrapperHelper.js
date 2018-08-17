({
    divId : 'eventBody',
    siteCookieName : 'apex__fonteva_site',
    mainViewLoaded: false,
    suppressHashChange: false,
    handleHashChangingEvent: function(component, hash) {
        if (window.location.hash.slice(1) !== hash) {
            this.suppressHashChange = true;
            window.location.hash = hash;
        }
    },
    getSalesOrderIdFromCookie: function() {
        var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
        if (!$A.util.isEmpty(soCookie)) {
            soCookie = JSON.parse(soCookie);
            return soCookie.salesOrderId;
        }
        return null;
    },
    checkComponentToLoad : function (component) {
        if (!$A.util.isUndefinedOrNull(FontevaHelper.getUrlParameter('epayment'))) {
            if (FontevaHelper.getUrlParameter('is_success')) {
                this.buildPaymentReceiptComponent(component);
            }
            else {
                this.buildPaymentSummaryComponent(component,FontevaHelper.getUrlParameter('sales_order'));
            }
            return;
        }
        if (window.location.hash === '#rp-checkout' && FontevaHelper.getUrlParameter('sales_order')) {
            this.buildPaymentSummaryComponent(component, FontevaHelper.getUrlParameter('sales_order'));
            return;
        }
        if (window.location.hash && window.location.hash.startsWith("#rp-") && !component.get('v.so')) {
            //bail out. We don't have the SO. Probably a weird state like browser refresh
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                message: $A.get('$Label.LTE.Cant_Load_Reg_Process'),
                type: 'info'
            });
            toastEvent.fire();
        }
        this.buildEventDetailComp(component);
    },
    detectBackOrForward: function (component, onChange) {
        var hash = window.location.hash, length = window.history.length;
        if (hash.startsWith("#rp-")) {
            this.mainViewLoaded = false;
        }
        if (window.hashHistory.length && window.historyLength === length) {
            var previousHash=null;
            var indexOf2ndToLastItem = window.hashHistory.length - 2;
            if (window.hashHistory[indexOf2ndToLastItem] === hash) {
                previousHash = window.hashHistory.pop();
                // onBack();
            } else {
                window.hashHistory.push(hash);
                previousHash = window.hashHistory[indexOf2ndToLastItem+1];
                // onForward();
            }
            if (!this.suppressHashChange) {
                onChange(component, previousHash);
            }
        } else {
            window.hashHistory.push(hash);
            window.historyLength = length;
        }
        if (this.suppressHashChange) {
            this.suppressHashChange = false;
        }
    },
    onHashChange: function(component, previousHash) {
        var handled = false;
        var hash = window.location.hash;
        var sortedRegProcessHashes = ['#rp-tickets', '#rp-seating', '#rp-sessions', '#rp-recommended', '#rp-checkout', '#rp-receipt'];
        var toRegProcess = hash && hash.startsWith("#rp-");
        var fromRegProcess = previousHash && previousHash.startsWith("#rp-");
        if (toRegProcess && fromRegProcess) {
            var dir = null;
            var currentIndex = sortedRegProcessHashes.indexOf(hash);
            var previousIndex = sortedRegProcessHashes.indexOf(previousHash);
            if (currentIndex < previousIndex) {//going back
                dir = "previous";
            }
            else if (currentIndex > previousIndex) {
                dir = "next";
            }
            else {
                console.log("Somehow hash indexes are equal. hash = " + hash + "; previousHash = " + previousHash);
            }

            if (dir) {
                var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
                compEvent.setParams({action: dir});
                compEvent.fire();
                handled = true;
            }
        }
        else if (toRegProcess && !fromRegProcess) { //from mainView to regProcess
            this.checkComponentToLoad(component);
            handled = true;
        }
        else if (!toRegProcess && !fromRegProcess) { //from mainView to mainView
            var hashEvent = $A.get('e.LTE:HashChangedEvent');
            hashEvent.fire();
            handled = true;
        }
        if (!handled) {
            this.buildEventDetailComp(component);
        }
    },
    buildPaymentSummaryComponent : function (component,salesOrderId) {
        ActionUtils
            .executeAction(this, component, 'c.getSalesOrder', {
                salesOrderId: salesOrderId,
                eventId: component.get('v.params.record.id'),
                doDuplicateCheck: true
            })
            .then(
                function (so) {
                    var compEvent = $A.get('e.Framework:ShowComponentEvent');
                    compEvent.setParams({
                        componentName: 'markup://LTE:' + 'EventRegistrationWrapper',
                        componentParams: {
                            usr: component.get('v.params.usr'),
                            eventObj: component.get('v.params.record'),
                            siteObj: component.get('v.params.siteObj'),
                            storeObj: component.get('v.params.storeObj'),
                            salesOrderObj: so,
                            secondaryCompName: 'markup://LTE:' + 'EventRegistrationCheckoutSummary',
                            previousComponent: 'markup://LTE:' + 'EventRegistrationTicketSelection',
                            identifier: 'EventWrapper'
                        }
                    });
                    compEvent.fire();
                    if (!$A.util.isUndefinedOrNull(FontevaHelper.getUrlParameter('message'))) {
                        setTimeout($A.getCallback(function () {
                            var messageValue = FontevaHelper.getUrlParameter('message');
                            FontevaHelper.showErrorMessage(messageValue.replace(/\+/g, ' '));
                        }), 500);
                    }
                },
                function(error){}
            );
    },
    buildPaymentReceiptComponent : function (component) {
        $A.createComponent('markup://LTE:'+'EventPaymentReceipt',{
            salesOrder: FontevaHelper.getUrlParameter('sales_order'),
            eventObj : component.get('v.params.record'),
            siteObj : component.get('v.params.siteObj'),
            usr : component.get('v.params.usr'),
        },function(cmp) {
            var divBody = component.find('eventBody');
            divBody.set('v.body',[cmp]);
        });
    },
    buildEventDetailComp : function(component) {
        $A.createComponent('markup://LTE:'+'ConferenceEvent',{
            params : component.get('v.params')
        },function(cmp) {
            var divBody = component.find('eventBody');
            divBody.set('v.body',[cmp]);
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
                window.onbeforeunload = null;
                if (showMainComponent) {
                    self.logoutGuestUser(component);
                    self.buildEventDetailComp(component);
                }
                window.location.hash = '';
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
    confirmWaitlist : function(component, event) {
        if (!$A.util.isEmpty(event.getParams())) {
            component.set('v.params.attendeeObj', event.getParam('attendeeObj'));
        }
        this.logoutGuestUser(component);
        this.buildEventDetailComp(component);
    },
    getUpdatedSalesOrder : function(component) {
        var soId, self = this;
        var soCookie = FontevaHelper.getCookie('apex__' + FontevaHelper.getCacheItem('organizationId') + '-fonteva-lightning-shopping-cart');
        if (!$A.util.isEmpty(soCookie)) {
            soCookie = JSON.parse(soCookie);
            soId = soCookie.salesOrderId;
        }
        self.toggleProcessingChanges(component, 'remove');

        if ($A.util.isEmpty(soId) || $A.util.isEmpty(component.get('v.params.record.id'))) {
            return;
        }
        var action = component.get('c.getSalesOrder');
        action.setParams({
            salesOrderId : soId,
            eventId : component.get('v.params.record.id'),
            doDuplicateCheck : false
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    FontevaHelper.showErrorMessage(error.message);
                });
            }
            else {
                self.showSummaryDetail(component, _.cloneDeep(result.getReturnValue()));
                self.toggleProcessingChanges(component, 'add');
            }
        });

        $A.enqueueAction(action);
    },
    showSummaryDetail: function(component, resultObj) {
        try {
            var cmpParams = component.get('v.params');
            var eventRegistrationSummary = component.find('regFlowSummary');
            var checkOutHash =  window.location.hash;
            if (!$A.util.isEmpty(checkOutHash) && checkOutHash.indexOf('rp-checkout') > -1) {
                eventRegistrationSummary.set('v.so', resultObj);
                eventRegistrationSummary.set('v.displayDiscount', true);
                eventRegistrationSummary.set('v.displayTotal', true);
            } else {
                eventRegistrationSummary.set('v.displayDiscount', false);
                eventRegistrationSummary.set('v.displayTotal', false);
            }
            var params = {
                attendeeObj : cmpParams.attendeeObj,
                usr : cmpParams.usr,
                eventObj : cmpParams.record,
                siteObj : cmpParams.siteObj,
                storeObj : cmpParams.storeObj,
                so : resultObj,
                readOnly: false,
                initialPurchase: $A.util.isEmpty(cmpParams.attendeeObj) ? true : false,
                processingChangesCmp : eventRegistrationSummary.find('processingChanges'),
                regSummaryNested : true
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
    toggleProcessingChanges : function(component, action) {
        var regFlowSummary = component.find('regFlowSummary');
        if (!$A.util.isEmpty(regFlowSummary.find('processingChanges'))) {
            if (action === 'remove') {
                $A.util.removeClass(regFlowSummary.find('processingChanges'), 'hidden');
            } else if (action === 'add') {
                $A.util.addClass(regFlowSummary.find('processingChanges'), 'hidden');
            }
        }
    },
    getSO: function(component) {
        if (component.get('v.so'))
            return Promise.resolve(component.get('v.so'));

        return ActionUtils.executeAction(this, component, 'c.getSalesOrder', {
            salesOrderId: this.getSalesOrderIdFromCookie(),
            eventId: component.get('v.params.record.id'),
            doDuplicateCheck: false
        })
        .then(function(result) {
            component.set('v.so', result);
            return result
        });
    }
})