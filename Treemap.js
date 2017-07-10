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
        var id = rowHeaderIds[i][0].toLowerCase();
        context.log.LogDebug('test5.' + i);
        var searchFunction = function(item) {
            return item[idColumnName].toLowerCase() === id;
        };
        context.log.LogDebug('test6.' + i);
        var row = findItem(dataTableRows, searchFunction);
        context.log.LogDebug('test7.' + i);
        context.log.LogDebug(row);
        var parent = row[parentColumnName];
        context.log.LogDebug('test8.' + i);
        var value = rowHeaderValues[i].Value;
        context.log.LogDebug('test9.' + i);
        var colorValue = colorValues[i].Value;
        context.log.LogDebug('test10.' + i);
        var name = row[labelColumName];
        context.log.LogDebug('test11.' + i);

        categoriesArray.push({
            id: id,
            name: name,
            parent: parent,
            index: i,
            value: value,
            colorValue: colorValues
        });
    }


    context.log.LogDebug('test12');
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

    context.log.LogDebug('test12.1');
    var colorFunctionName = "colorFunction_" + index;

    context.log.LogDebug('test12.2');
    var categoriesArrayName = "categoriesArray" + index;

    context.log.LogDebug('test12.3');
    text.Output.Append(JSON.print(categoriesArray, categoriesArrayName));

    context.log.LogDebug('test12.4');
    text.Output.Append(JSON.print(settings.colorFunction, colorFunctionName));

    context.log.LogDebug('test13');
    var str = "var treemap_" + index +
        " = new Reportal.ZoomableTreemap({tableContainerId: '" + settings.tableContainerId + "'," +
        "treemapContainerId: '" + settings.treemapContainerId + "', " +
        (settings.isDrilldownEnabled ? ("isDrilldownEnabled: " + settings.isDrilldownEnabled + ", ") : "") +
        (settings.colorFunction ? ("colorFunction: " + colorFunctionName + ", ") : "") +
        (settings.containerWidth ? ("containerWidth: " + settings.containerWidth + ", ") : "") +
        (settings.containerHeight ? ("containerHeight: " + settings.containerHeight + ", ") : "") +
        (settings.title ? ("title: '" + settings.title + "', ") : "") +
        "flatHierarchy: " + categoriesArrayName + "});";

    context.log.LogDebug('test14');
    text.Output.Append("<script>" + str + "</script>");
    context.log.LogDebug('test15');
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