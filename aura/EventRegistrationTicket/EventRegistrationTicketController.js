({
    doInit: function(component, event) {
        if (!component.get('v.readOnly')) {
            var hashEvent = $A.get("e.LTE:HashChangingEvent");
            hashEvent.setParams({hash: 'rp-tickets'});
            hashEvent.fire();
        }
    },
    handleFieldChangeEvent : function (component,event) {
        if (event.getParam('group') === component.get('v.ticket.itemId')) {
            var quantity = null;
            if (!$A.util.isEmpty(event.getParam('value'))) {
                quantity = parseInt(event.getParam('value'));
            }
            if (!$A.util.isEmpty(quantity) && quantity === -1) {
                var ticketPurchaseObj = component.get('v.ticketPurchaseObj');
                ticketPurchaseObj[component.get('v.ticket.itemId')] = null;
                component.set('v.ticketPurchaseObj',ticketPurchaseObj);
                component.find('validationWaitlistMessage').hideMessages();
                component.set('v.showTextInput',true);
            }
            else if (!$A.util.isEmpty(quantity) && quantity !== -1) {
                component.find('validationWaitlistMessage').hideMessages();
                var ticketObj = component.get('v.ticket');
                if (ticketObj.ticketsRemaining > 0 && ticketObj.ticketsRemaining < quantity) {
                    var waitlistTickets = quantity - ticketObj.ticketsRemaining;
                    if (waitlistTickets > 0) {
                        var waitlistMessage = $A.get('$Label.LTE.Event_Waitlist_Multiple_Overflow');
                        if (waitlistTickets === 1) {
                            waitlistMessage = $A.get('$Label.LTE.Event_Waitlist_Single_Overflow');
                        }

                        component.find('validationWaitlistMessage').showMessages({message : waitlistTickets+' '+waitlistMessage});
                    }
                }
            }
        }
    },
    register : function (component, event, helper ) {
        var usrObj = component.get('v.usr');
        if (!$A.util.isEmpty(usrObj) && usrObj.isAuthenticated) {
            var compEvent = $A.get('e.Framework:ButtonToggleIndicatorEvent');
            compEvent.setParams({group : 'registerTicketBtnGroup',action : 'disableOnly'});
            compEvent.fire();
            helper.registerForTickets(component,usrObj,true);
        }
    },
    handleResetTicketQuantityPicklistEvent : function(component, event) {
        if (component.get('v.ticket.id') === event.getParam('ticketId')) {
            var selectOptions = component.get('v.ticket.selectOptions');
            var salesOrderObj = event.getParam('salesOrder');
            var count = 0;
            _.forEach(salesOrderObj.lines, function(line) {
                if (line.isTicket && !$A.util.isEmpty(line.ticketTypeId) && line.ticketTypeId === component.get('v.ticket.id')) {
                    count++;
                }
            })

            if (component.get('v.ticket').restrictQuantity) {
                var maxSalesQuantity = component.get('v.ticket').maximumSalesQuantity;
                var availableQuantity = maxSalesQuantity - count;
                if (availableQuantity <= 0) {
                    availableQuantity = 0;
                    component.find('registerBtn').set('v.disable',true);
                    $A.util.addClass(component.find('ticketQuantityDiv'),'hidden');
                } else {
                    component.find('registerBtn').set('v.disable',false);
                    $A.util.removeClass(component.find('ticketQuantityDiv'),'hidden');
                }
                if (count > 0) {
                    selectOptions = [];
                    for (var i=0; i <= availableQuantity; i++) {
                        selectOptions.push(
                            {
                                isSelected : false,
                                label : i,
                                value : i
                            }
                        );
                    }
                }
            }
            if (!$A.util.isEmpty(component.find('quantity'))) {
                component.find('quantity').setSelectOptions(selectOptions, selectOptions[0]);
            }
        }
    },
    handleUpdateButtonEvent : function(component, event) {
        if (event.getParam('isTicket')) {
            if (!$A.util.isEmpty(event.getParam('itemIds')) && !$A.util.isEmpty(event.getParam('itemCount'))) {
                var ticket = component.get('v.ticket');
                if (ticket.itemId === event.getParam('itemIds')[0]) {
                    ticket.ticketsRemaining = ticket.ticketsRemaining - _.parseInt(event.getParam('itemCount'));
                }
                component.set('v.ticket', ticket);
            }
        }
    },
    handleUpdateShoppingCartItemCountEvent : function(component, event) {
        var salesOrderLinesInCart = component.get('v.salesOrderLinesInCart');
        var waitlistEntriesInCart = component.get('v.waitlistEntriesInCart');
        if (!$A.util.isEmpty(event.getParam('salesOrderLinesAddedInCart'))) {
            var newLines = _.concat(salesOrderLinesInCart, event.getParam('salesOrderLinesAddedInCart'));
            component.set('v.salesOrderLinesInCart', newLines);
        }
        if (!$A.util.isEmpty(event.getParam('waitlistEntriesAddedInCart'))) {
            var newEntries = _.concat(waitlistEntriesInCart, event.getParam('waitlistEntriesAddedInCart'));
            component.set('v.waitlistEntriesInCart', newEntries);
        }
    }
})