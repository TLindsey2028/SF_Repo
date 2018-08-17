({
    doInit : function(component) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "PagesApi:MediaAssetUpload",
            componentAttributes: {mediaAssetCollection : component.get('v.recordId')},
            isredirect : true
        });
        evt.fire();
    }
})