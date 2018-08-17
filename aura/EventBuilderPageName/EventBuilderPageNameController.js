({
    doInit : function (component) {
        if (component.get('v.pageName').toLowerCase().indexOf('label.') > -1) {
            component.set('v.pageDisplayName',$A.get('$'+component.get('v.pageName')));
        }
        else {
            component.set('v.pageDisplayName',component.get('v.pageName'));
        }
    }
})