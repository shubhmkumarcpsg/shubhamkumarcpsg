var arraycount = 0;  
    var fileUploadeCount = 0;  
var site = _spPageContextInfo.webAbsoluteUrl;
var count = 1;
var usercount = 0;
$(document).ready(function()
{
    if(count == 1){
        $('[value="Back"]').attr('disabled', 'disabled');
    }
    $('#vlc').attr('disabled', 'disabled');
    GetDropdown('Department', 'vcd');
    GetDropdown('SubGroup', 'vsg');
    GetDropdown('fileType', 'vft');
    FinancialYear();



    $('#vcd').on('change', function(){
        var category = $(this).val();
        if(category != "Select"){
            $('#vlc').removeAttr('disabled');
            GetLoction(category);
        }
        else{
            $('#vlc').val("Select");
            $('#vlc').attr('disabled', 'disabled');
        }
    });
    BindApprover();
    $('#AddApprover').click(function(){
        AddApprover();
        GetApprover();
  
  
        $("#NewSaveItem").click(function () { formSave() });  
        
        $("#Btn_AddMoreDocument").click(function(){
		$(".Referencediv").append("Reference Document  <input id='ReferenceUploadFile' type='file' size='98'/> <br/> <br/>");
		});
		$(document).on("click", "a.remove" , function() {
            $(this).parent().remove();
        });
        
        $(".filediv").validate({
        	rules: {
        	file:{
        	 	required: true, 
                extension: "png|jpeg|jpg",
                filesize: 1048576
        	}
        	},
        });

    
    });

    $(document).on('change', '[id^="ddlApprover"]', function(){
        var acount = parseInt($(this).attr('id').replace('ddlApprover',''));
        var ddlcount = 0;
        if(usercount != acount){
            ResetApprover(acount);
            if($(this).val() != "Select"){
                if(ddlcount == 0){
                    RemoveSelectedValue($(this).val());
                }
                ddlcount++;
                var option = "";
                $.each(approverList, function(index, value){
                    option += '<option value="' + value.Id + '">' + value.Name + '</option>';
                });
                $('#ddlApprover' + (acount + 1)).append(option);
            }
        }
    });
});
/*
function SaveListData(option){
    var department = $('#vcd').val();
    $.ajax({
        url: site + "/_api/lists/getbytitle('Request')/items",
        method: "POST",
        headers: {
            "Accept": "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": $('#__REQUESTDIGEST').val()
        },
        data: JSON.stringify({
            __metadata: { type: "SP.Data.RequestListItem" },
            DepartmentId: parseInt($("#vcd").val()),  
            LocationId:parseInt($("#vlc").val()),
            SubGroupId:parseInt($("#vsg").val()),
            FileTypeId:parseInt($("#vft").val()),
            FinancialYear:$("#vfr").val(),
            Subject:$("#vsub").val(),
            Description:$("#vds").val(),
            Amount:$("#vam").val(),
            ApproverCount: 1,
            ApproverStatus: option
        }),
        async: false,
        success: function(data){
            var itemId = data.d.Id;
            AddApproverList(itemId);
            alert('Your request is submitted successfully');
        },
        error: function(data){
            console.log(data);
        }
    });
}
*/
function SaveListData()
{
debugger ;
           var DepartmentId=parseInt($("#vcd").val());  
           var LocationId=parseInt($("#vlc").val());
           var SubGroupId=parseInt($("#vsg").val());
           var FileTypeId=parseInt($("#vft").val());
           var FinancialYear=$("#vfr").val();
            var Subject=$("#vsub").val();
           var Description=$("#vds").val();
          var  Amount=$("#vam").val();


    $.ajax  
        ({  
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Request')/items",  
        type: "POST",  
        data: JSON.stringify  
        ({  
            __metadata:  
            {  
                type: "SP.Data.RequestListItem"  
            },  
        
              
           DepartmentId: DepartmentId,  
            LocationId:LocationId,
            SubGroupId:SubGroupId,
            FileTypeId:FileTypeId,
            FinancialYear:FinancialYear,
            Subject:Subject,
            Description:Description,
            Amount:Amount
            
        }),  
        headers:  
        {  
            "Accept": "application/json;odata=verbose",  
            "Content-Type": "application/json;odata=verbose",  
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),  
            "X-HTTP-Method": "POST"  
        },  
        success: function(data, status, xhr)  
        {  
            
         //   location.reload();
           var itemId = data.d.Id;
           AddApproverList(itemId);
           saveAttachment(itemId);
           SaveReferenceFile();
           alert("Save");           
        },  
        error: function(xhr, status, error)  
        {  
            alert("Failed");
        }  
    });  
}

