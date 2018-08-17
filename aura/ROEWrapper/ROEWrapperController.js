({
    doInit : function(component,event,helper) {
        if (!$A.util.isUndefinedOrNull(component.get('v.recordId'))) {
            if (component.get('v.recordId').startsWith('003')) {
                component.set('v.contact',component.get('v.recordId'));
            }
            else if (component.get('v.recordId').startsWith('001')) {
                component.set('v.account',component.get('v.recordId'));
            }
            else {
                component.set('v.salesOrder',component.get('v.recordId'));
            }
        }
        helper.getConfigInfo(component);
    },
    update : function (component,event,helper) {
        if (!$A.util.isEmpty(event.getParam('token')) && event.getParam('token').indexOf('Rapid_Order_Entry') > -1) {
            helper.getConfigInfo(component);
        }
    },
    getUrlVars : function() {
        var vars = {}, hash;
        var query_string = window.location.search;

        if (query_string) {
            var hashes = query_string.slice(1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }

            return vars;
        } else {
            return false;
        }
    },
    handleSwitchComponent : function(component,event) {
        $A.util.addClass(component.find('roeBody'),'slds-loading-layout');
        var paramsObject = event.getParam('componentParams');
        if (event.getParam('componentName').indexOf('Proforma') === -1) {
            paramsObject.dateFormat = component.get('v.dateFormat');
        }
        if (event.getParam('componentName').indexOf('SalesOrders') > -1) {
            var soId;
            if (component.get('v.salesOrder')) {
                soId = component.get('v.salesOrder');
            } else if (paramsObject.salesOrderId) {
                soId = paramsObject.salesOrderId;
            }
            paramsObject.retURL = '/apex/ROEApi__rapidOrderEntry?salesOrder='+soId;
        }
        else {
            var returnObj = {
                componentName: 'markup://ROEApi:ItemQuickAdd',
                componentParams: {
                    salesOrder: component.get('v.salesOrder'),
                    contact: component.get('v.contact'),
                    account: component.get('v.account'),
                    exceptionContact: component.get('v.exceptionContact'),
                    exceptionAccount: component.get('v.exceptionAccount'),
                    dateFormat: component.get('v.dateFormat')
                }
            };
            paramsObject.returnObj = returnObj;
        }
        $A.createComponent(event.getParam('componentName'),
            paramsObject,
            function(cmp, status, errorMessage){
                var divComponent = component.find("roeBody");
                divComponent.set("v.body",[cmp]);
            }
        );
    }
})