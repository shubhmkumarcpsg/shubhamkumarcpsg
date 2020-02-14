var site = _spPageContextInfo.webAbsoluteUrl;
var currentUser = _spPageContextInfo.userId;
var refNumber = "";
var RequestID ="";
var currentCount = 0;
var TotalApproversCount = 0;
var LastModifiedDate = "";
var MaxIndex = 0;
var LastCheckInTime = "";
var IsDelegateUser = false;
// var Delegate="Review Completed";

$(document).ready(function(){
    debugger;
    var queryStr = document.location.search;
    if(queryStr.indexOf('?') != -1){
        var stringString = queryStr.split('?')[1];
        if(stringString.indexOf('=') != -1){
            var eleText = stringString.split('=')[0];
            var eleField = stringString.split('=')[1];
            if(eleText == "rid" && eleField != "" && !isNaN(eleField)){
                RequestID = eleField;
                CheckIsDelegateUser();

                GetApprovesComments(eleField);
                  if(currentCount == 1){
                    $('#approverStatus option[value="Return"]').remove();
                }
      
            }
            else{
                window.location = "/sites/IDS/SitePages/PendingApprovals.aspx";
            }
        }else{
            window.location = "/sites/IDS/SitePages/PendingApprovals.aspx";
        }
    }
    

$('button.site_btn').click(function(){
 //  if(ValidateRequest()){ 

    debugger;
     if(currentCount == 1)
        {
            GetRequestModifiedDate();
        }
        else
        {
            GetCommentsMaxIndex();
        }

       
        var approvalStatus = $('#approverStatus').val();            
        var data = {
            __metadata: { type: "SP.Data.RequestListItem" },
        }
        if(currentCount != TotalApproversCount){
            if(approvalStatus == "Approved"){
                data.CurrentApprover = currentCount + 1
                data.AssignToId = reqApprover[currentCount].ApproverID;
                data.Status = "WorkIn-Progress";
            }
            else if(approvalStatus == "Return"){
                    data.AssignToId = parseInt($('#ddlDelegateUsers').val());
                    data.Status = "Return";
                    getIndex();
                    data.CurrentApprover= currentCount;
                    //data.CurrentApprover= currentCount-1;
                    data.IsDelegated = 0;
            }
            else if(approvalStatus == "Delegate"){
                 AssignToDelegateUser(eleField);
                    data.AssignToId = parseInt($('#ddlDelegateUsers').val());
                    data.DelegateStatus = "WorkIn-Progress";
                    data.IsDelegated = 1;
                    data.IsShowDelegatedBtn = 1;
                  
            }
            else if(approvalStatus == "Rejected"){
                    data.Status = "Rejected";
                    data.IsDelegated = 0;                  
            }
        }
        else{
            if($('#approverStatus').val() == "Approved"){
                data.Status = "Completed";
            }
            else if(approvalStatus == "Return"){
                data.AssignToId = parseInt($('#ddlDelegateUsers').val());
                data.Status = "Return";
                getIndex();
                data.CurrentApprover= currentCount;
                //data.CurrentApprover= currentCount-1;
                data.IsDelegated = 0;
            }
            else if(approvalStatus == "Delegate"){
                 AssignToDelegateUser(eleField);
                data.AssignToId = parseInt($('#ddlDelegateUsers').val());
                data.DelegateStatus = "WorkIn-Progress";
                data.IsDelegated = 1;
           
                 data.IsShowDelegatedBtn = 1;
                  
            }
            else if(approvalStatus == "Rejected"){
                    data.Status = "Rejected";
                    data.IsDelegated = 0;              
            }
        }

        UpdateRequest(eleField, data);
        AddComment();
        alert("Request has been updated successfully");
        window.location = "/sites/IDS";
        window.location = "/sites/IDS";
  // }
    });

});  