function AddApproverList(itemId){
    var len = parseInt($('#ddlNoApprover').val());
     var indexId = itemId
         for(i=1; i<= len; i++){
           $.ajax({
            url: site + "/_api/lists/getbytitle('ApproverList')/items",
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $('#__REQUESTDIGEST').val()
            },
            data: JSON.stringify({
                __metadata: { type: "SP.Data.ApproverListListItem" },
                ApproverId: parseInt($('#ddlApprover' + i).val()),
                Index: i.toString(),
                ParentIdId: itemId
            }),
            async: false,
            success: function(data){

            },
            error: function(data){
                console.log(data);
            }
        });
    }
}

function RemoveSelectedValue(selectedValue){
    var arrayResult = approverList;
    $.each(arrayResult, function(index, value){
        if(value.Id == parseInt(selectedValue)){
            approverList.splice(index, 1);
            return false;
        }
    });
}

function ResetApprover(cuurentCount){
    for(i=cuurentCount + 1; i<= usercount; i++){
        var element = '<option value="Select">Select Approver '+ i +'</option>';
        $('#dllApprover' + i + ' option').remove();
        $('#dllApprover' + i).append(element);
    }
}

function next(){
    if(ValidateForm1()){
        $('#form' + count).attr('style', 'display: none');
        count++;
        $('#form' + count).removeAttr('style');
    }
    
    if(count > 1){
        $('[value="Back"]').removeAttr('disabled');
    }
    $('[value="Next"]').removeAttr('style');
    if(count > 2){
        $('[value="Next"]').attr('style', 'display:none');
        $('[align=right]').append("<span><input class='btn btn-primary' type='button' value='Save' onclick=SaveListData('Draft')></span><span><input class='btn btn-primary' type='button' value='Submit' onclick=SaveListData('Submit')></span>");
    }
}

function back(){
    $('#form' + count).attr('style', 'display: none');
    count--;
    $('#form' + count).removeAttr('style');
    if(count <= 1){
        $('[value="Back"]').attr('disabled', 'disabled');
    }
    if(count < 3){
        if(count == 2){
            $('input[value="Save"],input[value="Submit"]').remove();
        }
        $('[value="Next"]').removeAttr('style');
    }
}

function BindApprover() {
    var options = "";
        for (i = 1; i <= 10; i++) {
            options += '<option value="' + i + '">#' + i + ' Approver</option>';
        }
        $('#ddlNoApprover').append(options);
}
        
function AddApprover(){
    $('#ApproverContainer').children().remove();
    var count = $('#ddlNoApprover').val();
    usercount = parseInt(count);
    var approverDropdown = "";
    for(i=1;i<=count;i++){
        approverDropdown += "<div class='row'><div class='col-md-6'>#" + i + " Approver</div><div class='col-md-6'><select id='ddlApprover" + i + "'><option value='Select'>Select</option></select></div></div>";            
    }
    $('#ApproverContainer').append(approverDropdown);
}

var approverList = [];

function GetApprover(){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Group')/items?$select=Approval/ID,Approval/Title&$expand=Approval",
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    var approver = {};
                    approver.Id = value.Approval.ID;
                    approver.Name = value.Approval.Title;
                    option += "<option value='" + value.Approval.ID + "'>" + value.Approval.Title + "</option>";
                    approverList.push(approver); 
                });
                $('#ddlApprover1').append(option);
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

function ValidateForm1(){
    if(count == 1){
        if($('#vcd').val() == "Select"){
            alert("Please select Department.");
            $('#vcd').focus();
            return false;
        }
        else if($('#vlc').val() == "Select"){
            alert("Please select Location.");
            $('#vlc').focus();
            return false;
        }
        else if($('#vsg').val() == "Select"){
            alert("Please select Sub Group.");
            $('#vsg').focus();
            return false;
        }
        else if($('#vft').val() == "Select"){
            alert("Please select File Type.");
            $('#vft').focus();
            return false;
        }
        else if($('#vfr').val() == "Select"){
            alert("Please select Financial Year.");
            $('#vfr').focus();
            return false;
        }
        else if($('#vsub').val().trim() == ""){
            alert("Please fill Subject.");
            $('#vsub').val("");
            $('#vsub').focus();
            return false;
        }
        else if($('#vds').val().trim() == ""){
            alert("Please fill Description.");
            $('#vds').val("");
            $('#vds').focus();
            return false;
        }
        else{
            return true;
        }
    }
    else if(count == 2){
        if($('#ddlNoApprover').val() == "Select"){
            alert('Please select number of Approver.');
            $('#ddlNoApprover').focus();
            return false;
        }
        else{
            var noOfApprover = parseInt($('#ddlNoApprover').val());
            if(document.getElementById('ddlApprover1')){
                for(i=1; i<= noOfApprover; i++){
                    if($('#ddlApprover' + i).val() == "Select"){
                        alert("Please select Approver number " + i);
                        $('#ddlApprover' + i).focus();
                        return false;
                    }
                }
            }
            else{
                alert('Please click "Add Approver" button to fill Approver.');
                $('#AddApprover').focus();
                return false;
            }
        }
        return true;
    }
}

