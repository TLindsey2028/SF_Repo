({
    initializeCodeEditor : function(component) {
        this.setCodeBuilder(component);
    },
    setCodeBuilder : function(component) {
        var aceEditor = ace.edit(component.getGlobalId()+'_code_editor');
        aceEditor.setTheme(component.get('v.theme'));
        aceEditor.getSession().setMode(component.get('v.mode'));
        if (component.get('v.value') !== null) {
            aceEditor.setValue(component.get('v.value'));
        }
        aceEditor.getSession().on('change', function(e) {
            component.set('v.value',aceEditor.getSession().getValue());
        });
        component.set('v.aceEditor',aceEditor);
    },
    loadExistingValue : function(component) {
        var aceEditor = component.get('v.aceEditor');
        try {
            if (!$A.util.isUndefinedOrNull(aceEditor) && !$A.util.isUndefinedOrNull(aceEditor.getSession())) {
                aceEditor.setValue(component.get('v.value'));
            }
            else {
                var interval = setInterval($A.getCallback(function () {
                    try {
                        var aceEditorDelayed = component.get('v.aceEditor');
                        if (!$A.util.isUndefinedOrNull(aceEditorDelayed) && !$A.util.isUndefinedOrNull(aceEditorDelayed.getSession())) {
                            aceEditorDelayed.setValue(component.get('v.value'));
                            clearInterval(interval);
                        }
                    }
                    catch (err) {

                    }
                }), 50);
            }
        }
        catch (err) {

        }
    },
    clearExistingValue : function(component) {
        var aceEditor = component.get('v.aceEditor');
        aceEditor.setValue(null);
        component.set('v.value',null);
    }
})