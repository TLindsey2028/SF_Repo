({
    doInit : function (component) {
        component.find('imageUrl').setOtherAttributes({organizationId : 'HTML_Files',maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            usePublicBucket : true
            });
    },
    openModal : function(component,params) {
        component.find('imageUrl').updateValue(null);
        component.find('altText').updateValue(null);
        component.find('width').updateValue(null);
        component.find('height').updateValue(null);
        var compEvent = $A.get('e.Framework:RichTextInputFieldModalEvent');
        compEvent.setParams({action : 'open',
            fieldId : component.get('v.localId')});
        compEvent.fire();
        $A.util.addClass(component.find('modalBackdrop'), 'slds-backdrop--open');
        $A.util.addClass(component.find('imageUpload'), 'slds-fade-in-open');
        if (params) {
            component.set('v.quillSelection',params.quillSelection);
            component.set('v.quillRange',params.quillRange);
        }
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
        component.find('imageUrl').validate();
        if (component.find('imageUrl').get('v.validated')) {
            var self = this;
            var quill = component.get('v.quillSelection');
            var range = quill.getSelection();
            if ($A.util.isUndefinedOrNull(range)) {
                range = component.get('v.quillRange');
            }
            $A.createComponent('Framework:UrlUtil', null, function (urlUtil) {
                urlUtil.getTimedDirectLink(component.get('v.settingsObj.imageUrl'), $A.getCallback(function (url) {
                    quill.insertEmbed(range.index, 'image', component.get('v.settingsObj.imageUrl'), Quill.sources.USER);
                    if (!$A.util.isEmpty(component.get('v.settingsObj.width'))) {
                        quill.formatText(range.index, range.index + 1, 'width', component.get('v.settingsObj.width') + 'px');
                    }
                    if (!$A.util.isEmpty(component.get('v.settingsObj.height'))) {
                        quill.formatText(range.index, range.index + 1, 'height', component.get('v.settingsObj.height') + 'px');
                    }
                    if (!$A.util.isEmpty(component.get('v.settingsObj.altText'))) {
                        quill.formatText(range.index, range.index + 1, 'alt', component.get('v.settingsObj.altText'));
                    }
                    self.closeModal(component);
                    component.find('saveObject').stopIndicator();
                    component.find('imageUrl').updateValue(null);
                    component.find('altText').updateValue(null);
                    component.find('width').updateValue(null);
                    component.find('height').updateValue(null);
                    $A.enqueueAction(component.get('v.saveValue'));
                }));
            });
        }
        else {
            component.find('saveObject').stopIndicator();
        }
    }
})