function getIndex()
{
    var SlectedReturnUser = parseInt($('#ddlDelegateUsers').val());
    $.ajax({        
        url: site + "/_api/web/lists/getbytitle('RequestApprover')/items?$filter=(RequesIdId eq "+RequestID+") and (ApproverId eq "+SlectedReturnUser+")",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    currentCount = value.Index
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}


function GetApprover(parentId){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Comments')/items?$select=ID,Status,Approver/ID,Approver/Title&$expand=Approver&$filter=RequesIdId eq " + parentId + "&$orderby=Index asc",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                $.each(result, function(index, value){
                    var approver = {};
                    approver.ID = value.ID;
                    approver.ApproverID = value.Approver.ID;
                    approver.ApproverName = value.Approver.Title;
                    reqApprover.push(approver);
                    
                     approver.stat=value.Status
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function GetCommentsMaxIndex()
{
    $.ajax({        
        url: site + "/_api/web/lists/getbytitle('Comments')/items?$filter=ParentIdId eq "+RequestID+"&$top=1&$orderby=Index desc",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                        MaxIndex = value.Index
                        if(currentCount > 1)
                        {
                        LastModifiedDate = new Date(value.CheckIn).format('MM/dd/yyyy');                        
                        }
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

 function AddComment(){
     var appComment = $('#approverStatus').val()
     if(IsDelegateUser){
         appComment = "Review Completed.";
     }
     GetCommentsMaxIndex();
      if(MaxIndex >= 0)
        MaxIndex = MaxIndex + 1;
         CheckIn=LastModifiedDate;

    $.ajax({
        url: site + "/_api/lists/getbytitle('Comments')/items",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val()
        },
        data: JSON.stringify({
            __metadata: { type: "SP.Data.CommentsListItem" },
            Index:MaxIndex,
            CommentById: parseInt(currentUser),
            ParentIdId: parseInt(RequestID),
            Comments:$("#approverComment").val().trim(),
            Status:appComment,
            CheckIn: CheckIn,
            // CheckOut: new Date().format('MM/dd/yyyy')
            // CheckIn: new Date().format('MM/dd/yyyy'),
            CheckOut:  LastModifiedDate
        }),
        async: false,
        success: function(data){
            console.log(data);
        },
        error: function(data){
            console.log(data);
        }
    })
 }

// $('.btn_delegate_complete').click(function(){
// if(RequestID != "")
// {
//     GetDelegateID();
//     var dataApp = {
//             __metadata: { type: "SP.Data.Delegate_x0020_RequestsListItem" },            
//             Comment:$('#approverComment').val(),
//             Status:"Complete",
//             CheckOut:new Date().format('MM/dd/yyyy')
//         };

//     $.ajax({
//         url: site + "/_api/web/lists/getbytitle('DelegateRequests')/items("+DeligateItemId+")",
//         method: "POST",
//         headers: {
//             "Accept": "application/json;odata=verbose",
//             "Content-Type": "application/json;odata=verbose",
//             "X-RequestDigest": $('#__REQUESTDIGEST').val(),
//             "If-Match": "*",
//             "X-Http-Method": "MERGE"
//         },
//         data: JSON.stringify(dataApp),
//         async: true,
//         success: function(data){
//             console.log(data);
//         },
//         error: function(data){
//             console.log(data);
//         }
//     });

//     var Reqdata = {
//             __metadata: {type: "SP.Data.RequestListItem"},            
//             Status:"Complete"         
//         };

//     $.ajax({
//         url: site + "/_api/lists/getbytitle('Request')/items(" + RequestID + ")",
//         method: "POST",
//         headers: {
//             "Accept": "application/json;odata=verbose",
//             "Content-Type": "application/json;odata=verbose",
//             "X-RequestDigest": $('#__REQUESTDIGEST').val(),
//             "If-Match": "*",
//             "X-Http-Method": "MERGE"
//         },
//         data: JSON.stringify(Reqdata),
//         async: true,
//         success: function(data){
//             alert('Req Data updated');
//         },
//         error: function(data){
//             console.log(data);
//         }
//     });
// }
// });


function CheckStatus(){
    var status = $('#approverStatus').val();
    if(status == "Delegate"){
        $('#ddlDelegateUsers option').remove();
        $('#ddlDelegateUsers').removeAttr('disabled');
        FillDelegateUsers("ddlDelegateUsers");
   //  $("#approverStatus option[value=" + Rejected + "]").hide();
    }
    else if(status == "Return"){
        $('#ddlDelegateUsers option').remove();
        $('#ddlDelegateUsers').removeAttr('disabled');
        $('#ddlDelegateUsers').append("<option value='Select'>Select User</option>");
        $.each(reqApprover, function(index, value){
            if(value.ApproverID == currentUser){
                return false;
            }
            $('#ddlDelegateUsers').append('<option value="' + value.ApproverID + '">' +  value.ApproverName + '</option>');
        });
    }
    else{
        $('#ddlDelegateUsers').attr('disabled', '');
        $('#ddlDelegateUsers option').remove();
    }
}

function AssignToDelegateUser(rid){
        var dataApp = {
            __metadata: { type: "SP.Data.Delegate_x0020_RequestsListItem" },
            DelegateToId: parseInt($('#ddlDelegateUsers').val()),
            DelegateById: parseInt(currentUser),
            ParentIdId: parseInt(RequestID),
            Comment:$("#approverComment").val().trim(),
            Status:"Work-InProgress",
            CheckIn:new Date().format('MM/dd/yyyy')
        };
        $.ajax({
            url: site + "/_api/lists/getbytitle('DelegateRequests')/items",
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $('#__REQUESTDIGEST').val()
            },
            data: JSON.stringify(dataApp),
            async: false,
            success: function(data){
                alert('Work has been delegated.')
            },
            error: function(data){
                console.log(data);
            }
        });
}

var DeligateItemId = "";
var StrDelegateAssigedBy = "";
$('.btn_delegate_complete').click(function(){
if(RequestID != "")
{
    GetDelegateID();
    var dataApp = {
            __metadata: { type: "SP.Data.Delegate_x0020_RequestsListItem" },            
            Comment:$('#approverComment').val(),
            Status:"Complete",
            CheckOut:new Date().format('MM/dd/yyyy')
        };

    $.ajax({
        url: site + "/_api/web/lists/getbytitle('DelegateRequests')/items("+DeligateItemId+")",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val(),
            "If-Match": "*",
            "X-Http-Method": "MERGE"
        },
        data: JSON.stringify(dataApp),
        async: true,
        success: function(data){
            console.log(data);
        },
        error: function(data){
            console.log(data);
        }
    });

    var Reqdata = {
            __metadata: {type: "SP.Data.RequestListItem"},            
            DelegateStatus:"Complete",
            AssignToId: StrDelegateAssigedBy,
            IsShowDelegatedBtn: 0,
          
             
        };

    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items(" + RequestID + ")",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val(),
            "If-Match": "*",
            "X-Http-Method": "MERGE"
        },
        data: JSON.stringify(Reqdata),
        async: true,
        success: function(data){
            alert('Req Data updated');
        },
        error: function(data){
            console.log(data);
        }
    });
}
});

