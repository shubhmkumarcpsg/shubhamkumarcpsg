var site = _spPageContextInfo.webAbsoluteUrl;
$(document).ready(function(){
    var queryStr = document.location.search;
    if(queryStr.indexOf('?') != -1){
        var stringString = queryStr.split('?')[1];
        if(stringString.indexOf('=') != -1){
            var eleText = stringString.split('=')[0];
            var eleField = stringString.split('=')[1];
            if(eleText == "rid" && eleField != "" && !isNaN(eleField)){
                if(GetRequest(eleField)){
                    window.location = "/IDS/Pages/InitiateRequest.aspx=" + eleField;
                }
                GetRequestApprovers(eleField);
            }
            else{
                window.history.back();
            }
        }
        else{
            window.history.back();
        }
    }
    else{
        window.history.back();
    }
});

function GetRequest(rid){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items(" + rid + ")?$select=ReferenceNumber,Status",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            $('span.color_red').text(data.d.ReferenceNumber);
            if(data.d.Status != "Draft"){
                return true;
            }
            return false;
        },
        error: function(data){

        }
    });
}

function GetRequestApprovers(rid){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Comments')/items?$select=CommentBy/Title,CheckIn,CheckOut&$filter=ParentIdId eq " + rid + "&$orderby=Index asc&$expand=CommentBy",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            var row = "";
            var docURL = GetMainDocument(rid);
            if(result.length > 0){

                $.each(result, function(index, value){
                    var link = "";
                    if(index == (result.length - 1) && docURL != ""){
                        link = '<a class="click_to_see_more" href="' + docURL + '" target="_blank">Click Here</a>';
                    }
                    var checkInDate = value.CheckIn ? new Date(value.CheckIn).format('dd-MM-yyyy') : "";
                    var checkOutDate = value.CheckOut ? new Date(value.CheckOut).format('dd-MM-yyyy') : "";                    
                    row += '<tr><td>Mr. ' + value.CommentBy.Title + '</td><td>' + checkInDate + '</td><td>' + checkOutDate + '</td><td>' + ActionDelay(value.CheckIn, value.CheckOut) + '</td><td>' + link + '</td></tr>';
                });
            }
            else{
                GetInitiator(rid);
                //row += '<tr><td>Mr. ' + value.CommentBy.Title + '</td><td>' + checkInDate + '</td><td>' + checkOutDate + '</td><td>' + ActionDelay(value.CheckIn, value.CheckOut) + '</td><td>' + link + '</td></tr>';
            }
            $('#request_view tbody').append(row);
        },
        error: function(data){

        }
    });
}



function ActionDelay(sdate, edate){
    if(sdate && edate){
        var start= new Date(sdate);
        var end= new Date(edate);
        return Math.round((end- start) / (1000 * 60 * 60 * 24)) + " Days";
    }
    return "";
}

function GetMainDocument(rid){
    var fileURL = "";
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestDocuments')/items?$select=File/Name,File/LinkingUrl,File/ServerRelativeUrl&$expand=File&$filter=ParentIdId eq " + rid,
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                $.each(result, function(index, value){
                    if(value.File.ServerRelativeUrl .indexOf("MainDocument") != -1){
                        fileURL =value.File.ServerRelativeUrl;
                    }
                });
            }
        },
        error: function(data){

        }
    });
    return fileURL;
}


function GetInitiator(rid){
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestApprover')/items?$top=1&$select=Approver/Title,CheckIn,CheckOut&$filter=RequesIdId eq " + rid + "&$orderby=Index asc&$expand=Approver",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            var row = "";
            var docURL = GetMainDocument(rid);
            if(result.length > 0){
                $.each(result, function(index, value){
                    var link = "";
                    if(index == (result.length - 1) && docURL != ""){
                        link = '<a class="click_to_see_more" href="' + docURL + '" target="_blank">Click Here</a>';
                    }
                    var checkInDate = value.CheckIn ? new Date(value.CheckIn).format('dd-MM-yyyy') : "";
                    var checkOutDate = value.CheckOut ? new Date(value.CheckOut).format('dd-MM-yyyy') : "";
                    row += '<tr><td>Mr. ' + value.Approver.Title + '</td><td>' + checkInDate + '</td><td>' + checkOutDate + '</td><td>' + ActionDelay(value.CheckIn, value.CheckOut) + '</td><td>' + link + '</td></tr>';
                });
            }
            else{
                row = '<td colspan="5">No Approver found.</td></tr>';
            }
            $('#request_view tbody').append(row);
        },
        error: function(data){

        }
    });
}


