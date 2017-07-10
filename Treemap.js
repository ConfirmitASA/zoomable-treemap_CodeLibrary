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
        context.log.LogDebug('test1');
    //var rowHeaderTitles = context.report.TableUtils.GetRowHeaderCategoryTitles(settings.tableName);
    var rowHeaderIds = context.report.TableUtils.GetRowHeaderCategoryIds(settings.tableName);
    var valueColumnIndex = settings.valueColumnIndex ? settings.valueColumnIndex : 1;
    var rowHeaderValues = context.report.TableUtils.GetColumnValues(settings.tableName, valueColumnIndex);
    var colorValues = settings.colorValueColumnIndex ? context.report.TableUtils.GetColumnValues(settings.tableName, settings.colorValueColumnIndex) : rowHeaderValues;
    context.log.LogDebug('test2');
    //var rowheaders = [];

    /*for(var i = 0; i < rowHeaderIds.length; i++) {
        rowheaders[rowHeaderIds[i][0]] = {
            index: i,
            title: rowHeaderTitles[i][0],
            value: rowHeaderValues[i].Value,
            colorValue: colorValues[i].Value
        };
    }*/

    //var codes = table.GetColumnValues("id");
    //var names = table.GetColumnValues("__l9");
    //var parents = table.GetColumnValues(settings.parentColumn);


    var schema = context.confirmit.GetDBDesignerSchema(settings.schemaId);
    var table = schema.GetDBDesignerTable(settings.databaseTableName);
    var dataTableRows = table.GetDataTable().Rows;
    var idColumnName = "id";
    var labelColumName = "__l9";
    var parentColumnName = settings.parentColumn;
    var categoriesArray = [];

    context.log.LogDebug('test3');
    for(var i = 0; i < rowHeaderIds.length; i++) {

        context.log.LogDebug('test4.' + i);
        var id = rowHeaderIds[i][0];
        context.log.LogDebug('test5.' + i);
        var searchFunction = function(item) {
            return item[idColumnName] === id;
        };
        context.log.LogDebug('test6.' + i);
        var row = findItem(dataTableRows, searchFunction);
        context.log.LogDebug('test7.' + i);
        categoriesArray.push({
            id: id,
            name: row[labelColumName],
            parent: row[parentColumnName],
            index: i,
            value: rowHeaderValues[i].Value,
            colorValue: colorValues[i].Value
        });
    }


    context.log.LogDebug('test8');
    /*for(var i=0; i<codes.Count; i++){
        categoriesArray.push({
            id: codes.Item(i),
            name: names.Item(i),
            parent: parents.Item(i),
            index: rowheaders[codes.Item(i)].index,
            value: rowheaders[codes.Item(i)].value,
            colorValue: rowheaders[codes.Item(i)].colorValue
        });
    }*/

    var text = context.component;
    var colorFunctionName = "colorFunction_" + index;
    var categoriesArrayName = "categoriesArray" + index;
    text.Output.Append(JSON.print(categoriesArray, categoriesArrayName));
    text.Output.Append(JSON.print(settings.colorFunction, colorFunctionName));

    context.log.LogDebug('test9');
    var str = "var treemap_" + index +
        " = new Reportal.ZoomableTreemap({tableContainerId: '" + settings.tableContainerId + "'," +
        "treemapContainerId: '" + settings.treemapContainerId + "', " +
        (settings.isDrilldownEnabled ? ("isDrilldownEnabled: " + settings.isDrilldownEnabled + ", ") : "") +
        (settings.colorFunction ? ("colorFunction: " + colorFunctionName + ", ") : "") +
        (settings.containerWidth ? ("containerWidth: " + settings.containerWidth + ", ") : "") +
        (settings.containerHeight ? ("containerHeight: " + settings.containerHeight + ", ") : "") +
        (settings.title ? ("title: '" + settings.title + "', ") : "") +
        "flatHierarchy: " + categoriesArrayName + "});";

    context.log.LogDebug('test10');
    text.Output.Append("<script>" + str + "</script>");
    context.log.LogDebug('test11');
}

    static function findItem(arr, condiion) {
        for (var i = 0; i < arr.length; i++) {
            if(condiion(arr[i])) {
                return arr[i];
            }
        }

        return null;
    }
}