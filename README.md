# repeater.js
Make Repeater (Like ASP Repeater) on specific element

Requirements: jQuery

If you hav a asp.net repeater (and even not) and you want to convert it fast to dinamic by client.
Just replace: <% %> to {% %}

Example:

HTML:
            <tr id="myTR">
                <td>{%Name%}</td>
                <td>{%Age%}</td>
                <td>{%WebSite%}</td>
                <td><input type="text" value="{%Remark%}"/></td>
                <td><button style="display:{$$.IF({%AllowDelete%}==true,inline,none)}">Delete</button></td>
            </tr>
            
When you start the load method - the plygin will duplicate the element with values in json table (and hide the base element)

JS:
        var jsonString = '[{"Id": 1, "Name": "David", "Age": 26, "WebSite": "http://www.david.com/", "Remark": "Remarks Here", "AllowDelete": true},{"Id": 2, "Name": "Michael", "Age": 30, "WebSite": "http://www.michael.com/", "AllowDelete": true},{"Id": 3, "Name": "Jonatan", "Age": 12, "WebSite": "http://www.jonatan.com/", "Remark": "Remarks...", "AllowDelete": false}]';
        var json = JSON.parse(jsonString);
        $('#myTR').loadRepeater(json, {onFinish: function(){console.log('finish!',new Date())}, uniqueIdentifier: "Id", createLinks: true});



Documentation:

Mehod:
loadRepeater

Parameters:

jsonTable - Json objects array that contain the data to load

options - Json options:

        onFinish: js function to call on finish (default null),
        
        onFinishNoLines: js function to call on finish when have no rows in jsonTable (default null),
        
        oldRecordMethod: what to do when load again on same element - 'keep' / 'remove' / 'hide' (default 'remove'),
        
        uniqueIdentifier: the unique identifier field in the jsonTable, when oldRecordMethod is 'keep' - anyway replace this row (default ''),
        
        reloadExistsRecoreds: if false when same uniqueIdentifier - this row stay as is was (default true),
        
        deleteRepeaterBase: delete from the DOM the element with the repeate chars (default false),
        
        hideRepeaterBase: hide the element with the repeate chars (default true),
        
        dataToAdd: add this values (comma delimited) as data to the element (default ''),
        
        addAllTableData: add all keys in the json as data (default false),
        
        addJqueryData: add the parant dataset as data (default false),
        
        deleteParentDataAttr: delte the parent data (default false),
        
        data: some data to send to onFinish (default null),
        
        createLinks: if find http links - make them clickable (default false)
