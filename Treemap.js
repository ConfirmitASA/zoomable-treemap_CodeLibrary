class Treemap {
    static var context : Object;
    static var globalSettings : Object;

    static function setUpGlobalSettings(globalSettings) {
    Treemap.globalSettings = globalSettings;
}

    static function setUpContext(context) {
    Treemap.context = context;
}

    static function setUpTreemaps(tables) {
    for (var i = 0; i < tables.length; i++) {
        var table = tables[i];
        Treemap.populateGlobals(table);
        Treemap.setUpTreemap(table, i);
    }
}

    static function populateGlobals(table) {
    context.log.LogDebug('checking keys');
    for (var key in Treemap.globalSettings) {
        context.log.LogDebug('key = ' + key);
        if(!table[key]) {
            table[key] = Treemap.globalSettings[key];
        }
    }
}

    static function setUpTreemap(settings, index) {
    var rowHeaderTitles = context.report.TableUtils.GetRowHeaderCategoryTitles(settings.tableName);
    var rowHeaderIds = context.report.TableUtils.GetRowHeaderCategoryIds(settings.tableName);
    var rowHeaderValues = context.report.TableUtils.GetColumnValues(settings.tableName, settings.valueColumnIndex);
    var rowheaders = [];

    for(var i = 0; i < rowHeaderIds.length; i++) {
        rowheaders[rowHeaderIds[i][0]] = {title: rowHeaderTitles[i][0], index: i, value: rowHeaderValues[i].Value};
    }
    var project = context.report.DataSource.GetProject(settings.datasourceId);
    var schema = context.confirmit.GetDBDesignerSchema(settings.schemaId);
    var table = schema.GetDBDesignerTable(settings.databaseTableName);
    var codes = table.GetColumnValues("id");
    var names = table.GetColumnValues("__l9");
    var parents = table.GetColumnValues(settings.parentColumn);
    var values = new StringCollection();
    var indices = new StringCollection();
    var categoriesArray = [];

    for(var i=0; i<codes.Count; i++){
        categoriesArray.push({
            id: codes.Item(i),
            name: names.Item(i),
            parent: parents.Item(i),
            index: rowheaders[codes.Item(i)].index,
            value: rowheaders[codes.Item(i)].value
        });
    }

    var text = context.component;
    var colorFunctionName = "colorFunction_" + index;
    text.Output.Append(JSON.print(categoriesArray, "categoriesArray"));
    text.Output.Append(JSON.print(settings.colorFunction, colorFunctionName));

    var str = "var treemap_" + index +
        " = new Reportal.ZoomableTreemap({tableContainerId: '" + settings.tableContainerId +
        "', treemapContainerId: '" + settings.treemapContainerId +
        "', isDrilldownEnabled: " + settings.isDrilldownEnabled +
        ", colorFunction: " + colorFunctionName +
        ", containerWidth: " + settings.containerWidth +
        ", containerHeight: " + settings.containerHeight +
        ", flatHierarchy: categoriesArray});";

    text.Output.Append("<script>" + str + "</script>");
}
}