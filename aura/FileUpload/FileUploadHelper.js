({
    doInit : function(component) {
        var uniqueId = this.generateId(10);
        var self = this;
        component.set('v.uniqueId', uniqueId);
        if (component.get('v.useIframe')) {
            component.set('v.iFrameUrl', UrlUtil.addSitePrefix('/apex/Framework__FileUploadFrame?identifier=' + uniqueId));

            window.addEventListener("message",
                $A.getCallback(function receiveMessage(event)
                {
                    if (event.data.identifier === uniqueId) {
                        var location = event.data.data.Location;
                        self.setValue(component, location);
                        component.find('file_label').set('v.value',location);
                        $A.util.removeClass(component.find("uploading").getElement(), "uploading");
                        $A.util.addClass(component.find("uploading").getElement(), "notUploading hidden");
                        self.closeModal(component);
                    }
                }),
                false);
        }
        component.set('v.internalUpdate',false);
        this.getOrgId(component);
    },
    setValue : function(component, value) {
        component.set('v.value', value);
        // component.set('v.linkUrl', value);
        // $A.createComponent('Framework:UrlUtil', null, function(cmp) {
        //     cmp.wrapLinks(component, ['v.linkUrl']);
        // });
    },
    loadExistingValue : function(component) {
        component.find('file_label').set('v.value',component.get('v.value'));
        if (component.find('file').getElement() !== null) {
            component.find('file').getElement().value = '';
        }
    },
    openLightBox : function(component) {
        var lightbox = new Lightbox();
        lightbox.load();
        lightbox.open(component.find('imageComp').get('v.modifiedSrc'));
    },
    clearExistingValue : function(component) {
        component.find('file_label').set('v.value',null);
        if (component.find('file').getElement() !== null) {
            component.find('file').getElement().value = '';
        }
    },
    getOrgId : function(component) {
        if ($A.util.isEmpty(component.get('v.organizationId'))) {
            var action = component.get('c.getInfo');
            action.setCallback(this, function (response) {
                try {
                    component.set('v.organizationId', response.getReturnValue().orgId);
                    if ($A.util.isEmpty(component.get('v.bucket'))) {
                        component.set('v.bucket', response.getReturnValue().bucket)
                        component.set('v.country', response.getReturnValue().country);
                    }
                }
                catch (err){}
            });
            $A.enqueueAction(action);
        }
    },
    uploadFile : function(component,event) {
        var inputCom;
        var self = this;
        var prefix = '';
        if (component.get('v.generatePrefix')) {
            prefix = this.generateId(8)+'_';
        }
        var bucket = null;
        var fileChooser = document.getElementById(component.getGlobalId() + '_file');
        var file = fileChooser.files[0];
        var allowMimeTypes = component.get('v.allowedMimeTypes');
        if (!$A.util.isArray(allowMimeTypes)) {
            allowMimeTypes = JSON.parse(allowMimeTypes);
        }
        if (!$A.util.isUndefinedOrNull(allowMimeTypes) && allowMimeTypes.length > 0 && allowMimeTypes.indexOf(file.type) === -1) {
            inputCom = component.find('errorInput');
            inputCom.hideMessages();
            inputCom.showMessages([{message: 'Invalid File Type'}]);
            $A.util.removeClass(component.find("uploading").getElement(), "uploading");
            $A.util.addClass(component.find("uploading").getElement(), "notUploading hidden");
            return;
        }
        var maximumFileSize = component.get('v.maximumFileSize');
        if (!$A.util.isUndefinedOrNull(maximumFileSize) && file.size > maximumFileSize) {
            inputCom = component.find('errorInput');
            inputCom.hideMessages();
            inputCom.showMessages([{message: 'File Too Large. Maximum size is '+maximumFileSize/1024 + ' KB'}]);
            $A.util.removeClass(component.find("uploading").getElement(), "uploading");
            $A.util.addClass(component.find("uploading").getElement(), "notUploading hidden");
            return;
        }
        if (component.get('v.allowCropping')) {
            if ($A.util.isUndefinedOrNull(component.get('v.globalGeneratedId'))) {
                component.set('v.globalGeneratedId', this.generateId(8) + '_crop_image');
                component.set('v.imageToCrop',this.generateId(8)+'_image_to_crop');
            }
            setTimeout($A.getCallback(function(){
                self.openModal(component,prefix,file);
            }),150);
        }
        else {
            this.doUpload(component, prefix, self.cleanFileName(file.name), file.type, file);
        }
        this.setIfImage(file.type, component);
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    setIfImage : function (type, component){
         if(type.split('/')[0]=='image'){
            component.set('v.isImageFile', true);
         }
         else{
             component.set('v.isImageFile', false);
         }
    },
    saveUrl : function(component,event) {
        var inputCom;
        if (component.find('file_label').get('v.value') === '' ||
            $A.util.isUndefinedOrNull(component.find('file_label').get('v.value'))) {
            if (component.get('v.value') !== '') {
                inputCom = component.find('errorInput');
                inputCom.hideMessages();
                inputCom.showMessages([{message: 'Removed'}]);
                this.clearExistingValue(component);
            }
            this.setValue(component, null);
        }
        else if(component.get('v.requireHTTPS') && !/^https:\/\/.*$/i.test(component.find('file_label').get('v.value'))){
            inputCom = component.find('errorInput');
            inputCom.hideMessages();
            inputCom.showMessages([{message: 'HTTPS URL Required'}]);
        }
        else if(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&\(\)\*\+,;=.]+$/i.test(component.find('file_label').get('v.value'))){
            this.setValue(component, component.find('file_label').get('v.value'));
        }
        else {
            inputCom = component.find('errorInput');
            inputCom.hideMessages();
            inputCom.showMessages([{message: 'Invalid URL'}]);
        }
    },
    uploadFileToServer : function(component,event) {
        var fileChooser = document.getElementById(component.getGlobalId() + '_file');
        if (fileChooser.files.length > 0) {
            $A.util.addClass(component.find("uploading").getElement(), "uploading");
            $A.util.removeClass(component.find("uploading").getElement(), "notUploading hidden");
            this.uploadFile(component, event);
        }
    },
    setErrorMessages : function(component,event) {
        var params = event.getParam('arguments');
        if (params) {
            if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
                var inputCom = component.find('errorInput');
                inputCom.hideMessages();
                inputCom.showMessages(params.errorMessages);
            }
        }
    },
    openModal : function(component,prefix,file) {
        var self = this;
        var reader = new FileReader();
        reader.onload = $A.getCallback(function (e) {
            try {
                var compEvent = $A.get('e.Framework:FileUploadCropEvent');
                compEvent.setParams({action : 'open',
                    fieldId : component.get('v.localId')});
                compEvent.fire();
                component.find('imageToCrop').getElement().setAttribute('src', e.target.result);
                var uploadCrop = new Croppie(document.getElementById(component.get('v.imageToCrop')), component.get('v.croppingParams'));
                component.set('v.croppieObj', uploadCrop);
                var modal = component.find('cropImage');
                var backdrop = component.find('modalBackdrop');
                $A.util.addClass(backdrop, 'slds-backdrop--open');
                $A.util.addClass(modal, 'slds-fade-in-open');
                document.body.classList.add('no-file-scroll');
                document.querySelector('.' + component.get('v.globalGeneratedId')).addEventListener('click', $A.getCallback(function (ev) {
                    try {
                        uploadCrop.result(component.get('v.croppingResultParams')).then(function (result) {
                            self.doUpload(component, prefix, self.cleanFileName(file.name), 'image/jpeg', result, self, uploadCrop);
                        });
                    }
                    catch (err) {
                    }
                }));
            }
            catch (Ex) {

            }

        });
        reader.readAsDataURL(file);
    },
    cleanFileName : function(fileName) {
        return fileName.replace(/[^A-Z0-9]+/ig, "_");
    },
    doUpload : function (component,prefix,fileName,fileType,file,self,uploadCrop) {
        var params = {
            Key: component.get('v.organizationId') + '/' + prefix + fileName,
            ContentType: fileType,
            Body: file
        };

        var action = component.get('c.getPostSignature');
        action.setParams({
            key: params.Key,
            usePublicBucket : component.get('v.usePublicBucket')
        });
        action.setCallback(this, function (response) {
            document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({
                identifier: component.get('v.uniqueId'),
                params: params,
                bucketName: response.getReturnValue().bucketName,
                region : response.getReturnValue().region,
                signature: response.getReturnValue().signature,
                policyJson: response.getReturnValue().policyJson,
                isoDate: response.getReturnValue().isoDate,
                credential: response.getReturnValue().credential,
                expires: response.getReturnValue().expires,
                usePublicBucket : component.get('v.usePublicBucket')
            }, '*');
        });
        $A.enqueueAction(action);

        this.clearFileUpload(component);
    },
    closeModal : function(component) {
        var compEvent = $A.get('e.Framework:FileUploadCropEvent');
        compEvent.setParams({action : 'close',
            fieldId : component.get('v.localId')});
        compEvent.fire();
        var modal = component.find('cropImage');
        var backdrop = component.find('modalBackdrop');
        $A.util.removeClass(modal,'slds-fade-in-open');
        $A.util.removeClass(backdrop,'slds-backdrop--open');
        $A.util.removeClass(component.find("uploading").getElement(), "uploading");
        $A.util.addClass(component.find("uploading").getElement(), "notUploading hidden");
        if (component.get('v.allowCropping')) {
            component.find('saveCroppedImage').stopIndicator();
            document.body.classList.remove('no-file-scroll');
            try {
                component.get('v.croppieObj').destroy();
            }
            catch (ex) {
            }
        }
        this.clearFileUpload(component);
    },
    clearFileUpload : function(component) {
        //component.find('file_label').set('v.value','');
    }
})