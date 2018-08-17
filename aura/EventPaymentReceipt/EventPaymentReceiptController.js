({
    doInit : function(component,event,helper) {
        helper.updateProcessBar(component);
        helper.getSOResult(component);
        var hashEvent = $A.get("e.LTE:HashChangingEvent");
        hashEvent.setParams({hash: "rp-receipt"});
        hashEvent.fire();
        window.onbeforeunload = null;
    },
    logout : function (component) {
        sessionStorage.clear();
        FontevaHelper.flushAll();
        var sitePrefix = component.get('v.siteObj.pathPrefix').replace(/\/s$/,'');
        window.location = sitePrefix+'/secur/logout.jsp?retUrl='+encodeURIComponent(sitePrefix+'/EventApi__router?event='+component.get('v.eventObj.id')+'&site='+component.get('v.siteObj.id'));
    },
    continueToEvent : function (component) {
        sessionStorage.clear();
        FontevaHelper.flushAll();
        var sitePrefix = component.get('v.siteObj.pathPrefix').replace(/\/s$/,'');
        window.location.href = sitePrefix+'/EventApi__router?event='+component.get('v.eventObj.id')+'&site='+component.get('v.siteObj.id');
    },
    downloadReceipt : function (component) {
        var receiptUrl = component.get('v.tempReceiptUrl');
        window.open(
            receiptUrl,
            '_blank'
        );
    }
})