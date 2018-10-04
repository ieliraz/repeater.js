//plugin repeater.js by Inon Eliraz (Last Update: 2017)

jQuery.fn.outerHTML = function (s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function rp_inArray(target, comparer) {
    for (var i = 0; i < target.length; i++) {
        if (comparer(target[i])) return true;
    }
    return false;
};

objectValues = function (o) {
    return objectKeysOrValues(o, 'values');
}

objectKeys = function (o) {
    return objectKeysOrValues(o, 'keys');
}

objectKeysOrValues = function (o, flag) {
    var arr = [];
    $.each(o, function (key, value) {
        arr.push(flag === 'keys' ? key : value);
    });
    return arr;
}

Array.prototype.rp_pushIfNotExist = function (element, comparer) {
    if (typeof comparer == 'undefined')
        comparer = function (e) {
            return e === element;
        }
    if (!rp_inArray(this, comparer)) {
        this.push(element);
    }
};

$.fn.loadRepeater = function (jsonTable, options) {

    function rp_addDataAttributes(e, deleteParentDataAttr) {
        var arr;
        if (deleteParentDataAttr != undefined && deleteParentDataAttr)
            arr = $(e).find('*').add(e);
        else
            arr = $(e).find('*')
        arr.each(function () {
            var dataSet = this.dataset;
            var keysArr = objectKeys(dataSet);
            var valuesArr = objectValues(dataSet);
            for (var i = 0; i < keysArr.length; i++) {
                var key = keysArr[i];
                if (key != 'repeater') {
                    $(this).data(key, valuesArr[i])
                    $(this).removeAttr('data-' + key);
                }
            }
        });
    }

    function rp_addAllTableDataToIteration(e, dataRow) {
        var keys = objectKeys(dataRow);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            e.data(key, dataRow[key]);
        }
    }

    function rp_addTableDataToIteration(e, dataRow, dataToAdd) {
        if (dataToAdd === '')
            return false;
        if (dataToAdd === '*') {
            return rp_addAllTableDataToIteration(dataRow);
        }
        if ($.type(dataToAdd) === 'string')
            dataToAdd = dataToAdd.join(',');
        for (var i = 0; i < dataToAdd.length; i++) {
            var key = dataToAdd[i];
            e.data(key, dataRow[key]);
        }
    }

    function rp_initRepeaterConditions(nodeHtml) {
        var nextCondition = rp_cutFromTo(nodeHtml, '{$$', '}');
        var counter = 100;
        while (nextCondition != '' && counter > 0) {
            counter--;
            var conditionType = nextCondition.substring(4, nextCondition.indexOf('('));
            var conditionArray = nextCondition.substring(nextCondition.indexOf('(') + 1, nextCondition.indexOf(')')).split(',');
            var conditionValue = '';
            if (conditionType === 'IF') {
                var conditionTerm = conditionArray[0];
                var conditionOperator, conditionA, conditionB;

                if (conditionTerm.indexOf('!=') != -1)
                    conditionOperator = '!=';
                else if (conditionTerm.indexOf('<>') != -1)
                    conditionOperator = '<>';
                else if (conditionTerm.indexOf('<=') != -1)
                    conditionOperator = '<=';
                else if (conditionTerm.indexOf('>=') != -1)
                    conditionOperator = '>=';
                else if (conditionTerm.indexOf('<') != -1)
                    conditionOperator = '<';
                else if (conditionTerm.indexOf('>') != -1)
                    conditionOperator = '>';
                else if (conditionTerm.indexOf('==') != -1)
                    conditionOperator = '==';
                else if (conditionTerm.indexOf('=') != -1)
                    conditionOperator = '=';
                else
                    conditionOperator = '';

                if (conditionOperator != '') {
                    conditionA = conditionTerm.substring(0, conditionTerm.indexOf(conditionOperator));
                    conditionB = conditionTerm.substring(conditionTerm.indexOf(conditionOperator) + conditionOperator.length);
                    if (isNaN(conditionA) && isNaN(conditionB)) {
                        conditionA = '"' + conditionA + '"';
                        conditionB = '"' + conditionB + '"';
                    }
                    if (conditionOperator == '=')
                        conditionOperator = '=='
                    else if (conditionOperator == '<>')
                        conditionOperator = '!='

                    var conditionValue = eval(conditionA + conditionOperator + conditionB) ? conditionArray[1] : (conditionArray.length > 2 ? conditionArray[2] : '');
                }
            } else if (conditionType === 'FORMAT') {
                var stringValue = conditionArray[0];
                var stringFormat = conditionArray[1];
                var d = new Date(stringValue);
            }
            nodeHtml = rp_replaceAll(nodeHtml, nextCondition, conditionValue);
            nextCondition = rp_cutFromTo(nodeHtml, '{$$', '}');
        }
        return nodeHtml;
    }

    function rp_repeaterFields(target) {
        var arr = [];
        var open = -1;
        var close = -1;
        var s = '';
        for (var i = 0; i < target.length; ++i) {
            open = target.indexOf('{%', open);
            if (open < 0)
                break;
            close = target.indexOf('%}', open + 2);
            if (close < 0)
                break;
            s = target.substring(open, close + 2);
            arr.rp_pushIfNotExist(s);
            open += s.length;
            if (open >= target.length)
                break;
        }
        return arr;
    }

    function rp_cutFromTo(target, from, to) {
        var fromIndex = target.indexOf(from);
        if (fromIndex == -1)
            return '';
        var sCut = target.substring(fromIndex);
        var toIndex = sCut.substring(from.length).indexOf(to);
        if (toIndex == -1)
            return '';
        return sCut.substring(0, toIndex + from.length + to.length);
    }

    function rp_replaceAll(target, search, replacement) {
        while (target.toString().indexOf(search) != -1) {
            target = target.toString().replace(search, replacement);
        }
        return target;

        return target.toString().replace(new RegExp(search, 'g'), replacement);
    };


    var defaults = {
        onFinish: null,
        onFinishNoLines: null,
        oldRecordMethod: 'remove',
        uniqueIdentifier: '',
        reloadExistsRecoreds: true,
        deleteRepeaterBase: false,
        hideRepeaterBase: true,
        dataToAdd: '',
        addAllTableData: false,
        addJqueryData: false,
        deleteParentDataAttr: false,
        data: null,
        createLinks: false
    }

    var e = this;

    var settings = $.extend({}, defaults, options);

    var el = $(this).filter('[data-repeater!="child"]');

    var sourceElement = el;

    if (settings.oldRecordMethod != 'keep') {
        el.siblings('[data-repeater="child"]').each(function () {
            if ($(this).data('repeater-source').is(sourceElement)) {
                if (settings.oldRecordMethod == 'remove')
                    $(this).remove();
                else if (settings.oldRecordMethod == 'hide')
                    $(this).hide();
            }
        });
    }
    var parentHtml = el.outerHTML();
    var repeaterFields = rp_repeaterFields(parentHtml);

    if (typeof el.data('repeater-last-child') == 'undefined' || $('html').find(el.data('repeater-last-child')).length == 0)
        el.removeData('repeater-last-child');

    var lastElement = el.data('repeater-last-child');
    if (lastElement == null)
        lastElement = el;

    if (jsonTable.length == undefined)
        jsonTable = objectValues(jsonTable);

    if (settings.deleteRepeaterBase === true)
        el.remove();
    else if (settings.hideRepeaterBase === true)
        el.hide();

    var siblings = el.siblings(el.get(0).tagName);

    for (var i = 0; i < jsonTable.length; ++i) {
        var newNodeHtml = parentHtml;
        for (var j = 0 ; j < repeaterFields.length ; ++j) {
            var ai = repeaterFields[j];
            var field = ai.substring(2, ai.length - 2);
            var val = jsonTable[i][field];
            if (val == null)
                val = '';
            val = rp_replaceAll(val, '"', '&quot;');
            if (settings.createLinks && typeof val == 'string')
                val = val.replace(/(((http|https|ftp):\/\/|\/\/)[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1" target="_blank">$1</a> ');
            newNodeHtml = rp_replaceAll(newNodeHtml, ai, val);
        }
        newNodeHtml = rp_initRepeaterConditions(newNodeHtml);
        var o = $(newNodeHtml);
        o.attr('data-repeater', 'child');
        o.data('repeater-source', sourceElement);

        if (settings.addJqueryData === true)
            rp_addDataAttributes(o, settings.deleteParentDataAttr);

        if (settings.addAllTableData === true)
            rp_addAllTableDataToIteration(o, jsonTable[i]);

        if (settings.dataToAdd != '')
            rp_addTableDataToIteration(o, jsonTable[i], settings.dataToAdd);

        var appendLast = true;
        if (settings.uniqueIdentifier != '') {
            var ollElement = siblings.filter('[data-repeater-id=' + jsonTable[i][settings.uniqueIdentifier] + ']');
            if (ollElement.length > 0) {
                if (settings.reloadExistsRecoreds) {
                    ollElement.after(o);
                    ollElement.remove();
                }
                else
                    o = ollElement
                appendLast = false;
            }
            o.attr('data-repeater-id', jsonTable[i][settings.uniqueIdentifier]);
        }

        if (appendLast) {
            o.insertAfter(lastElement)
            lastElement = o;
            el.data('repeater-last-child', lastElement);
        }

        o.css('display', '');
    }

    if (settings.onFinish != null && (settings.onFinishNoLines == null || jsonTable.length > 0)) {
        if (settings.data != null)
            settings.onFinish(settings.data);
        else
            settings.onFinish.call();
    }

    if (settings.onFinishNoLines != null && jsonTable.length == 0) {
        if (settings.data != null)
            settings.onFinishNoLines(settings.data);
        else
            settings.onFinishNoLines.call();
    }

}

