/* global _ */
({
	loadExistingValue : function(component) {
    var selected = function(data, isSelected) {
      return _.map(data, function(group) {
        var cloned = _.cloneDeep(group);
        cloned.data = _.filter(group.data, {selected: isSelected});
        return cloned;
      });
    };

    var selectedValues = selected(component.get('v.groupData'), true);

    component.set('v.groupDataSource', selected(component.get('v.groupData'), false));
    component.set('v.groupDataDestination', selectedValues);

    component.set('v.value', this.mapSelectedValues(selectedValues));
	},
	mapSelectedValues: function(selectedValues) {
	  return _.map(selectedValues, function(item) {
	    return {
	      groupId: item.groupId,
	      data: _.map(item.data, function(dataItem) { return {key: dataItem.key, value: dataItem.value};})
      }
    });
  },
  validate: function(component) {
    var groupData = component.get('v.groupData'),
      values = component.get('v.value');

    var getGroupData = function(group) {
      var groupItem = _.find(values, {groupId : group.groupId}) || {};
      return groupItem.data || [];
    }

    var substituteMessageParams = function (message, data) {
      return _.reduce(data, function(accumulator, value, index) {
        return accumulator.replace('{' + index + '}', value);
      }, message);
    }

    var validateGroupItem = function (item) {
      var maxAvailable = parseInt(item.maxAvailable, 10),
        required = item.required === true ? 1 : parseInt(item.required, 10);

      var data = getGroupData(item);
      if (!isNaN(maxAvailable) && maxAvailable > 0) {
        if (data.length > maxAvailable) {
          return substituteMessageParams($A.get('$Label.Framework.Multidrag_Error_HasMore'), [item.groupHeader, (data.length - maxAvailable)]);
        }
      }

      if (!isNaN(required) && required > 0) {
        if (data.length < required) {
          return substituteMessageParams($A.get('$Label.Framework.Multidrag_Error_Required'), [item.groupHeader, required]);
        }
      }

      return null;
    }

    var errors = _.chain(groupData)
      .map(validateGroupItem)
      .compact()
      .map(function (message) {return {message: message};})
      .value();

    component.set('v.errors', errors);
  },
  filterFields: function(component) {
    var filterText = component.find('filterFieldsInput').get('v.value');
    filterText = (filterText || '').toLowerCase().trim();

    if (!$A.util.isUndefinedOrNull(filterText) && filterText.length > 0) {
      $A.util.removeClass(component.find('removeIcon'),'slds-hide');
      $A.util.addClass(component.find('searchIcon'),'slds-hide');
    }
    else {
      $A.util.removeClass(component.find('searchIcon'),'slds-hide');
      $A.util.addClass(component.find('removeIcon'),'slds-hide');
    }
    var options = $('.js-available-options li.fonteva-picklist__item');

    _.forEach(options, function(htmlElement) {
      if ($A.util.isUndefinedOrNull(filterText) || (!$A.util.isUndefinedOrNull(filterText) && filterText.length === 0)) {
        $(htmlElement).removeClass('hidden');
      }
      else if (htmlElement.innerText.toLowerCase().indexOf(filterText) === -1) {
        $(htmlElement).addClass('hidden');
      }
      else {
        $(htmlElement).removeClass('hidden');
      }
    });
  }
})