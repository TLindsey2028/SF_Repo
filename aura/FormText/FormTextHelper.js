({
    handleShowHideFormInstructionsEvent : function(component,event) {
        if (event.getParam('formGlobalId') === component.get('v.formUniqueIdentifier')) {
            if (event.getParam('showInstructions')) {
                if (component.get('v.isMultiple')) {
                    $A.util.removeClass(component.find('instructionsMultiple'), 'hidden');
                }
                else {
                    $A.util.removeClass(component.find('instructions'), 'hidden');
                    $A.util.removeClass(component.find('header'), 'hidden');
                }
            }
            else {
                if (component.get('v.isMultiple')) {
                    $A.util.addClass(component.find('instructionsMultiple'), 'hidden');
                }
                else {
                    $A.util.addClass(component.find('instructions'), 'hidden');
                    $A.util.addClass(component.find('header'), 'hidden');
                }
            }
        }
    }
})