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
    for (var key in Treemap.globalSettings) {
        if(!table[key]) {
            table[key] = Treemap.globalSettings[key];
        }
    }
}

    static function setUpTreemap(settings, index) {
    var rowHeaderIds = context.report.TableUtils.GetRowHeaderCategoryIds(settings.tableName);
    var valueColumnIndex = settings.valueColumnIndex ? settings.valueColumnIndex : 1;
    var rowHeaderValues = context.report.TableUtils.GetColumnValues(settings.tableName, valueColumnIndex);
    var colorValues = settings.colorValueColumnIndex ? context.report.TableUtils.GetColumnValues(settings.tableName, settings.colorValueColumnIndex) : rowHeaderValues;

    var schema = context.confirmit.GetDBDesignerSchema(settings.schemaId);
    var table = schema.GetDBDesignerTable(settings.databaseTableName);
    var dataTableRows = table.GetDataTable().Rows;
    var idColumnName = "id";
    var labelColumName = "__l9";
    var parentColumnName = settings.parentColumn;
    var categoriesArray = [];

    for(var i = 0; i < rowHeaderIds.length; i++) {
        var id = rowHeaderIds[i][0].toLowerCase();
        var searchFunction = function(item) {
            return item[idColumnName].toLowerCase() === id;
        };
        var row = findItem(dataTableRows, searchFunction);
        var parent = row[parentColumnName];
        var value = rowHeaderValues[i].Value;
        var colorValue = colorValues[i].Value;
        var name = row[labelColumName];

        categoriesArray.push({
            id: id,
            name: name,
            parent: parent,
            index: i,
            value: value,
            colorValue: colorValue
        });
    }

    var text = context.component;
    var colorFunctionName = "colorFunction_" + index;
    var paletteName = "treemapPalette_" + index;
    var categoriesArrayName = "categoriesArray" + index;
    text.Output.Append(JSON.print(categoriesArray, categoriesArrayName));
    text.Output.Append(JSON.print(settings.colorFunction, colorFunctionName));
    text.Output.Append(JSON.print(settings.palette, paletteName));

    var str = "var treemap_" + index +
        " = new Reportal.ZoomableTreemap({tableContainerId: '" + settings.tableContainerId + "'," +
        "treemapContainerId: '" + settings.treemapContainerId + "', " +
        (settings.isDrilldownEnabled ? ("isDrilldownEnabled: " + settings.isDrilldownEnabled + ", ") : "") +
        (settings.colorFunction ? ("colorFunction: " + colorFunctionName + ", ") : "") +
        (settings.palette ? ("palette: " + paletteName + ", ") : "") +
        (settings.containerWidth ? ("containerWidth: " + settings.containerWidth + ", ") : "") +
        (settings.containerHeight ? ("containerHeight: " + settings.containerHeight + ", ") : "") +
        (settings.title ? ("title: '" + settings.title + "', ") : "") +
        "flatHierarchy: " + categoriesArrayName + "});";

    text.Output.Append("<script>" + str + "</script>");
}

    static function findItem(arr, condition) {
        for (var i = 0; i < arr.Count; i++) {
            if(condition(arr[i])) {
                return arr[i];
            }
        }

        return null;
    }
}