({
    doInit : function(component) {
        var parameters = {};
        parameters.businessGroup = component.get('v.recordId');
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:PaymentGatewayListing",
            componentAttributes: parameters,
            isredirect : true
        });
        evt.fire();
    }
})