/*eslint no-console: "off"*/
({
    loadExistingValue : function(component) {
        try {
            var self = this;
            if (component.isValid()) {
                if (!$A.util.isUndefinedOrNull(component.get('v.value')) && component.get('v.value').length > 0) {
                    if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize) && component.get('v.oldValue') !== component.get('v.value')) {
                        if (!$A.util.isEmpty(component.get('v.preloadObj'))) {
                            self.setLoadPreFetchedValue(component);
                        }
                        else {
                            self.queryBackEndValues(component);
                        }
                    }
                    else {
                        var intervalContext = setInterval($A.getCallback(function () {
                            if (!component || !component.isValid()) {
                                clearInterval(intervalContext);
                                return;
                            }

                            if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize) && component.get('v.oldValue') !== component.get('v.value')) {
                                if (!$A.util.isEmpty(component.get('v.preloadObj'))) {
                                    self.setLoadPreFetchedValue(component);
                                }
                                else {
                                    self.queryBackEndValues(component);
                                }
                                clearInterval(intervalContext);
                            }
                        }), 250);
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    initializeLookupField : function(component) {
        try {
            var self = this;
            var options = {
                valueField: 'sObjectId',
                labelField: 'sObjectLabel',
                searchField: 'sObjectLabel',
                loadingClass: 'slds-none',
                create: false,
                maxItems: 1,
                options: [],
                render: {
                    option: function (item, escape) {
                        return '<div>' + escape(item.sObjectLabel) + '</div>';
                    },
                    item: function (item, escape) {
                        return '<div>' + escape(item.sObjectLabel) + '</div>';
                    }
                },
                load: $A.getCallback(function (query, callback) {
                    if (!query.length) {
                        return callback();
                    }
                    $('[id="' + component.getGlobalId() + '_searching_icon"]').removeClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                    self.getLookupValues(component, query, callback);
                }),
                onDropdownOpen : $A.getCallback(function(){
                    if ($A.util.isUndefinedOrNull(component.get('v.otherMethods')) ||
                        (!$A.util.isUndefinedOrNull(component.get('v.otherMethods')) &&
                            $A.util.isUndefinedOrNull(component.get('v.otherMethods.maxItems')))) {
                        this.clear();
                    }
                }),
                onBlur: $A.getCallback(function () {
                    var value = component.get('v.value');
                    if (!$A.util.isUndefinedOrNull(value) && value.length > 0) {
                        $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_clear_icon"]').removeClass('slds-hide');
                    }
                    else {
                        $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_search_icon"]').removeClass('slds-hide');
                    }
                }),
                onChange: $A.getCallback(function (value) {
                    component.set('v.value', value);
                    if (!$A.util.isUndefinedOrNull(value) && value.length > 0) {
                        $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_clear_icon"]').removeClass('slds-hide');
                    }
                    else {
                        $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_search_icon"]').removeClass('slds-hide');
                    }
                }),
                onClear: $A.getCallback(function () {
                    component.set('v.value', null);
                }),
                onInitialize: $A.getCallback(function () {
                    if (component.get('v.loadBaseValues')) {
                        self.getInitialLoadValues(component, this);
                    }
                })
            };

            if (!$A.util.isUndefinedOrNull(component.get('v.otherMethods'))) {
                for (var property in component.get('v.otherMethods')) {
                    if (component.get('v.otherMethods').hasOwnProperty(property)) {
                        options[property] = component.get('v.otherMethods')[property];
                    }
                }
            }

            var selectizeObj;
            if (component.isValid()) {
                if ($('.' + component.get('v.lookupClass')).length === 1) {
                    selectizeObj = $('.' + component.get('v.lookupClass')).selectize(options);
                    component.set('v.lookupObject', selectizeObj);
                    this.setLoadPreFetchedValue(component);
                    this.updateDisabledFlag(component);
                }
                else {
                    var intervalContext = setInterval($A.getCallback(function () {
                        if ($('.' + component.get('v.lookupClass')).length === 1) {
                            selectizeObj = $('.' + component.get('v.lookupClass')).selectize(options);
                            component.set('v.lookupObject', selectizeObj);
                            self.updateDisabledFlag(component);
                            self.setLoadPreFetchedValue(component);
                            clearInterval(intervalContext);
                        }
                    }), 250);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    setLoadPreFetchedValue : function (component) {
        if (component.isValid()) {
            if (!$A.util.isEmpty(component.get('v.preloadObj'))) {
                var preloadObj = _.cloneDeep(component.get('v.preloadObj'));
                var selectizeObj = component.get('v.lookupObject')[0];
                selectizeObj.selectize.addOption(preloadObj);
                selectizeObj.selectize.addItem(preloadObj.sObjectId);
                component.set('v.preloadObj', null);
            }
        }
    },
    buildLookupObject : function(component) {
        var lookupFieldObject = {
            sObjectApiName : component.get('v.type'),
            objectName : component.get('v.objectName'),
            field : component.get('v.field'),
            advanced : component.get('v.advanced'),
            types : component.get('v.types'),
            enforceSharingRules : component.get('v.enforceSharingRules')
        }
        return lookupFieldObject;
    },
    getInitialLoadValues : function(component,inputFieldComp) {
        try {
            if (component.isValid()) {
                var action = component.get('c.getBaseValues');
                var self = this;
                action.setParams({
                    'sObjectAPINameJSON': JSON.stringify(self.buildLookupObject(component)),
                    'displayField': component.get('v.displayField'),
                    'idField': component.get('v.idField'),
                    'soqlFilter': component.get('v.filter')
                });
                action.setCallback(this, function (response) {
                    if (response.getError() && response.getError().length) {
                        return $A.log('error', 'Unexpected error: ' + response.getError()[0].message);
                    }
                    var result = JSON.parse(response.getReturnValue());
                    var concatenateLabel = component.get('v.concatenateLabel');
                    if (!$A.util.isUndefinedOrNull(result) && $A.util.isArray(result)) {
                        result.forEach(function (element) {
                            if (concatenateLabel) {
                                element.sObjectLabel = JSON.stringify(element);
                            }
                            inputFieldComp.addOption(element);
                        });
                    }
                });
                action.setStorable();
                $A.enqueueAction(action);
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    queryBackEndValues : function(component) {
        try {
            var self = this;
            if (component.isValid()) {
                var action = component.get('c.getExistingValue');
                var value = component.get('v.value');
                if ($A.util.isArray(value)) {
                    value = value.toString();
                }
                action.setParams({
                    'idValue': value,
                    'sObjectAPINameJSON': JSON.stringify(self.buildLookupObject(component)),
                    'displayField': component.get('v.displayField'),
                    'idField': component.get('v.idField')
                });
                action.setCallback(this, function (response) {
                    if (response.getError() && response.getError().length) {
                        return $A.log('error', 'Unexpected error: ' + response.getError()[0].message);
                    }
                    var existingValues = JSON.parse(response.getReturnValue());
                    if (!$A.util.isUndefinedOrNull(existingValues)) {
                        var selectizeObj = component.get('v.lookupObject')[0];
                        existingValues.forEach(function (element) {
                            selectizeObj.selectize.addOption(element);
                            selectizeObj.selectize.addItem(element.sObjectId);
                        });
                    }
                    else {
                        self.clearExistingValue(component);
                    }
                });
                action.setStorable();
                $A.enqueueAction(action);
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    clearExistingValue : function(component) {
        try {
            var self = this;
            if (component.isValid()) {
                if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize)) {
                    component.get('v.lookupObject')[0].selectize.clear();
                    $A.util.addClass(component.find('removeIcon'), 'slds-hide');
                    $A.util.addClass(component.find('searchingIcon'), 'slds-hide');
                    $A.util.removeClass(component.find('searchIcon'), 'slds-hide');

                }
                else {
                    var intervalContext = setInterval($A.getCallback(function () {
                        if (component.isValid() && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize)) {
                            component.get('v.lookupObject')[0].selectize.clear();
                            $A.util.addClass(component.find('removeIcon'), 'slds-hide');
                            $A.util.addClass(component.find('searchingIcon'), 'slds-hide');
                            $A.util.removeClass(component.find('searchIcon'), 'slds-hide');
                            clearInterval(intervalContext);
                        }
                        else {
                            clearInterval(intervalContext);
                        }
                    }), 250);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    getLookupValues : function (component,query,callback) {
        try {
            var self = this;
            if (component.isValid()) {
                var lookupObj = self.buildLookupObject(component);
                if (!$A.util.isUndefinedOrNull(query) && query.length > 1) {
                    var action = component.get("c.lookup");
                    action.setParams({
                        'sObjectAPINameJSON': JSON.stringify(lookupObj),
                        'searchString': query,
                        'displayField': component.get('v.displayField'),
                        'idField': component.get('v.idField'),
                        'soqlLimit': component.get('v.soqlLimit'),
                        'soqlFilter': component.get('v.filter')
                    });
                    action.setCallback(this, function (response) {
                        if (response.getError() && response.getError().length) {
                            //return $A.error('Unexpected error: ' + response.getError()[0].message);
                        }
                        $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                        $('[id="' + component.getGlobalId() + '_search_icon"]').removeClass('slds-hide');
                        callback(self.updateSearchCallback(component, lookupObj, response.getReturnValue()));
                    });
                    action.setStorable();
                    $A.enqueueAction(action);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    updateSearchCallback : function(component,lookupObj,resultObj) {
        var returnObj = [];
        try {
            if (lookupObj.advanced) {
                resultObj.forEach(function (element) {
                    for (var property in element.sObj) {
                        if (element.sObj.hasOwnProperty(property)) {
                            element[property] = element.sObj[property];
                        }
                    }
                    returnObj.push(element);
                });
            }
            else {
                returnObj = resultObj;
            }
        }
        catch (err) {
            console.log(err);
        }

        return returnObj;
    },
    updateDisabledFlag : function(component) {
        try {
            if (component.isValid()) {
                if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) &&
                    !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize)) {
                    if (component.get('v.disabled')) {
                        component.get('v.lookupObject')[0].selectize.disable();
                        $A.util.addClass(component.find('lookupIcon'), 'disable-icon');
                    }
                    else {
                        component.get('v.lookupObject')[0].selectize.enable();
                        $A.util.removeClass(component.find('lookupIcon'), 'disable-icon');
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    resetFilter : function(component) {
        try {
            var self = this;
            if (component.isValid()) {
                if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject'))) {
                    if (component.get('v.clearExisting')) {
                        self.reInitialize(component, self);
                    }
                    if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0])) {
                        self.getInitialLoadValues(component, component.get('v.lookupObject')[0].selectize);
                    }
                }
                else {
                    var intervalContext = setInterval($A.getCallback(function () {
                        if (component.isValid()) {
                            if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject'))) {
                                if (component.get('v.clearExisting')) {
                                    self.reInitialize(component, self);
                                }
                                if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0])) {
                                    self.getInitialLoadValues(component, component.get('v.lookupObject')[0].selectize);
                                }
                                clearInterval(intervalContext);
                            }
                        }
                        else {
                            clearInterval(intervalContext);
                        }
                    }), 250);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    loadBaseValuesOnChange : function (component) {
        if (component.isValid()) {
            if (component.get('v.loadBaseValues')) {
                this.resetFilter(component);
            }
            component.set('v.loadBaseValues', false);
        }
    },
    reInitialize : function(component,self) {
        if (component.isValid()) {
            component.get('v.lookupObject')[0].selectize.clear();
            self.clearOptions(component);
            component.set('v.clearExisting', false);
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
    clearOptions : function(component) {
        if (component.isValid()) {
            component.get('v.lookupObject')[0].selectize.clearOptions();
        }
    }
})