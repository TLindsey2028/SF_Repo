({
    updateDisabledFlag : function(component) {
        var quillObj = component.get('v.quill');
        var intervalContext = setInterval($A.getCallback(function () {
            try {
                if (!$A.util.isUndefinedOrNull(quillObj)) {
                    if (component.get('v.disabled')) {
                        quillObj.disable();
                    }
                    else {
                        quillObj.enable();
                    }
                    clearInterval(intervalContext);
                }
            }
            catch (err) {

            }
        }), 250);
    },
    initEditor : function(component){
        var self = this;
        var toolbarOptions = {container : [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote','code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'align': [] }],
            ['image'],
            //['video'],
            ['clean'],                                         // remove formatting button
            ['showHtml'],
            ['link']
        ],
            handlers : {showHtml: $A.getCallback(function() {
                    component.find('richTextSourceEditor').openModal(this.quill);
                })
            }
        };

        var elementObj = component.find('quillJSEditor').getElement();
        var quill = new Quill(elementObj, {
            modules: {
                toolbar: toolbarOptions
            },
            theme: 'snow'
        });
        // var BlockEmbed = Quill.import('blots/block/embed');
        // console.log(BlockEmbed);
        var toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', $A.getCallback(function() {
            component.find('richTextImageUpload').openModal(this.quill,this.quill.getSelection());
        }));
        quill.on('text-change', $A.getCallback(function(delta, oldDelta, source) {
            if (source == 'user' || source == 'api') {
                var quillObj = component.get('v.quill');
                if (quillObj.getText().trim().length === 0) {
                    component.set('v.value',null);
                }
                else {
                    component.set('v.value',quillObj.container.firstChild.innerHTML);
                }
            }
        }));
        component.set('v.quill',quill);
        self.updateDisabledFlag(component);
    },
    loadExistingValue : function(component) {
        var intervalContext = setInterval($A.getCallback(function () {
            try {
                var quillObj = component.get('v.quill');
                if (!$A.util.isUndefinedOrNull(quillObj)) {
                    quillObj.container.firstChild.innerHTML = component.get('v.value');
                    clearInterval(intervalContext);
                }
            }
            catch (err) {

            }
        }), 250);
    },
    clearExistingValue : function(component) {
        var intervalContext = setInterval($A.getCallback(function () {
            try {
                var quillObj = component.get('v.quill');
                if (!$A.util.isUndefinedOrNull(quillObj)) {
                    quillObj.container.firstChild.innerHTML = null;
                    clearInterval(intervalContext);
                }
            }
            catch (err) {

            }
        }), 250);
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
    }
})