({
    doInit : function(component,event,helper) {
        helper.doInit(component);
    },
    newGateway : function (component) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "OrderApi:PaymentGateways",
            componentAttributes: {businessGroupId : component.get('v.recordId')},
            isredirect : true
        });
        evt.fire();
    },
    editGateway : function (component,event) {
        var evt = $A.get("e.force:navigateToComponent");
        var gatewayRecord = null;
        if (!$A.util.isEmpty(component.get('v.gateways'))) {
            component.get('v.gateways').forEach(function(element){
               if (element.id === event.currentTarget.dataset.recordid) {
                   gatewayRecord = element;
               }
            });
        }
        evt.setParams({
            componentDef: "OrderApi:PaymentGateways",
            componentAttributes: {businessGroupId : component.get('v.recordId'),paymentGatewayObj : gatewayRecord},
            isredirect : true
        });
        evt.fire();
    }
})