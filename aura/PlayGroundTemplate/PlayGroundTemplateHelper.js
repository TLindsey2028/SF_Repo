({
    getFieldTypeOptions: function() {
        var fieldTypes = [];
        fieldTypes.push({"label":"--Select--", "value":""});
        fieldTypes.push({"label":"Any Type", "value":"anytype"});
        fieldTypes.push({"label":"Boolean", "value":"boolean"});
        fieldTypes.push({"label":"File Upload", "value":"fileupload"});
        fieldTypes.push({"label":"Currency", "value":"currency"});
        fieldTypes.push({"label":"Date", "value":"date"});
        fieldTypes.push({"label":"DateTime", "value":"datetime"});
        fieldTypes.push({"label":"Double", "value":"double"});
        fieldTypes.push({"label":"Email", "value":"email"});
        fieldTypes.push({"label":"Password", "value":"password"});
        fieldTypes.push({"label":"Phone", "value":"phone"});
        fieldTypes.push({"label":"Id", "value":"id"});
        fieldTypes.push({"label":"Integer", "value":"integer"});
        fieldTypes.push({"label":"Multi-Picklist", "value":"multipicklist"});
        fieldTypes.push({"label":"Percent", "value":"percent"});
        fieldTypes.push({"label":"Picklist", "value":"picklist"});
        fieldTypes.push({"label":"Reference", "value":"reference"});
        fieldTypes.push({"label":"String", "value":"string"});
        fieldTypes.push({"label":"Text Area", "value":"textarea"});
        fieldTypes.push({"label":"Rich Text", "value":"richtext"});
        fieldTypes.push({"label":"Basic Rich Text", "value":"basicrichtext"});
        //fieldTypes.push({"label":"Time", "value":"time"});
        fieldTypes.push({"label":"Lookup", "value":"lookup"});
        fieldTypes.push({"label":"Address", "value":"address"});
        fieldTypes.push({"label":"Url", "value":"url"});
        fieldTypes.push({"label":"Multi Drag-Drop", "value":"multidragdrop"});
        fieldTypes.push({"label":"Multi Group Drag-Drop", "value":"multigroupdragdrop"});
        fieldTypes.push({"label":"Re-Order Drag Single List", "value":"reorderdragsinglelist"});
        fieldTypes.push({"label":"Advanced Select Field", "value":"advancedselectfield"});
        fieldTypes.push({"label":"Color Picker", "value":"colorpickerfield"});
        fieldTypes.push({"label":"Code Editor", "value":"codeeditorfield"});
        fieldTypes.push({"label":"Radio", "value":"radio"});
        fieldTypes.push({"label":"Alternate Radio", "value":"alternateradio"});
        fieldTypes.push({"label":"Dependent Picklist", "value":"dependentpicklist"});
        return fieldTypes;
    },
    buildFieldTypeOptions: function(component) {
        var fieldTypes = this.getFieldTypeOptions();
        component.find('fieldType').setSelectOptions(fieldTypes);
        var fieldTypeMap = [];
        fieldTypes.forEach(function(element) {
            fieldTypeMap[element.value] = element.label;
        });
        component.set('v.fieldTypeMap', fieldTypeMap);
    },
    addSelectedFieldType: function(component) {
        var obj = component.get('v.playGroundObj');
        var fieldTypeMap = component.get('v.fieldTypeMap');
        var helper = this;
        var fieldId = 0;
        component.find("inputFieldBody").get('v.body').forEach(function(element) {
            if (element.get('v.fieldType') === obj.fieldType) {
                fieldId++;
            }
        });
        if (fieldId > 0) {
            fieldId = obj.fieldType + fieldId;
        } else {
            fieldId = obj.fieldType;
        }
        if (!$A.util.isUndefinedOrNull(obj.fieldType) && obj.fieldType !== '') {
            if (obj.fieldType === 'reorderdragsinglelist') {
                obj[fieldId] = helper.getFieldTypeOptions();
            }
            $A.createComponent(
                'markup://Framework:'+'InputFields',{
                    'isRequired': true,
                    'value' : obj,
                    'fieldType' : obj.fieldType,
                    'aura:id' : fieldId,
                    'label' : fieldTypeMap[obj.fieldType],
                    'otherAttributes' : {name : 'Group'},
                    fireChangeEvent : true
                }, function(cmp) {
                    component.set('v.globalIdValue',cmp.getGlobalId());
                    cmp.set('v.value', obj);
                    switch (obj.fieldType) {
                        case "dependentpicklist":
                            cmp.setOtherAttributes({picklistOptions : {
                                'First' : [{'label' : 'Option 1','value' : 'Option 1'},{'label' : 'Option 2','value' : 'Option 2'}],
                                'Second' : [{'label' : 'Option 3','value' : 'Option 3'},{'label' : 'Option 4','value' : 'Option 4'}],
                                'Third' : []
                            }});
                            break;
                        case "reference":
                        case "lookup":
                            cmp.setOtherAttributes({
                                type : 'Account'
                            });
                            break;
                        case "multipicklist":
                        case "picklist":
                        case "advancedselectfield":
                            cmp.setOtherAttributes({
                                objectName : 'Account',
                                field : 'type'
                            });
                            break;
                        case "multidragdrop":
                            cmp.setOtherAttributes({
                                showSearchField: true,
                                availableValues : helper.getFieldTypeOptions(),
                                selectedValues: []
                            });
                            break;
                        case "multigroupdragdrop":
                            cmp.set('v.isRequired', true);
                            cmp.setOtherAttributes({
                                groupData : helper.getGroupDataForMultiGroup()
                            });
                            break;
                        case "alternateradio":
                            cmp.setOtherAttributes({
                                listValues : [{label : 'Mon',value : 'monday'},{label : 'Tue',value : 'tuesday'}],
                            });
                            break;
                        case "fileupload":
                            cmp.setOtherAttributes({
                               showPreview : true,
                               previewWidth : 100,
                               previewHeight : 100
                            });
                        default:
                            break;
                    }
                    var divComponent = component.find("inputFieldBody");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body',divBody);
                }
            );
        }
        component.find('fieldType').updateValue('', false);
    },
    compileInputFields: function(component) {
        var isFormValid = true;
        component.find("inputFieldBody").get('v.body').forEach(function(element) {
            if (element.get('v.validated') != null) {
                element.validate();
                if (element.get('v.validated') && isFormValid) {
                    isFormValid = element.get('v.validated');
                }
                else {
                    isFormValid = false;
                }
            }
        });
        if (isFormValid === undefined) {
            isFormValid = true;
        }
        if (isFormValid) {
            component.set('v.playGroundObjString', JSON.stringify(component.get('v.playGroundObj'), null, 3));
        }
        component.find('compileBtn').stopIndicator();
    },
    getGroupDataForMultiGroup: function() {
      return [
        {
          groupHeader: 'First Group Header',
          groupId: 'First_Group_Id',
          maxAvailable: 5,
          required: true,
          data: [
            { key: 1, value: 'Recent', selected: false },
            { key: 2, value: 'Created by Me', selected: false },
            { key: 3, value: 'Private Reports', selected: true },
            { key: 4, value: 'Public Reports', selected: true },
            { key: 5, value: 'All Reports', selected: false },
            { key: 6, value: 'Shared with Me', selected: false }
          ]
        },
        {
          groupHeader: 'Second Group Header',
          groupId: 'Second_Group_Id',
          required: 2,
          data: [
            { key: 1, value: 'Recent', selected: false },
            { key: 2, value: 'Created by Me', selected: false },
            { key: 3, value: 'Private Reports', selected: false },
            { key: 4, value: 'Public Reports', selected: false },
            { key: 5, value: 'All Reports', selected: false },
            { key: 6, value: 'Shared with Me', selected: false }
          ]
        },
        {
          groupHeader: 'Third Group Header',
          groupId: 'Third_Group_Id',
          maxAvailable: 4,
          data: [
            { key: 1, value: 'Recent', selected: true },
            { key: 2, value: 'Created by Me', selected: true },
            { key: 3, value: 'Private Reports', selected: true },
            { key: 4, value: 'Public Reports', selected: true },
            { key: 5, value: 'All Reports', selected: true },
            { key: 6, value: 'Shared with Me', selected: true }
          ]
        }
      ]
    }
})