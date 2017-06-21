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
    var valueColumnIndex = settings.valueColumnIndex ? settings.valueColumnIndex : 1;
    var rowHeaderValues = context.report.TableUtils.GetColumnValues(settings.tableName, valueColumnIndex);
    var colorValues = settings.colorValueColumnIndex ? context.report.TableUtils.GetColumnValues(settings.tableName, settings.colorValueColumnIndex) : rowHeaderValues;
    var rowheaders = [];

    for(var i = 0; i < rowHeaderIds.length; i++) {
        rowheaders[rowHeaderIds[i][0]] = {
            index: i,
            title: rowHeaderTitles[i][0],
            value: rowHeaderValues[i].Value,
            colorValue: colorValues[i].Value
        };
    }

    var schema = context.confirmit.GetDBDesignerSchema(settings.schemaId);
    var table = schema.GetDBDesignerTable(settings.databaseTableName);
    var codes = table.GetColumnValues("id");
    var names = table.GetColumnValues("__l9");
    var parents = table.GetColumnValues(settings.parentColumn);
    var categoriesArray = [];

    for(var i=0; i<codes.Count; i++){
        categoriesArray.push({
            id: codes.Item(i),
            name: names.Item(i),
            parent: parents.Item(i),
            index: rowheaders[codes.Item(i)].index,
            value: rowheaders[codes.Item(i)].value,
            colorValue: rowheaders[codes.Item(i)].colorValue
        });
    }

    var text = context.component;
    var colorFunctionName = "colorFunction_" + index;
    var categoriesArrayName = "categoriesArray" + index;
    text.Output.Append(JSON.print(categoriesArray, categoriesArrayName));
    text.Output.Append(JSON.print(settings.colorFunction, colorFunctionName));

    var str = "var treemap_" + index +
        " = new Reportal.ZoomableTreemap({tableContainerId: '" + settings.tableContainerId + "'," +
        "treemapContainerId: '" + settings.treemapContainerId + "', " +
        (settings.isDrilldownEnabled ? ("isDrilldownEnabled: " + settings.isDrilldownEnabled + ", ") : "") +
        (settings.colorFunction ? ("colorFunction: " + colorFunctionName + ", ") : "") +
        (settings.containerWidth ? ("containerWidth: " + settings.containerWidth + ", ") : "") +
        (setings.containerHeight ? ("containerHeight: " + settings.containerHeight + ", ") : "") +
        (settings.title ? ("title: '" + settings.title + "', ") : "") +
        "flatHierarchy: " + categoriesArrayName + "});";

    text.Output.Append("<script>" + str + "</script>");
}
}