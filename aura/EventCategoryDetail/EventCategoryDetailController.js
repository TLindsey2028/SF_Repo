({
    editCategory : function (component,event,helper) {
        helper.editCategory(component);
    },
    showDeleteCategoryPrompt : function (component,event,helper) {
        helper.showDeleteCategoryPrompt(component);
    },
    deleteCategory : function (component,event,helper) {
        helper.deleteCategory(component);
    },
    viewCategory : function (component) {
        UrlUtil.navToUrl('/'+component.get('v.category.id'),'_blank');
    }
})