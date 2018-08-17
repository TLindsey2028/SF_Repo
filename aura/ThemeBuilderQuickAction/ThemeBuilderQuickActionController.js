({
    doInit : function(component) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "PagesApi:ThemeBuilder",
            componentAttributes: {themeId : component.get('v.recordId')},
            isredirect : true
        });
        evt.fire();
    }
})