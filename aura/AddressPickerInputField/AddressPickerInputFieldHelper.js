/* global google */
({
    callbackMap : {

    },
    pcaMap: {
        "BuildingNumber": "street_number",
        "Street": "street_name",
        "City": "city",
        "Province": "province",
        "PostalCode": "postal_code",
        "CountryName": "country"
    },
    doInit : function (component) {
        var self = this;
        var action = component.get('c.getPcaConfiguration');
        action.setCallback(this,function(result) {
            var pcaEnabled = false;
            if (result.getState() === 'ERROR') {
                pcaEnabled = false;
            }
            else {
                var resultValue = result.getReturnValue();
                if (!$A.util.isEmpty(resultValue.pcaKey)) {
                    pcaEnabled = true;
                    component.set('v.pcaKey',resultValue.pcaKey);
                    component.set('v.pcaByIp',resultValue.pcaIp);
                    if (!$A.util.isEmpty(resultValue.pcaCountries)) {
                        component.set('v.pcaCountries', resultValue.pcaCountries);
                    }
                }
            }
            var uniqueId = this.generateId(10);
            component.set('v.uniqueId', uniqueId);
            this.buildDependentPicklistOtherAttributes(component);
            setTimeout($A.getCallback(function(){
                if (!pcaEnabled) {
                    self.initializeLookupField(component);
                }
                self.initializeAutocomplete(component);
            }),5);
            this.loadStateCountryPicklists(component);
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    buildDependentPicklistOtherAttributes : function(component) {
        component.set('v.dependPicklistOtherAttributes',{"objectName" : "Contact","required" : true,"controllingField" : "mailingcountrycode", "dependentField" : "mailingstatecode","dependentFieldLabel" : component.get('v.provinceLabel'),"dependentFieldRequired" : true});
    },
    initializeAutocomplete : function(component) {
        var self = this;
        if (!$A.util.isEmpty(component.get('v.pcaKey'))) {
            var fields = [
                    {field: "", element: component.get('v.uniqueId')},
                    {field: "Line1"},
                    {field: "Line2"},
                    {field: "City"},
                    {field: "Province"},
                    {field: "PostalCode"},
                    {field: "CountryName"}
                ],
                options = {
                    key: component.get('v.pcaKey'),
                    search: {countries: component.get('v.pcaCountries')},
                    setCountryByIP: component.get('v.pcaByIp')
                },
                control = new pca.Address(fields, options);

            control.listen("populate", $A.getCallback(function(address, variations) {
                var val = {};
                for (var part in self.pcaMap) {
                    val[self.pcaMap[part]] = address[part];
                }
                if (address.Line2.length > 0) {
                    val.street_name += ' ' + address.Line2;
                }
                component.set('v.value', val);
                self.setPcaInputFromParts(component,val);
            }));
        }
        else {
            component.set('v.iFrameUrl', UrlUtil.addSitePrefix('/apex/Framework__AddressPickerFrame?identifier=' + uniqueId + '&isVFPortal=' + component.get('v.isVFPortal')));
            var uniqueId = component.get('v.uniqueId');
            function receiveMessage(event) {
                try {
                    if (event.data.identifier === uniqueId) {
                        if (event.data.type === 'queryResult') {
                            var values = [];
                            event.data.predictions.forEach(function (element) {
                                values.push({label: element.description, value: element.place_id});
                            });
                            if (!$A.util.isUndefinedOrNull(self.callbackMap[event.data.query])) {
                                self.callbackMap[event.data.query](values);
                            }
                        }
                        else if (event.data.type === 'placeDetail') {
                            component.set('v.value', event.data.place);
                        }

                    }
                }
                catch (err) {}
            }

            window.addEventListener("message", $A.getCallback(function (event) {
                receiveMessage(event);
            }), false);
        }
    },
    setPcaInputFromParts : function(component,val) {
        var fullLabel = val.street_number + ' ' + val.street_name + ' ' + val.city + ' ' + val.province + ' ' + val.postal_code + ' ' + val.country;
        document.getElementById(component.get('v.uniqueId')).value = fullLabel;
    },
    loadStateCountryPicklists : function(component) {
        var action = component.get('c.isStateCountryPicklistEnabled');
        action.setCallback(this,function(response){
            component.set('v.showDependentPicklists',response.getReturnValue());
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    loadExistingValue : function(component,toggleManual) {
        if (!$A.util.isUndefinedOrNull(component.get('v.value'))) {
            if (typeof component.get('v.value') === 'string') {
                this.setValueInField(component,component.get('v.value'));
            }
            else {
                var existingAddress = component.get('v.value');
                var address = '';
                address = this.setAddressValue(address,existingAddress.street_number);
                address = this.setAddressValue(address,existingAddress.street_name);
                address = this.setAddressValue(address,existingAddress.city);
                if (toggleManual && component.get('v.showDependentPicklists')) {
                    address = this.setAddressValue(address,existingAddress.stateCountry.dependent);
                    address = this.setAddressValue(address,existingAddress.stateCountry.primary);
                }
                else {
                    address = this.setAddressValue(address, existingAddress.province);
                    address = this.setAddressValue(address, existingAddress.country);
                }
                address = this.setAddressValue(address,existingAddress.postal_code);

                this.setValueInField(component,address);
            }
            var compEvent = $A.get('e.Framework:RefreshInputField');
            compEvent.setParams({group : component.get('v.uniqueId'),refresh : true,data : component.get('v.value')});
            compEvent.fire();
        }
    },
    setValueInField : function(component,value) {
        var self = this;
        if (!$A.util.isEmpty(component.get('v.pcaKey'))) {
            document.getElementById(component.get('v.uniqueId')).value = value;
        }
        else {
            var interval = setInterval($A.getCallback(function(){
                if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject'))) {
                    var selectizeObj = component.get('v.lookupObject')[0];
                    var notValidId = self.generateId(10) + '_NOTVALID';
                    selectizeObj.selectize.addOption({label: value, value: notValidId});
                    selectizeObj.selectize.addItem(notValidId);
                    $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_clear_icon"]').removeClass('slds-hide');
                    clearInterval(interval);
                }
            }),250);
        }
    },
    setAddressValue : function(address,valueToAdd) {
        if ($A.util.isUndefinedOrNull(valueToAdd) || valueToAdd === 'null' || valueToAdd === '') {
            return address;
        }

        if (address.length === 0) {
            address = valueToAdd;
        }
        else {
            address += ', '+valueToAdd;
        }
        return address;
    },
    clearExistingValue : function(component) {
        try {
            if (!$A.util.isEmpty(component.get('v.pcaKey'))) {
                this.setPcaInputFromParts(component,{});
            }
            else {
                var self = this;
                if (component.isValid()) {
                    if (!$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize)) {
                        component.get('v.lookupObject')[0].selectize.clear();
                        component.set('v.value', null);
                        $A.util.addClass(component.find('removeIcon'), 'slds-hide');
                        $A.util.addClass(component.find('searchingIcon'), 'slds-hide');
                        $A.util.removeClass(component.find('searchIcon'), 'slds-hide');

                    }
                    else {
                        var intervalContext = setInterval($A.getCallback(function () {
                            if (component.isValid() && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0]) && !$A.util.isUndefinedOrNull(component.get('v.lookupObject')[0].selectize)) {
                                component.get('v.lookupObject')[0].selectize.clear();
                                component.set('v.value', null);
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
    setErrorMessages : function (component,event) {
        var params = event.getParam('arguments');
        if (params) {
            if (!$A.util.isUndefinedOrNull(params.errorMessages) && params.errorMessages.length > 0) {
                var inputCom = component.find('errorInput');
                inputCom.hideMessages();
                inputCom.showMessages(params.errorMessages);
            }
        }
    },
    clearErrorMessages : function (component,event) {
        var inputCom = component.find('errorInput');
        if (!$A.util.isUndefinedOrNull(inputCom)) {
            inputCom.hideMessages();
        }
    },
    updateDisabledFlag : function(component) {
        try {
            if (component.isValid()) {
                if ($A.util.isEmpty(component.get('v.pcaKey'))) {
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
                else {
                    if (component.get('v.disabled')) {
                        component.find('pcaInput').getElement().setAttribute('disabled', component.get('v.disabled'));
                    }
                    else {
                        component.find('pcaInput').getElement().removeAttribute('disabled');
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    },
    handleInputFieldValueChangedEvent : function (component,event) {
        try {
            if (event.getParam('fieldId') === 'manualAddress' && event.getParam('group') === component.get('v.uniqueId') + '_toggle') {
                component.set('v.disabled',event.getParam('value'));
                if (!event.getParam('value')) {
                    this.loadExistingValue(component,true);
                }
                else {
                    var valueObj = component.get('v.value');
                    if ($A.util.isUndefinedOrNull(valueObj)) {
                        valueObj = {};
                    }
                    component.set('v.value', valueObj);
                    if (!$A.util.isUndefinedOrNull(valueObj.street_number) && valueObj.street_number.length > 0) {
                        component.find('street_name').updateValue(valueObj.street_number + ' ' + valueObj.street_name);
                        valueObj.street_number = '';
                        component.set('v.value', valueObj);
                    }
                    if ($A.util.isEmpty(valueObj.stateCountry)) {
                        valueObj.stateCountry = {};
                        valueObj.stateCountry.primary = valueObj.country;
                        valueObj.stateCountry.dependent = valueObj.province;
                    }

                    var compEvent = $A.get('e.Framework:RefreshInputField');
                    compEvent.setParams({group : component.get('v.uniqueId'),refresh : true,data :valueObj});
                    compEvent.fire();
                }
            }
        }
        catch (err){}
    },
    validate : function (component) {
        if (component.get('v.valueObj.manualAddress')) {
            component.find('street_name').validate();
            component.find('city').validate();
            var stateCountryValidated = true;
            if (component.get('v.showDependentPicklists')) {
                component.find('stateCountry').validate();
                stateCountryValidated = component.find('stateCountry').get('v.validated');
                var value = component.get('v.value');
                value.province = component.get('v.value.stateCountry.dependent');
                value.country = component.get('v.value.stateCountry.primary');
                component.set('v.value',value);
            }
            else {
                component.find('province').validate();
                component.find('country').validate();
                stateCountryValidated = component.find('province').get('v.validated') || component.find('country').get('v.validated');
            }
            component.find('postal_code').validate();

            if (!component.find('street_name').get('v.validated') ||
                !component.find('city').get('v.validated') ||
                !stateCountryValidated ||
                !component.find('postal_code').get('v.validated')) {
                component.set('v.validated',false);
            }
            else {
                component.set('v.validated',true);
            }
        }
        else {
            if ($A.util.isUndefinedOrNull(component.get('v.value')) || (!$A.util.isUndefinedOrNull(component.get('v.value')) &&
                (Object.keys(component.get('v.value')).length === 0 || Object.keys(component.get('v.value')).length < 5))) {
                component.set('v.validated',false);
            }
            else {
                component.set('v.validated',true);
            }
        }
    },
    initializeLookupField : function(component) {
        try {
            var self = this;
            var options = {
                valueField: 'value',
                labelField: 'label',
                searchField: 'label',
                loadingClass: 'slds-none',
                create: false,
                placeholder : component.get('v.placeHolder'),
                maxItems: 1,
                options: [],
                render: {
                    option: function (item, escape) {
                        return '<div class="pac-item">\n' +
                            '<span class="pac-icon pac-icon-marker"></span>\n' +
                            '<span class="pac-item-query">'+escape(item.label) +'</span>\n' +
                            '</div>';
                    },
                    item: function (item, escape) {
                        return '<div>' + escape(item.label) + '</div>';
                    }
                },
                load: $A.getCallback(function (query, callback) {
                    if (!query.length) {
                        return callback();
                    }
                    $('[id="' + component.getGlobalId() + '_searching_icon"]').removeClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                    $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                    self.callbackMap[query] = callback;
                    document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({identifier : component.get('v.uniqueId'),type : 'query', query : query},'*');
                }),
                onDropdownOpen : $A.getCallback(function(){
                    this.clear();
                    component.set('v.value',null);
                }),
                onChange: $A.getCallback(function (value) {
                    if (!$A.util.isUndefinedOrNull(value) && value.indexOf('NOTVALID') === -1) {
                        if (!$A.util.isUndefinedOrNull(value) && value.length > 0) {
                            $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                            $('[id="' + component.getGlobalId() + '_search_icon"]').addClass('slds-hide');
                            $('[id="' + component.getGlobalId() + '_clear_icon"]').removeClass('slds-hide');
                            if (value !== 'NOTVALID') {
                                document.getElementById(component.get('v.uniqueId')).contentWindow.postMessage({
                                    identifier: component.get('v.uniqueId'),
                                    type: 'placeDetail',
                                    placeId: value
                                }, '*');
                            }
                        }
                        else {
                            $('[id="' + component.getGlobalId() + '_searching_icon"]').addClass('slds-hide');
                            $('[id="' + component.getGlobalId() + '_clear_icon"]').addClass('slds-hide');
                            $('[id="' + component.getGlobalId() + '_search_icon"]').removeClass('slds-hide');
                        }
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

                }
                else {
                    var intervalContext = setInterval($A.getCallback(function () {
                        if ($('.' + component.get('v.lookupClass')).length === 1) {
                            selectizeObj = $('.' + component.get('v.lookupClass')).selectize(options);
                            component.set('v.lookupObject', selectizeObj);
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
})