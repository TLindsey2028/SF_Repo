({
    stopIndicatorSubmit : function(component) {
        if (component.get('v.showSubmitButton')) {
            component.find('submitPromptButton').stopIndicator();
        }
    },
    showModal : function(component) {
        var self = this;
        this.stopIndicatorSubmit(component);
        var modalDiv = component.find('dynamic-modal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modalDiv, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
        document.addEventListener('keyup', $A.getCallback(function(e) {
            if (e.keyCode === 27) {
                self.hideModal(component);
            }
        }));
    },
    hideModal : function(component) {
        var modalDiv = component.find('dynamic-modal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(modalDiv, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        this.stopIndicatorSubmit(component);
    },
})