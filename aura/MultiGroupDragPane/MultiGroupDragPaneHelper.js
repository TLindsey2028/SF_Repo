/* global $ */
/* global _ */
/* global Sortable */
({
  initSortable : function(component) {
    var groupId = component.get('v.groupId');
    var selectorFactory = function (gid) {
      return {
        group: '.fonteva-picklist__group.fonteva-picklist__group_id_' + gid,
        remaining: '.fonteva-picklist__group_remaining_for_' + gid
      }
    }

    var listElement = document.querySelector('[id="' + component.getGlobalId() + groupId + '"]');

    var onAdd = function (cmp, self) {
      return function (event) {
          if (event.to.dataset.destination === 'true') {
              self.updateCountAdded(cmp, event.to, true, event.from);
          }
      }
    }(component, this);

    var onRemove = function (cmp, self) {
      return function (event) {
        if (event.from.dataset.destination === 'true') {
            self.updateCountAdded(cmp, event.to, false, event.from);
        }
      }
    }(component, this);

    Sortable.create(listElement, {
      ghostClass: "item--ghost",
      animation: 200,
      group: groupId,
      sort: component.get('v.sortable'),
      draggable: '.fonteva-picklist__item',
      onStart: function (event) {
        var sel = selectorFactory(event.from.dataset.groupid);
        $(sel.group).addClass('fonteva-picklist__group-highlighted');
        $(sel.remaining).removeClass('hidden');
      },
      onEnd: function (event) {
        var sel = selectorFactory(event.from.dataset.groupid);
        $(sel.group).removeClass('fonteva-picklist__group-highlighted');
        $(sel.remaining).addClass('hidden');
      },
      onAdd: onAdd,
// Due to onRemove event handler called on a different sortable instance its unable to
// capture component object. All data manipulation goes through jquery and modify data-* attributes
// In particular, countAdded component variable used only during init phase then it out of sync.
      onRemove: onRemove,
      onMove: function (evt, originalEvent) {
        if (evt.to === evt.from) {
          return;
        }
        var maxAvail = parseInt(evt.to.dataset.maxavailable, 10),
          countAdded = parseInt(evt.to.dataset.countadded, 10);
        if (isNaN(maxAvail) || isNaN(countAdded)) {
          return;
        }

        if (maxAvail > 0 && countAdded >= maxAvail) {
          return false;
        }
      }
    });
  },
  updateCountAdded: function(component, el, increment, elFrom) {
    var direction = increment ? 1 : -1;
    var value =  parseInt(el.dataset.countadded, 10) + direction;
    $('[id="' + el.id + '"]').attr('data-countadded', value);

    var maxAvail = parseInt(el.dataset.maxavailable, 10);
    if (!isNaN(maxAvail) && maxAvail) {
      var textVal;
      if (maxAvail >= value) {
        if (maxAvail === value) {
          textVal = 'no more';
        } else {
          textVal = (maxAvail - value) + ' more';
        }
      } else {
        textVal = 'remove ' + (value - maxAvail);
      }
      $('[id="cap_' + el.id + '"]').text(textVal);
    }

    var self = this;
    $A.getCallback(function () {
        var elems = [];
      if (increment) {
          elems = $('[id="' + el.id + '"] li');
      } else {
          elems = $('[id="' + elFrom.id + '"] li');
      }
      var selected = _.map(elems, function(elem) {
        return {
          key: elem.dataset.key,
          value: elem.innerText
        }
      });
      self.updateValue(component, selected, el.dataset.groupid);
    })();
  },
  updateValue: function(component, selected, groupId) {
    var allGroupsValue = _.cloneDeep(component.get('v.value'));
    var index = _.findIndex(allGroupsValue, {groupId: groupId});
    if (index === -1) {
      return;
    }
    allGroupsValue[index].data = selected;
    component.set('v.value', allGroupsValue);
  }
})