function GetDelegateID()
{
    var ID = "";
    $.ajax({
        url: site + "/_api/web/lists/getbytitle('DelegateRequests')/items?$filter=(ParentId eq "+RequestID+") and (DelegateToId eq "+currentUser+")",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    DeligateItemId = value.ID;
                    StrDelegateAssigedBy = value.DelegateById;       
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function SaveRequest(option){
    var status = "";
    if(option == "Submit"){
        status = "Work In-Progress";
    }else if(option == "Save"){
        status = "Draft";
    }else{
        return false;
    }    
}

// $("#approverStatus").change(function() {
//     if($('option:selected', this).val() == "Delegate")
//         FillDelegateUsers();
        
//     });

function FillDelegateUsers() {
$.ajax({
        url: site + "/_api/web/sitegroups/getbyname('DelegateApprovalUser')/users?$select=Id,Title",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                  //  if(value.ApproverId!= currentUser)
                    option += "<option value='" +  value.Id + "'>" + value.Title  + "</option>";
                });
                $('#ddlDelegateUsers').append(option);
                 $('[id^="ddlDelegateUsers"]').select2();
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

var reqApprover = [];
var etag = "";

function GetApprovesComments(rid){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items(" + parseInt(rid) + ")?$select=ReferenceNumber,CurrentApprover,TotalApprover,AssignToId",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            etag = data.d.__metadata.etag;
            if(data.d.AssignToId == currentUser){
                $('.color_red').append(data.d.ReferenceNumber);
                refNumber = data.d.ReferenceNumber;
                $('.commenters').prepend('<h4>Comments Till Now on Ref: ' + data.d.ReferenceNumber + '</h4>');
                $('.final_action').prepend('<h4>Final Action on Ref : ' + data.d.ReferenceNumber + '</h4>');
                currentCount = data.d.CurrentApprover;                
                GetAllComments();
                GetApprover(rid);
                //var appBind = "";
                //for(i=1; i< currentCount; i++){
                    //appBind += '<li><div class="commnter_box"><p><span class="comment_no">#' + i + '</span>'+ reqApprover[i-1].comm + '</p><span class="auther_by">By : Mr. ' + reqApprover[i-1].ApproverName + '</span></div></li>';
                //}
                //$('.commenters').find('ul').append(appBind);

                GetDocument(rid);
                TotalApproversCount = data.d.TotalApprover;
            }
            else{
                window.location = "/sites/IDS/Pages/ViewRequestDetails.aspx?rid="+RequestID;
                //window.location = "/sites/IDS";
            }
        },
        error: function(data){

        }
    });
}

function GetAllComments()
{
    $.ajax({
        url: site + "/_api/lists/getbytitle('Comments')/items?$select=ID,Index,Status,Comments,CommentBy/ID,CommentBy/Title&$expand=CommentBy&$filter=ParentIdId eq "+RequestID+"&$orderby=Index asc",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                var StrBindComment = "";                
                    StrBindComment += '<li><div class="commnter_box"><p><span class="comment_no">#' +value.Index+ '</span>'+ value.Comments + '</p><span class="auther_by">By : Mr. ' + value.CommentBy.Title + '</span><span class="auther_by">Status : '+ value.Status +' </span></div></li>';
                $('.commenters').find('ul').append(StrBindComment);
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function GetApprover(parentId){
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestApprover')/items?$select=ID,Comments,Approver/ID,Approver/Title&$expand=Approver&$filter=RequesIdId eq " + parentId + "&$orderby=Index asc",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                $.each(result, function(index, value){
                    var approver = {};
                    approver.ID = value.ID;
                    approver.ApproverID = value.Approver.ID;
                    approver.ApproverName = value.Approver.Title;
                    reqApprover.push(approver);
                     approver.comm=value.Comments;
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}



function GetDocument(parentId){
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestDocuments')/items?$select=File/Name,File/LinkingUrl,File/ServerRelativeUrl&$expand=File&$filter=ParentIdId eq " + parentId,
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var mainDoc = "";
                var refDoc = '<h4>Reference Documents Submitted Till Now on Ref: ' + refNumber + '</h4><div class="row">';
                $.each(result, function(index, value){
                    if(value.File.ServerRelativeUrl.indexOf('MainDocument') != -1){
                        mainDoc = '<h4>Main Document</h4><div class="doc_bx"><div class="doc_icon"><img src="/sites/IDS/SiteAssets/assets/images/pdf_icon.png?ctag=190824" alt=""></div><div class="docs_desc"><p>' + value.File.Name + '</p><a class="check_in" href="' + value.File.LinkingUrl + '" target="_blank">CheckIn</a></div></div>';
                    }
                    else{
                        refDoc += '<div class="col-sm-4"><div class="doc_bx"><div class="doc_icon"><img src="/sites/IDS/SiteAssets/assets/images/pdf_icon.png?ctag=190824" alt=""></div><div class="docs_desc"><p>' + value.File.Name + '</p><a class="click_to_view" href="' + value.File.ServerRelativeUrl  + '">Download</a></div></div></div>'
                    }
                });
                $('.main_docs_box').append(mainDoc);
                $('.ref_docs_box').append(refDoc + "</div>");
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function UpdateRequest(rid, data){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items(" + rid + ")",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val(),
            "If-Match": etag,
            "X-Http-Method": "MERGE"
        },
        data: JSON.stringify(data),
        async: false,
        success: function(data){
            var dataFirst = {
                __metadata: { type: "SP.Data.RequestApproverListItem" },
                Status: $('#approverStatus').val(),
                Comments: $('#approverComment').val(),
                CheckOut: new Date().format('MM/dd/yyyy')
            }
            UpdateRequestApprover(reqApprover[currentCount-1].ID, dataFirst);
            if(currentCount != TotalApproversCount){
                if($('#approverStatus').val() == "Approved"){
                    var dataSecond = {
                        __metadata: { type: "SP.Data.RequestApproverListItem" },
                        CheckIn: new Date().format('MM/dd/yyyy')
                    }
                    UpdateRequestApprover(reqApprover[currentCount].ID, dataSecond);
                }
            }
         },
        error: function(data){

        }
    });
}
function UpdateRequestApprover(appId, data){
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestApprover')/items(" + parseInt(appId) + ")",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val(),
            "If-Match": "*",
            "X-Http-Method": "MERGE"
        },
        data: JSON.stringify(data),
        async: false,
        success: function(data){

        },
        error: function(data){

        }
    });
}


function GetRequestModifiedDate()
{
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items?&$filter=ID eq "+RequestID+"",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    LastModifiedDate = new Date(value.Modified).format('MM/dd/yyyy');
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function CheckIsDelegateUser()
{
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items?&$filter=ID eq "+RequestID+"",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose"},
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    var IsDelegated = value.IsShowDelegatedBtn;
                    if(IsDelegated == 1)
                    {
                        IsDelegateUser = true;
                        $('.div_Approval').css('display','none');
                        $('.div_complete').css('display','block'); 
                            //Status: $('#approverStatus').val();
                                // if($('#approverStatus').val() == "Approved"){
                                //     ($('#approverStatus') == 'Riview Completed')

                                // }
                         

                        }
                    else
                    {
                        $('.div_complete').css('display','none');
                        $('.div_Approval').css('display','flex');
                        }
                });
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}


function ValidateRequest(){
        if($('#approverComment').val() == ""){
            alert("Please Give Comment.");
            $('#approverComment').focus();
                  return false;
        }
    return true;
}

function GetInitiator(rid){
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