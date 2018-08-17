/* global FontevaHelper */
/* global _ */
({
    doInit: function(component) {
        document.title = $A.get('$Label.LTE.Event_Forms_Title')+' - '+component.get('v.eventObj.name');
        var salesOrderObj = component.get('v.salesOrderObj');
        var eventBase = component.get('v.eventBase');
        var orderLines = [];
        if (component.get('v.isTicketForms')) {
            eventBase.getSalesOrderLines(component, salesOrderObj.id, function callback(data) {
                component.set('v.currencyIsoCode', _.get(data, '[0].currencyIsoCode', 'USD'));
                component.set('v.priceTotal', _.sumBy(data, 'priceTotal'));
                orderLines = _.flatten(_.map(data, function (item) {
                    return _.map(item.assignments, function (assignment) {
                        return {
                            assignmentId: assignment.id,
                            fullName: assignment.contactName,
                            formId: item.formId,
                            itemName: item.itemName,
                            salesOrder: item.salesOrder,
                            salesOrderLine: item.salesOrderLine,
                            priceTotal: item.priceTotal,
                            formResponseId: assignment.formResponseId,
                            formHeading : item.formHeading,
                            formLoadObj : assignment.formObj
                        }
                    })
                }));
                component.set('v.orderLines', orderLines);
                FontevaHelper.showLoadedData(component);
            });
        }
        else {
            eventBase.getChildSalesOrderLines(component, salesOrderObj.id, function callback(data) {
                component.set('v.currencyIsoCode', _.get(data, '[0].currencyIsoCode', 'USD'));
                component.set('v.priceTotal', _.sumBy(data, 'priceTotal'));
                orderLines = _.flatten(_.map(data, function (item) {
                    return {
                        assignmentId: item.salesOrderLine,
                        fullName: item.contactFirstName+' '+item.contactLastName,
                        formId: item.formId,
                        itemName: item.itemName,
                        salesOrder: item.salesOrder,
                        salesOrderLine: item.salesOrderLine,
                        priceTotal: item.priceTotal,
                        formResponseId: item.formResponseId,
                        formHeading : item.formHeading
                    }
                }));
                component.set('v.orderLines', orderLines);
                FontevaHelper.showLoadedData(component);
            });
        }
    },
    previousStep: function(component) {
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        var previousComponent = 'LTE:EventRegistrationAttendeeSelection';
        var toolBarEvent = $A.get('e.LTE:RegistrationToolbarUpdateEvent');

        if (!$A.util.isEmpty(component.get('v.previousComponent'))) {
            previousComponent = component.get('v.previousComponent');
        }
        var componentParams = {
            usr : component.get('v.usr'),
            attendeeObj : component.get('v.attendeeObj'),
            eventObj : component.get('v.eventObj'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj'),
            salesOrderObj : component.get('v.salesOrderObj'),
            identifier : 'EventRegistrationWrapper'
        };
        if (!component.get('v.isTicketForms')) {
            previousComponent = 'LTE:EventAgenda';
            componentParams.readOnly = false;
            toolBarEvent.setParams({
                total : component.get('v.salesOrderObj.total'),
                title : $A.get('$Label.LTE.Event_Agenda')
            });
        }
        else {
            toolBarEvent.setParams({
                total : component.get('v.salesOrderObj.total'),
                title : $A.get('$Label.LTE.Registration_Selection')
            });
        }
        compEvent.setParams({
            componentName : previousComponent,
            componentParams : componentParams
        });
        compEvent.fire();
        toolBarEvent.fire();
    },
    nextStep: function(component,event,helper) {
        var formComplete = _.every(_.flatten([component.find('eventRegistrationForm')]), function(element) {
            element.validate();
            return element.get('v.formComplete');
        });

        if (!formComplete) {
            FontevaHelper.showErrorMessage($A.get("$Label.LTE.Registration_Form_Incomplete_Message"));
            component.find('actionButtons').stopIndicator('nextStep');
            return;
        }

        var interval = setInterval($A.getCallback(function(){
            var formSubmitted = _.every(_.flatten([component.find('eventRegistrationForm')]), function(element) {
                return element.get('v.saveStatus') === 0;
            });
            if (!formSubmitted) {
              return;
            }
            clearInterval(interval);
            var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
            compEvent.setParams({salesOrderObj : component.get('v.salesOrderObj'), action  : 'next'});
            compEvent.fire();
        }),250);
    }
})