function FinancialYear(){
    var currentYear = new Date().getFullYear();
    var option = '';
    for(i=4; i>=0; i--){
        option += '<option value="' + (currentYear - i) + '-' + (currentYear - i + 1) + '">' + (currentYear - i) + '-' + (currentYear - i + 1) + '</option>';
    }
    $('#vfr').append(option);
}

function GetLoction(department){
    $.ajax({
        url: site + "/_api/lists/getbytitle('Location')/items?$select=ID,Title&$filter=DepartmentId eq " + parseInt(department),
        method: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = '<option class="dropdown-item" value="Select" aria-labelledby="dropdownMenuLink">Choose Location</option>';
                $.each(result, function(index, value){
                    option += '<option value="' + value.ID + '">' + value.Title + '</option>';
                });
                $('#vlc option').remove();
                $('#vlc').append(option);
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}


function insert()
{
    if(ValidateForm1()){
        $.ajax({  
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('Request')/items",  
            method: "POST",  
        data: JSON.stringify({  
            __metadata: {  type: "SP.Data.RequestListItem" },  
            ChooseDepartment_x003a_: $("#vcd").val(),  
            ChooseLocation:$("#vlc").val(),
            ChooseSubGroup:$("#vsg").val(),
            ChoosefileType_x003a_:$("#vft").val(),
            ChooseFinancialYear:$("#vfr").val(),
            EnterSubject:$("#vsub").val(),
            EnterDescription_x003a_:$("#vds").val(),
            EnterAmount:$("#vam").val()
        }),  
        headers: {  
            "Accept": "application/json;odata=verbose",  
            "Content-Type": "application/json;odata=verbose",  
            "X-RequestDigest": $("#__REQUESTDIGEST").val() 
        },  
        success: function(data, status, xhr) {  
            alert("Save");
            location.reload();
        },  
        error: function(xhr, status, error) {  
            alert("Failed");
        }  
    });
    }  
}



function GetDropdown(lisname, dropdownElement){
    $.ajax({
       url: _spPageContextInfo.webAbsoluteUrl + "/_api/lists/getbytitle('" + lisname + "')/items?select=ID,Title",
        method: "GET",
        headers: {"Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            if(result.length > 0){
                var option = "";
                $.each(result, function(index, value){
                    option += '<option value="' + value.ID + '">' + value.Title + '</option>';
                });
                $('#'+ dropdownElement).append(option);
            }
        },
        error: function(data){
            console.log(data);
        }
    });
}

var saveAttachment = function(itemId){
    //Validate if the upload file has a file selected.
    if(!validated()){
            jQuery('#lblResult').text("Please choose a file!");
            return;
    }     
   //Get File        
   var file = jQuery("#AttachmentUploadField")[0].files[0];
 
   //Upload the file
   uploadFileLocal(file);
};

var validated = function(){
   var file = jQuery("#AttachmentUploadField")[0].files[0];
   if(file == null){        
          return false;
  }
  else{
    return true;
  }
};

      var uploadFileLocal = function (file) {
      var digest = jQuery("#__REQUESTDIGEST").val();
      var webUrl = _spPageContextInfo.webAbsoluteUrl;
      var libraryName = "ApprovalDocuments";
	  //var currentDlg;
      var reader = new FileReader();
      var arrayBuffer;
	  reader.onload = function (e) {
            arrayBuffer = reader.result;
 
            URLs = webUrl + "/_api/web/lists/getByTitle(@TargetLibrary)/RootFolder/folders('MainDocument')/files/add(url=@TargetFileName,overwrite='true')?" +
               "@TargetLibrary='" + libraryName + "'" +
               "&@TargetFileName='" + file.name + "'";
 
            //JQuery Ajax call here
			
			$.ajax({
        url: URLs,
       type: "POST",
       data: arrayBuffer,
	headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": digest
            },    
	contentType: "application/json;odata=verbose",
	processData: false,
	data: JSON.stringify({
                __metadata: { type: "SP.Data.ApprovalDocumentsListItem" },
                //ApproverId: parseInt($('#ddlApprover' + i).val()),
                //Index: i.toString(),
                ParentIdId: itemId	
            }),

    success: function () {
            jQuery('#lblResult').text("Successfully uploaded file locally.");
            // if (currentDlg != null) {
                        // currentDlg.close();
            // }
         },
     error: function (arr, error) {
               jQuery('#lblResult').text("Error uploading file locally.");
            //    if (currentDlg != null) {
            //           currentDlg.close();
            //    }
          }
		})
		}
       reader.readAsArrayBuffer(file);
  };

