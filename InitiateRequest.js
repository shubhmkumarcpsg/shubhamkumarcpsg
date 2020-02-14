var RootURl = window.location.origin;
var arraycount = 0;
var fileUploadeCount = 0;
var site = _spPageContextInfo.webAbsoluteUrl;
var currentUser = _spPageContextInfo.userId;
var count = 1;
var usercount = 0;
var referenceDoc = 1;
var RequestId = 0;
var RequesterItemId = 0;
var IsValid = false;
var AttachCount = 1;

var refDepartment = "";
var refLocation = "";
var refSubGroup = "";
var refFileType = "";
var refFinancialYear = "";

$(document).ready(function () {
    GetDropdown('Department', 'ddlDepartment');
    GetDropdown('SubGroup', 'ddlSubGroup');
    GetDropdown('FileType', 'ddlFileType');
    FinancialYear();

    $('#ddlDepartment').on('change', function () {
        var category = $(this).val();
        if (category != "Select") {
            $('#ddlLocation').removeAttr('disabled');
            refDepartment = GetRefDetails("Department", parseInt(category));
            GetLoction(category);
        }
        else {
            $('#ddlLocation').val("Select");
            $('#ddlLocation').attr('disabled', 'disabled');
        }
    });

    $('#ddlDepartment, #ddlLocation, #ddlSubGroup, #ddlFileType, #ddlFinancialYear').select2();
    //  $('#ddlDepartment, #ddlLocation,#ddlFileType').select2();
    $('#ddlLocation, #ddlSubGroup, #ddlFileType, #ddlFinancialYear').on('change', function(){
        var option = $(this).val();
        if(option != "Select"){
            var ddlId = $(this).attr('id');
            if(ddlId == "ddlLocation"){
                refLocation = GetRefDetails("Location", parseInt(option));
            }
            else if(ddlId == "ddlSubGroup"){
                refSubGroup = GetRefDetails("SubGroup", parseInt(option));
            }
            else if(ddlId == "ddlFileType"){
                refFileType = GetRefDetails("FileType", parseInt(option));
            }
            else if(ddlId == "ddlFinancialYear"){
                var sYear = option.split('-')[1]; 
                refFinancialYear = option.split('-')[0] + "" + sYear.substring(2);
            }
        }
    });

    BindApprover();

    $('#AddApprovers').click(function () {
        approverList = [];
        $('.approvers_list').show();
        var PageIsEditMode = 'false';
        AddApprover(PageIsEditMode);
        GetApprover();
        $('[id^="ddlApprover"]').select2();
    });

    var searchURL = document.location.search;
    if (searchURL != "") {

    }

    $("#Btn_AddMoreDocument").click(function () {
        $(".Referencediv").append("Reference Document  <input id='ReferenceUploadFile' type='file' size='98'/> <br/> <br/>");
    });

    $(document).on("click", "a.remove", function () {
        $(this).parent().remove();
    });

    $(document).on('change', '[id^="ddlApprover"]', function () {
        var acount = parseInt($(this).attr('id').replace('ddlApprover', ''));
        var selectedValue = $(this).val();
        if (selectedValue != "Select") {
            if (usercount != acount) {
                $('#ddlApprover' + (acount + 1)).removeAttr('disabled');
                ResetApprover(acount + 1);
                var option = "";

                $("#ddlApprover" + acount + " option").each(function () {
                    if ($(this).val() != selectedValue) {
                        option += '<option value="' + $(this).val() + '">' + $(this).text() + '</option>';
                    }
                });
                $('#ddlApprover' + (acount + 1)).append(option);
            }
        }
        else {
            ResetApprover(acount);
        }
    });


   

 $(document).on('click', '.upload_file_label.append_btn', function(){
        $('.add_more_docs').remove();
        $('.chck_docs:last').find('.col-sm-6').append('.<div class="remove_file"><button class="remove_file_btn" onclick="RemoveReferenceDoc(' + referenceDoc + ')" type="button">Remove the Uploaded File</button></div>');
        referenceDoc++;
        $('.append_docs_row').append('<div class="form-group row chck_docs"><label class="col-sm-2 col-form-label">Upload the Document</label><div class="col-sm-4"><input class="form-control" type="text" name="Reference" readonly="" data-target="uploadReferenceDoc' + referenceDoc + '"></div><div class="col-sm-6"><div class="upload_file"><input class="btn site_btn" type="file" id="uploadReferenceDoc' + referenceDoc + '"><label class="upload_file_label" for="uploadReferenceDoc' + referenceDoc + '">Choose file to Upload</label></div><div class="upload_file add_more_docs"><button class="upload_file_label append_btn" type="button">Add More Document</button></div></div></div>');
        AttachCount++;
    });

    // $(document).on('change', 'input[type="file"]', function(){
         $('#uploadMainDoc').on('change', function()
         
         {
        var file = $(this)[0].files[0];
        var fileId = $(this).attr('id');
        var filename = file.name;
        var ext = file.name.split('.')[1];
        if(ext == "doc" || ext == "docx" ){
            var getFileBuffer = function (file) {
                var deferred = $.Deferred();
                var reader = new FileReader();
                reader.onload = function (e) {
                    var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                    var header = "";
                    for (var i = 0; i < arr.length; i++) {
                        header += arr[i].toString(16);
                    }
                    if (header != "d0cf11e0" && header != "504b34" ) {
                        alert("Please upload files in DOC/DOCX format only");
                        $('#' + fileId).val("");
                        $('[data-target="' + fileId + '"]').val('');
                        $('#' + fileId).focus();
                        return;
                    }
                    deferred.resolve(e.target.result);
                }
                reader.onerror = function (e) {
                    deferred.reject(e.target.error);
                }
                reader.readAsArrayBuffer(file);
                return deferred.promise();
            };

            getFileBuffer(file).then(function (buffer) {
                $('[data-target="' + fileId + '"]').val(filename);
            });
        }
        else{
            $('#' + fileId).val('');
            $('[data-target="' + fileId + '"]').val('');
            alert("Please upload correct file.");
        }
    });

   
    var queryStr = document.location.search;
    if (queryStr.indexOf('?') != -1) {
        var stringString = queryStr.split('?')[1];
        if (stringString.indexOf('=') != -1) {
            var eleText = stringString.split('=')[0];
            var eleField = stringString.split('=')[1];
            if (eleText == "rid" && eleField != "" && !isNaN(eleField)) {
                RequestId = eleField;
                GetRequest(eleField);
            }
        }
    }
});

