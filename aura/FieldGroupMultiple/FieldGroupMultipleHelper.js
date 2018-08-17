({
    showInstructionalText : function(component,componentObj) {
        $A.createComponent('markup://ROEApi:FormText',componentObj,function(cmp){
            var divComponent = component.find("fields");
            var divBody = divComponent.get("v.body");
            divBody.push(cmp);
            divComponent.set('v.body',divBody);
        });
    },
    buildMultipleObject : function(component) {
        var fieldGroup = component.get('v.value');
        component.set('v.multipleEntryValue',fieldGroup.fields);
    }
})