var SaveReferenceFile = function(){
    //Validate if the upload file has a file selected.
    if(!Referencevalidated()){
            jQuery('#lblReferenceFile').text("Please choose a file!");
            //alert("Please choose a file")
            return false;
    } 
   //Get File        
   var file = jQuery("#ReferenceUploadFile")[0].files[0];
 
   //Upload the file
   uploadReferenceFileLocal(file);
};

var Referencevalidated = function(){
   var file = jQuery("#ReferenceUploadFile")[0].files[0];
   if(file == null){        
          return false;
  }
  else{
    return true;
  }
};

var uploadReferenceFileLocal = function (file) {
      var digest = jQuery("#__REQUESTDIGEST").val();
      var webUrl = _spPageContextInfo.webAbsoluteUrl;
      var libraryName = "ApprovalDocuments";
	  //var currentDlg;
      var reader = new FileReader();
      var arrayBuffer;
	  reader.onload = function (e) {
            arrayBuffer = reader.result;
 
            URLs = webUrl + "/_api/web/lists/getByTitle(@TargetLibrary)/RootFolder/folders('ReferenceDocument')/files/add(url=@TargetFileName,overwrite='true')?" +
               "@TargetLibrary='" + libraryName + "'" +
               "&@TargetFileName='" + file.name + "'";
 
            //JQuery Ajax call here
			
			$.ajax({
        url: URLs,
       type: "POST",
       data: arrayBuffer,
	headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": digest
            },    
	contentType: "application/json;odata=verbose",
	processData: false,
    success: function () {
            jQuery('#lblReferenceFile').text("Successfully uploaded file locally.");
            // if (currentDlg != null) {
                        // currentDlg.close();
            // }
         },
     error: function (arr, error) {
               jQuery('#lblReferenceFile').text("Error uploading file locally.");
            //    if (currentDlg != null) {
            //           currentDlg.close();
            //    }
          }
		})
		}
       reader.readAsArrayBuffer(file);
  };

function uploadFile() {

    // Define the folder path for this example.
    var serverRelativeUrlToFolder = '/shared documents';

    // Get test values from the file input and text input page controls.
    var fileInput = jQuery('#getFile');
    var newName = jQuery('#displayName').val();

    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl;

    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {

        // Add the file to the SharePoint folder.
        var addFile = addFileToFolder(arrayBuffer);
        addFile.done(function (file, status, xhr) {

            // Get the list item that corresponds to the uploaded file.
            var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
            getItem.done(function (listItem, status, xhr) {

                // Change the display name and title of the list item.
                var changeItem = updateListItem(listItem.d.__metadata);
                changeItem.done(function (data, status, xhr) {
                    alert('file uploaded and updated');
                });
                changeItem.fail(onError);
            });
            getItem.fail(onError);
        });
        addFile.fail(onError);
    });
    getFile.fail(onError);

    // Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput[0].files[0]);
        return deferred.promise();
    }

    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        // Get the file name from the file input control on the page.
        var parts = fileInput[0].value.split('\\');
        var fileName = parts[parts.length - 1];

        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-length": arrayBuffer.byteLength
            }
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
            itemMetadata.type, newName, newName);

        // Send the request and return the promise.
        // This call does not return response content from the server.
        return jQuery.ajax({
            url: itemMetadata.uri,
            type: "POST",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "content-length": body.length,
                "IF-MATCH": itemMetadata.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
    }
}

// Display error messages. 
function onError(error) {
    alert(error.responseText);
}