function GetRefDetails(listname, refid){
    var refTitle = "";
    try{
        $.ajax({
            url: site + "/_api/lists/getbytitle('" + listname + "')/items(" + refid + ")?$select=Reference",
            method: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            async: false,
            success: function(data){
                refTitle = data.d.Reference;
            },
            error: function(data){
                console.log(data);
            }
        });
    }
    catch(e){
        console.log(e);
    }
    return refTitle;
}

function RemoveReferenceDoc(refdocId) {
    $('.chck_docs:eq(' + refdocId + ')').remove();
    AttachCount--;
}

function GetRequest(rid) {
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items(" + rid + ")?$select=DepartmentId,LocationId,SubGroupId,FileTypeId,FinancialYear,Subject,Description,Amount,TotalApprover",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            $('#ddlDepartment').val(data.d.DepartmentId).select2();
            $('#ddlDepartment').change().select2();
            $('#ddlLocation').val(data.d.LocationId).select2();
            $('#ddlSubGroup').val(data.d.SubGroupId).select2();
            $('#ddlFileType').val(data.d.FileTypeId).select2();
            $('#ddlFinancialYear').val(data.d.FinancialYear).select2();
            $('#txtSubject').val(data.d.Subject);
            $('#txtDescription').val(data.d.Description);
            $('#txtAmount').val(data.d.Amount);
            $('#showApprovers').val(data.d.TotalApprover);
            $('#AddApprovers').click();

            GetDraftedApprovers(rid);
            GetDraftedMainDocument(rid);
            GetDraftedReferenceDocuments(rid);
            //$('#ddlApprover').change();
            //$('[id^="uploadReferenceDoc"]').val();
            //$('#uploadMainDoc').val();
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function GetDraftedApprovers(rid) {

    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestApprover')/items?$select=Approver/ID,Approver/Title&$expand=Approver/ID&$Filter=RequesId eq " + rid + " &$orderby= Index asc",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: true,
        success: function (data) {
            //console.log(data.d.results[1].Approver.ID);
            var Approvers = data.d.results;
            $('.approvers_list').css('display', 'block');

            if (Approvers.length > 0) {
                var TotalApprovers = Approvers.length;
                var PageIsEditMode = 'true';
                AddApprover(PageIsEditMode);
                GetApproverListForDDL(TotalApprovers);

                var count = 0;
                for (var i = 0; i < Approvers.length; i++) {
                    for (var j = 0; j < TotalApprovers; j++) {
                        count++;
                        $('#ddlApprover' + count).val(Approvers[i].Approver.ID);
                        break;
                    }
                }
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function GetDraftedMainDocument(rid) {
    var count = 0;
    var IsDocExist = false;
    $('#ref_links_MainDoc').empty();
    $.ajax({
        url: site + "/_api/web/GetFolderByServerRelativeUrl('/sites/IDS/RequestDocuments/MainDocument')?$expand=Files,Files/ListItemAllFields",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: true,
        success: function (data) {
            var result = data.d.Files.results;
            if (result.length > 0) {
                //$('.main_doc').css('display','none');
                var str_MainDoc = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ListItemAllFields.ParentIdId == rid) {
                        IsDocExist = true;
                        str_MainDoc += "<a href='" + RootURl + result[i].ServerRelativeUrl + "'>" + result[i].Name + "</a> <button class='btn remove_btn_MainDoc' id='remove_btn_MainDoc' type='button' data-name='" + result[i].Name + "' onclick='RemoveMainDoc(this.id);'>Remove Document</button>";
                    }
                }
                $('#ref_links_MainDoc').append(str_MainDoc);
            }

            if (IsDocExist == true)
                $('.main_doc').css('display', 'none');
            else
                $('.main_doc').removeAttr('style');
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function GetDraftedReferenceDocuments(rid) {
    var count = 0;
    var IsDocExist = false;
    $('#ref_links_RefDoc').empty();
    $.ajax({
        url: site + "/_api/web/GetFolderByServerRelativeUrl('/sites/IDS/RequestDocuments/ReferenceDocuments')?$expand=Files,Files/ListItemAllFields",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: true,
        success: function (data) {
            var result = data.d.Files.results;
            if (result.length > 0) {
                //$('.ref_doc').css('display','none');
                var count = 0;
                var str_RefDoc = "";
                for (var i = 0; i < result.length; i++) {
                    if (result[i].ListItemAllFields.ParentIdId == rid) {
                        count++;
                        IsDocExist = true;
                        str_RefDoc += "<div class='ref_links'><a href='" + RootURl + result[i].ServerRelativeUrl + "'>" + result[i].Name + "</a> <button class='btn remove_btn_RefDoc' id='remove_btn_RefDoc" + count + "' type='button' data-name='" + result[i].Name + "' onclick='RemoveRefDoc(this.id);'>Remove Document</button></div>";
                    }
                }
                $('#ref_links_RefDoc').append(str_RefDoc);
            }

            // if(IsDocExist == true)
            //     $('.ref_doc').css('display','none');
            // else
            //     $('.ref_doc').removeAttr('style');
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function RemoveMainDoc(BtnId) {
    var FileName = $('#' + BtnId).data('name');
    $.ajax({
        url: site + "/_api/web/GetFolderByServerRelativeUrl('/sites/IDS/RequestDocuments/MainDocument/" + FileName + "')",
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "DELETE",
            "IF-MATCH": "*"
        },
        success: onMainQuerySucceeded,
        error: onMainDocQueryFailed
    });
}

function onMainQuerySucceeded() {
    GetDraftedMainDocument(RequestId);
}

function onMainDocQueryFailed(sender, args) {
    console.log(sender);
}

function RemoveRefDoc(BtnId) {
    var FileName = $('#' + BtnId).data('name');
    $.ajax({
        url: site + "/_api/web/GetFolderByServerRelativeUrl('/sites/IDS/RequestDocuments/ReferenceDocuments/" + FileName + "')",
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "DELETE",
            "IF-MATCH": "*"
        },
        success: onRefDocQuerySucceeded,
        error: onRefDocQueryFailed
    });
}

function onRefDocQuerySucceeded() {
    GetDraftedReferenceDocuments(RequestId);
}

function onRefDocQueryFailed(sender, args) {
    alert('Something went wrong! Please contact to administrator.');
}

function GetApproverListForDDL(TotalApprovers) {
    $.ajax({
        url: site + "/_api/lists/getbytitle('Approvers')/items?$select=Approver/ID,Approver/Title&$expand=Approver",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var result = data.d.results;
            if (result.length > 0) {
                var option = "";
                $.each(result, function (index, value) {
                    option += "<option value='" + value.Approver.ID + "'>" + value.Approver.Title + "</option>";
                });

                var count = 0;
                for (var i = 0; i < TotalApprovers; i++) {
                    count++;
                    $('#ddlApprover' + count).append(option);
                }
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function SaveRequest(option) {
    if (ValidateRequest()) {
        var status = "";
        var rupee="";
                 if($('#txtAmount').val()== ""){

                           rupee="0";
                 }
                 else{
                         rupee=($("#txtAmount").val());
                 }
        if (option == "Save")
            status = "Draft";

        if (option == "Submit")
            status = "WorkIn-Progress";

        if ((option == "Save" || option == "Submit") && RequestId == 0) {//New Request raised and draft case
            $.ajax({
                url: site + "/_api/lists/getbytitle('Request')/items",
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $('#__REQUESTDIGEST').val()
                },
                data: JSON.stringify({
                    __metadata: {
                        type: "SP.Data.RequestListItem"
                    },
                    DepartmentId: parseInt($("#ddlDepartment").val()),
                    LocationId: parseInt($("#ddlLocation").val()),
                    SubGroupId: parseInt($("#ddlSubGroup").val()),
                    FileTypeId: parseInt($("#ddlFileType").val()),
                    FinancialYear: $("#ddlFinancialYear").val(),
                    Subject: $("#txtSubject").val().trim(),
                    Description: $("#txtDescription").val().trim(),
                  //  Amount: parseInt($("#txtAmount").val()),
                    Amount: rupee,
                    RaisedById: _spPageContextInfo.userId,
                    AssignToId: parseInt($('#ddlApprover1').val()),
                    CurrentApprover: 1,
                    TotalApprover: usercount,
                    Status: status,
                    IsDelegated: 0,
                   RefNumber: "BL"+'/'+refDepartment + '/' + refLocation + '/' + refSubGroup + '/' + refFileType + '/' + refFinancialYear + '/00',
                    RequestInitiateTime: new Date().format('MM/dd/yyyy')
                }),
                async: false,
                success: function (data) {
                    var itemId = data.d.Id;
                    AddApproverList(itemId);
                    saveAttachment(itemId);
                },

                error: function (data) {
                    console.log(data);
                }
            });
        }
    }



    if (option == "Save" || option == "Submit" && RequestId > 0) {//Edit drafted request case
        if (ValidateRequest()) {
            var DataForUpdate = {
                __metadata: { type: "SP.Data.RequestListItem" },
                DepartmentId: parseInt($("#ddlDepartment").val()),
                LocationId: parseInt($("#ddlLocation").val()),
                SubGroupId: parseInt($("#ddlSubGroup").val()),
                FileTypeId: parseInt($("#ddlFileType").val()),
                FinancialYear: $("#ddlFinancialYear").val(),
                Subject: $("#txtSubject").val().trim(),
                Description: $("#txtDescription").val().trim(),
              //  Amount: parseInt($("#txtAmount").val()),
              Amount: rupee,
                RaisedById: _spPageContextInfo.userId,
                AssignToId: parseInt($('#ddlApprover1').val()),
                TotalApprover: usercount,
                Status: status,
                IsDelegated: 0,

            }

            $.ajax({
                url: site + "/_api/lists/getbytitle('Request')/items(" + RequestId + ")",
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $('#__REQUESTDIGEST').val(),
                    "If-Match": "*",
                    "X-Http-Method": "MERGE"
                },
                data: JSON.stringify(DataForUpdate),
                async: true,
                success: function (data) {
                    //Delete drafted Approvers.
                    DeleteDraftedApprovers();
                    //Adding new Approvers.
                    AddApproverList(RequestId);
                    //Save Docs
                    saveAttachment(RequestId);
                },
                error: function (data) {
                    console.log(data);
                }
            });
        }
    }
}

var ApproversID = "";
function DeleteDraftedApprovers() {
    GetDraftedApproversId();
    if (ApproversID != "") {
        var SplitApproversID = ApproversID.split(',');
        for (var i = 0; i < SplitApproversID.length; i++) {
            if (SplitApproversID[i] != "") {
                $.ajax({
                    url: site + "/_api/lists/getbytitle('RequestApprover')/items(" + SplitApproversID[i] + ")",
                    type: "POST",
                    headers: {
                        "accept": "application/json;odata=verbose",
                        "content-type": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                        "X-HTTP-Method": "DELETE",
                        "IF-MATCH": "*"
                    },
                    async: true,
                    success: function (data) {
                    },
                    eror: function (data) {
                        console.log(data);
                    }
                });
            }
        }
    }
}

function GetDraftedApproversId() {
    $.ajax({
        url: site + "/_api/lists/getbytitle('RequestApprover')/items?$select=ID,Comments,Approver/ID,Approver/Title&$expand=Approver&$filter=RequesIdId eq " + RequestId + "",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var result = data.d.results;
            if (result.length > 0) {
                var option = "";
                $.each(result, function (index, value) {
                    ApproversID += value.ID + ",";
                });
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function AddApproverList(itemId) {

    $('[id^="ddlApprover"]').each(function (index) {
        var dataApp = {
            __metadata: { type: "SP.Data.RequestApproverListItem" },
            ApproverId: parseInt($(this).val()),
            Index: (index + 1),
            RequesIdId: itemId
        };
        if (index == 0) {
            dataApp.CheckIn = new Date().format('MM/dd/yyyy');
        }
        $.ajax({
            url: site + "/_api/lists/getbytitle('RequestApprover')/items",
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $('#__REQUESTDIGEST').val()
            },
            data: JSON.stringify(dataApp),
            async: false,
            success: function (data) {
            },
            error: function (data) {
                console.log(data);
            }
        });
    });
}

function ResetApprover(cuurentCount) {
    for (i = cuurentCount; i <= usercount; i++) {
        $('#ddlApprover' + i + ' option').remove();
        if (i != cuurentCount) {
            $('#ddlApprover' + i).attr('disabled', 'disabled');
        }
    }
}

function next() {
    $('#btnNext').focusout();
    if (count == 1) {
        debugger;
        if (ValidateRequest()) {
            $('#formRequest').hide();
            $('#formApprover').show();
            count++;

            $("html, body").animate({ scrollTop:10 }, "slow");
  return false;
        }
    }

    else if (count == 2) {
        if (ValidateRequest()) {
            $('#formApprover').hide();
            $('#formDocument').show();
            count++;
           
        }
    }
    //window.scrollTo(0,0);
}

function back() {
    if (count == 2) {
       
            $('#formRequest').show();
            $('#formApprover').hide();
            count--;
        
    }
    else if (count == 3) {

        $('#formApprover').show();
        $('#formDocument').hide();
        count--;
    }
    window.scrollTo(0,0);
}

function BindApprover() {
    var options = "";
    for (i = 1; i <= 10; i++) {
        options += '<option value="' + i + '">#' + i + ' Approvers</option>';
    }
    $('#showApprovers').append(options);
}

function AddApprover(PageIsEditMode) {
    $('.approvers_list').find('.col-md-5').children().remove();
    var count = $('#showApprovers').val();
    usercount = parseInt(count);
    var approverDropdown = "";
    var disableAttr = "";
    for (i = 1; i <= count; i++) {
        if (i > 1) {
            if (PageIsEditMode == 'false') {
                disableAttr = 'disabled="disabled"';
            }
        }
        approverDropdown += '<div class="form-group row approver_box"><label class="col-sm-3 col-form-label">Approvers #' + i + '</label><div class="col-sm-8"><select class="form-control" id="ddlApprover' + i + '" ' + disableAttr + '></select></div></div>';
    }
    $('.approvers_list').find('.col-md-5').append(approverDropdown);
}

function GetApprover() {
    $.ajax({
        url: site + "/_api/lists/getbytitle('Approvers')/items?$select=Approver/ID,Approver/Title&$expand=Approver",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var result = data.d.results;
            if (result.length > 0) {
                var option = "";
                option += "<option value='Select'>Select Approver</option>";
                $.each(result, function (index, value) {
                    if (value.Approver.ID != currentUser)
                        option += "<option value='" + value.Approver.ID + "'>" + value.Approver.Title + "</option>";
                });
                $('#ddlApprover1').append(option);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function ValidateRequest() {
    var IsValid = true;
    if (count == 1) {
        if ($('#ddlDepartment').val() == "Select") {
            alert("Please select Department.");
            $('#ddlDepartment').focus();
            return false;
        }
        else if ($('#ddlLocation').val() == "Select") {
            alert("Please select Location.");
            $('#ddlLocation').focus();
            return false;
        }
        else if ($('#ddlSubGroup').val() == "Select") {
            alert("Please select Sub Group.");
            $('#ddlSubGroup').focus();
            return false;
        }
        else if ($('#ddlFileType').val() == "Select") {
            alert("Please select File Type.");
            $('#ddlFileType').focus();
            return false;
        }
        else if ($('#ddlFinancialYear').val() == "Select") {
            alert("Please select Financial Year.");
            $('#ddlFinancialYear').focus();
            return false;
        }
        else if($('#txtSubject').val().trim() == ""){
            alert("Please fill Subject.");
            $('#txtSubject').val("");
            $('#txtSubject').focus();
            return false;
        }
        else if($('#txtDescription').val().trim() == ""){
            alert("Please fill Description.");
            $('#txtDescription').val("");
            $('#txtDescription').focus();
            return false;
        }

        else {
            return true;
        }
    }
    else if (count == 2) {
        if ($('#showApprovers').val() == "Select") {
            alert('Please select number of Approver.');
            $('#showApprovers').focus();
            return false;
        }
        else {
            var noOfApprover = parseInt($('#showApprovers').val());
            if (document.getElementById('ddlApprover1')) {
                for (i = 1; i <= noOfApprover; i++) {
                    if ($('#ddlApprover' + i).val() == "Select") {
                        alert("Please select Approver number " + i);
                        $('#ddlApprover' + i).focus();
                        return false;
                    }
                }
            }
            else {
                alert('Please click "Add This to Approvers List" button to fill Approver.');
                $('#AddApprovers').focus();
                return false;
            }

        }
        return true;
    }

    else if (count == 3) {
        debugger;
        if (RequestId == 0) {
            if ($("#uploadMainDoc").val() == '' || $("#uploadMainDoc").val() == 'undefined') {
                alert('Please select main file');
                $('#uploadMainDoc').focus();    
                               
                return false;
            }

            // if ($('#uploadMainDoc').val() != '' || $("#uploadMainDoc").val() != 'undefined') {
            //         $.each($('#uploadMainDoc').prop("files"), function (k, v) {
            //             var filename = v['name'];
            //             var ext = filename.split('.').pop().toLowerCase();
            //             if ($.inArray(ext, ['doc', 'docx']) == -1) {
            //                 alert('Please upload only doc, docx format files.');
            //                 $('#uploadMainDoc').focus();
            //                 IsValid = false;
            //                 return false;
            //             }
            //         });
            //     }
        }
        else if (RequestId > 0 && $('#ref_links_MainDoc').html().indexOf("remove_btn_MainDoc") == -1) {
            if ($("#uploadMainDoc").val() != "" || $("#uploadMainDoc").val() != 'undefined') 
            {
                IsValid = true;
                return true;
                }
            alert('Please select main file');
            $('#uploadMainDoc').focus();
            IsValid = false;
            return false;
        }
        else if (RequestId > 0 && $('#ref_links_MainDoc').html().indexOf("remove_btn_MainDoc") != -1) {
            if ($("#uploadMainDoc").val() == "" || $("#uploadMainDoc").val() == 'undefined') {
                IsValid = true;
                return true;
            }
        }
    }

    var FileCount = 0;
            for(i=0; i < AttachCount; i++){
                FileCount++;
                if($('#uploadReferenceDoc' + FileCount).val() != "" || $('#uploadReferenceDoc' + FileCount).val() != undefined){
                    $.each($('#uploadReferenceDoc' + FileCount).prop("files"), function (k, v) {
                var filename = v['name'];
                var ext = filename.split('.').pop().toLowerCase();
                if ($.inArray(ext, ['doc', 'docx', 'ppt', 'pptx','pdf']) == -1) {
                    alert('Please upload only doc, docx, ppt, pptx format files.');
                    $('#uploadReferenceDoc' + FileCount).focus();
                    IsValid = false;
                    //return false;
                }
            });
                }
            }

    // var IsRefDoc = $('#uploadReferenceDoc1').val();
    // if (IsRefDoc != "") {
    //     if (IsRefDoc != undefined) {
    //         $.each($('#uploadReferenceDoc1').prop("files"), function (k, v) {
    //             var filename = v['name'];
    //             var ext = filename.split('.').pop().toLowerCase();
    //             if ($.inArray(ext, ['doc', 'docx', 'ppt', 'pptx']) == -1) {
    //                 alert('Please upload only doc, docx, ppt, pptx format files.');
    //                 $('#uploadReferenceDoc1').focus();
    //                 IsValid = false;
    //                 return false;
    //             }
    //         });
    //     }
    // }
    // else{
    // 	alert('Please select Reference file');
    // 	$('#uploadReferenceDoc'+ FileCount).focus();
    // 	return false;
    // }
    //return true;

    if(IsValid == true)
    {
        return true;
    }
    else
    {
        return false;
    }
}



function FinancialYear() {
    var currentYear = new Date().getFullYear();
      
   var option = '';
    for (i = 4; i >= 0; i--) {
        option += '<option value="' + (currentYear - i) + '-' + (currentYear - i + 1) + '">' + (currentYear - i) + '-' + (currentYear - i + 1) + '</option>';
    }
    $('#ddlFinancialYear').append(option);
}

function GetLoction(department) {
    $.ajax({
        url: site + "/_api/lists/getbytitle('Location')/items?$select=ID,Title&$filter=DepartmentId eq " + parseInt(department),
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var result = data.d.results;
            if (result.length > 0) {
                var option = '<option class="dropdown-item" value="Select" aria-labelledby="dropdownMenuLink">Select Location</option>';
                $.each(result, function (index, value) {
                    option += '<option value="' + value.ID + '">' + value.Title + '</option>';
                });
                $('#ddlLocation option').remove();
                $('#ddlLocation').append(option);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}



function GetDropdown(lisname, dropdownElement) {
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('" + lisname + "')/items?select=ID,Title",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function (data) {
            var result = data.d.results;
            if (result.length > 0) {
                var option = "";
                $.each(result, function (index, value) {
                    option += '<option value="' + value.ID + '">' + value.Title + '</option>';
                });
                $('#' + dropdownElement).append(option);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function saveAttachment(itemId) {
    var IsUploadMainDoc = $('#uploadMainDoc').val();
    if (IsUploadMainDoc != "") {
        if (IsUploadMainDoc != undefined) {
            var fileMain = $("#uploadMainDoc")[0].files[0];
            uploadFiles(fileMain, "RequestDocuments", 'MainDocument', itemId);
        }
    }

    // var IsUploadRefDoc = $('#uploadReferenceDoc1').val();
    //  // var IsUploadRefDoc = $('#uploadReferenceDoc').val();
    //     if (IsUploadRefDoc != "") {
    //        if (IsUploadRefDoc != undefined) {
    //             $('[id^="uploadReferenceDoc1"]').each(function (index) {
    //                 uploadFiles($(this)[0].files[0], "RequestDocuments", 'ReferenceDocuments', itemId)
    //             });
    //         }
    //      }
debugger;
         var RefFileCount = 0;
            for(i=0; i < AttachCount; i++){
                RefFileCount++;
                if($('#uploadReferenceDoc' + RefFileCount).val() != "")
                {
                    if($('#uploadReferenceDoc' + RefFileCount).val() != undefined){
                     uploadFiles($('#uploadReferenceDoc' + RefFileCount)[0].files[0], "RequestDocuments", 'ReferenceDocuments', itemId)
                   $('[id^="uploadReferenceDoc"]' + RefFileCount).each(function (index)
                  {
                    
                   });
                }
                }
                }

        alert('Your request is submitted successfully');
        window.location = "/sites/IDS/Pages/Dashboard.aspx";
      


    function uploadFiles(uploadFileObj, documentLibrary, folderName, itemId) {
        var str = uploadFileObj.name;
        var rest = str.substring(0, str.lastIndexOf("."));
        var last = str.substring(str.lastIndexOf("."), str.length);
        //  var rest1 = Math.random(); 
        var fileName = rest + '-' + Date.parse(new Date()) + last;

        var webUrl = _spPageContextInfo.webAbsoluteUrl;
        var targetUrl = _spPageContextInfo.webServerRelativeUrl + "/" + documentLibrary + "/" + folderName;
        var url = webUrl + "/_api/Web/GetFolderByServerRelativeUrl('" + targetUrl + "')/Files/add(overwrite=true, url='" + fileName + "')?$expand=ListItemAllFields";

        //if(last != ".pdf")
        //{
        uploadFileToFolder(uploadFileObj, url, function (data) {
            var file = data.d;
            var updateObject = {
                __metadata: {
                    type: file.ListItemAllFields.__metadata.type
                },
                ParentIdId: itemId
            };

            url = webUrl + "/_api/Web/lists/getbytitle('" + documentLibrary + "')/items(" + file.ListItemAllFields.Id + ")";

            updateFileMetadata(url, updateObject, file, function (data) {
            }, function (data) {
                alert("File upload done but meta data updating FAILED");
            });
        }, function (data) {
            alert("File uploading and meta data updating FAILED");
        });
        //}
        // else
        // {
        //     uploadFileToFolderForPDF(uploadFileObj, url, function (data) {
        //     var file = data.d;
        //     var updateObject = {
        //         __metadata: {
        //             type: file.ListItemAllFields.__metadata.type
        //         },
        //         ParentIdId: itemId
        //     };

        //     url = webUrl + "/_api/Web/lists/getbytitle('" + documentLibrary + "')/items(" + file.ListItemAllFields.Id + ")";

        //     updateFileMetadata(url, updateObject, file, function (data) {
        //     }, function (data) {
        //         alert("File upload done but meta data updating FAILED");
        //     });
        // }, function (data) {
        //     alert("File uploading and meta data updating FAILED");
        // });
        // }
    }

    function getFileBuffer(uploadFile) {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(uploadFile);
        return deferred.promise();
    }

    function uploadFileToFolder(fileObj, url, success, failure) {
        var apiUrl = url;
        var getFile = getFileBuffer(fileObj);
        getFile.done(function (arrayBuffer) {
            $.ajax({
                url: apiUrl,
                method: "POST",
                data: arrayBuffer,
                processData: false,
                async: false,
                headers: {
                    "accept": "application/json;odata=verbose",
                    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                },
                success: function (data) {
                    success(data);
                },
                error: function (data) {
                    failure(data);
                }
            });
        });
    }

    // function uploadFileToFolderForPDF(fileObj, url, success, failure) {
    //     var apiUrl = url;
    //     var getFile = getFileBuffer(fileObj);
    //     getFile.done(function (arrayBuffer) {
    //         $.ajax({
    //             url: apiUrl,
    //             method: "POST",
    //             data: arrayBuffer,
    //             processData: false,
    //             async: false,
    //             headers: {
    //                 "accept": "application/pdf;odata=verbose",
    //                 "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
    //             },
    //             success: function (data) {
    //                 success(data);
    //             },
    //             error: function (data) {
    //                 failure(data);
    //             }
    //         });
    //     });
    // }

    function updateFileMetadata(apiUrl, updateObject, file, success, failure) {
        $.ajax({
            url: apiUrl,
            method: "POST",
            async: false,
            data: JSON.stringify(updateObject),
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Content-Type": "application/json;odata=verbose",
                "X-Http-Method": "MERGE",
                "IF-MATCH": file.ListItemAllFields.__metadata.etag,
            },
            success: function (data) {
                success(data);
            },
            error: function (data) {
                failure(data);
            }
        });
    }
}

$('.upload_file #uploadMainDoc').change(function (e) {
    var fileName = e.target.files[0].name;
    $("[data-target='uploadMainDoc']").val(fileName);
});


$(document).on('change', '[id^="uploadReferenceDoc"]', function(){
    var fileName = $(this)[0].files[0].name;
    $("[data-target='" + $(this).attr('id') + "']").val(fileName);
});



