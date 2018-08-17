({
    sessionId : null,
    uiTheme : '',
    existingLayouts : {},
    getSessionId : function(component) {
        var self = this;
        if ($A.util.isEmpty(this.sessionId)) {
            this.buildIFrame(component);
            var sessionPromise = ActionUtils.executeAction(this,component,'c.getSessionAndTheme',{});
            sessionPromise.then(
                $A.getCallback(function(result){
                    self.sessionId = result.sessionId;
                    self.uiTheme = result.theme;
                    self.checkTheme(component,self);
                })
            );
        }
        else {
            self.checkTheme(component,self);
            this.buildIFrame(component);
        }
    },
    buildIFrame : function (component) {
        var self = this;
        var uniqueId = component.get('v.uniqueId');
        component.set('v.iFrameUrl', UrlUtil.addSitePrefix('/apex/Framework__UIApiFrame?identifier=' + uniqueId));
        function receiveMessage(event) {
            if (event.data.identifier === uniqueId) {
                self.fireUIResponseEvent(component,event.data.fields,self,true);
            }
        }
        window.addEventListener("message", $A.getCallback(function (event) {
            receiveMessage(event);
        }), false);
    },
    checkTheme : function(component,self) {
        if (!$A.util.isEmpty(self.uiTheme) && self.uiTheme === 'Theme4d') {
            component.set('v.showLightningContainer',true);
        }
    },
    fireUIResponseEvent: function (component,fields,self,saveToHelper) {
        try {
            if (saveToHelper) {
                self.existingLayouts[fields.sObjectName] = fields;
            }
            var UIApiResponseEventObj = $A.get('e.Framework:UIApiResponseEvent');
            UIApiResponseEventObj.setParams({
                uniqueId: component.get('v.uniqueId'),
                fields: fields
            });
            UIApiResponseEventObj.fire();
        }
        catch (err) {}
    },
    getFieldObjsFromLayout : function (component,params) {
        var self = this;
        var interval = setTimeout($A.getCallback(function(){
            if (!$A.util.isEmpty(self.sessionId) && !$A.util.isEmpty(document.getElementById(component.get('v.uniqueId')))) {
                clearInterval(interval);
                try {
                    if (params && params.arguments && !$A.util.isEmpty(self.sessionId)) {
                        if ($A.util.isEmpty(self.existingLayouts[params.arguments.sObjectName])) {
                            if (component.get('v.showLightningContainer')) {
                                document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({
                                    identifier: component.get('v.uniqueId'),
                                    sessionId: self.sessionId,
                                    sObjectName: params.arguments.sObjectName
                                }, '*');
                            }
                            else {
                                var fieldPromise = UIApi.getFieldsFromLayout(self.sessionId, params.arguments.sObjectName);
                                fieldPromise.then(
                                    $A.getCallback(function (result) {
                                        self.fireUIResponseEvent(component, result, self, true);
                                    }),
                                    $A.getCallback(function (reject) {
                                        console.log(reject);
                                    })
                                );
                            }
                        }
                        else {
                            self.fireUIResponseEvent(component, self.existingLayouts[params.arguments.sObjectName], self, false);
                        }
                    }
                }
                catch (err){}
            }
        }),100);
    }
})