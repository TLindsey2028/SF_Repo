({
    openModal : function(component,params) {
        component.find('source').updateValue(null);
        var compEvent = $A.get('e.Framework:RichTextInputFieldModalEvent');
        compEvent.setParams({action : 'open',
            fieldId : component.get('v.localId')});
        compEvent.fire();
        if (params) {
            component.find('source').updateValue(params.quill.container.firstChild.innerHTML);
            component.set('v.quill',params.quill);
        }
        $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        $A.util.addClass(component.find('imageUpload'), 'slds-fade-in-open');
    },
    closeModal : function(component) {
        var compEvent = $A.get('e.Framework:RichTextInputFieldModalEvent');
        compEvent.setParams({action : 'close',
            fieldId : component.get('v.localId')});
        compEvent.fire();
        $A.util.removeClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        $A.util.removeClass(component.find('imageUpload'), 'slds-fade-in-open');
    },
    saveObject : function (component) {
        var self = this;
        var quill = component.get('v.quill');
        quill.pasteHTML(component.get('v.settingsObj.source'));
        self.closeModal(component);
        component.find('saveObject').stopIndicator();
        component.find('source').updateValue(null);
    }
})