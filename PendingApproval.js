var site = _spPageContextInfo.webAbsoluteUrl;
var currentUser = _spPageContextInfo.userId;

$(document).ready(function(){
    GetPendingRequest();
   
})


function GetPendingRequest(){
    debugger;
    var count = 1;
    $.ajax({
        //url: site + "/_api/lists/getbytitle('Request')/items?$select=ID,ReferenceNumber,Created,Description,Status,FileType/Title,Amount&$top=5000&$expand=FileType&$filter=(Status eq 'Work In-Progress') or (Status eq  'Return') or (Status eq 'Delegate') and AssignToId eq " + currentUser +"",
        url: site + "/_api/lists/getbytitle('Request')/items?$select=ID,ReferenceNumber,Created,Description,Status,FileType/Title,Amount&$top=5000&$expand=FileType",
        method: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        async: false,
        success: function(data){
            var result = data.d.results;
            var row = "";
            if(result.length > 0){
                $.each(result, function(index, value){
                   if(value.Status != 'Completed' && value.Status != 'Draft'  && value.Status != 'Rejected' )
                    {
                    var statusColour = "";
                    var link="";
                    if(value.Status == "WorkIn-Progress"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID+ '">Click Here</a>';
                    }  
                    else if(value.Status == "Return"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    } 
                     else if(value.Status == "Delegate"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    }   
                   
                      else if(value.Status == "Completed"){
                        statusColour = "complete_status";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/ViewRequestDetails.aspx?rid=' + value.ID + '">Click Here</a>';
                    }
                    
                    else if(value.Status=="Rejected"){
                    statusColour="Rejected";
                    link='<a class="Click_to_see_more"href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    }
                    var date= new Date(value.Created).format('dd-MM-yyyy');
                        row += '<tr><td>' + count + '</td><td>' + value.ReferenceNumber + '</td><td>' + date + '</td><td>' + value.Description + '</td><td><span class="' + statusColour + '">' + value.Status + '</span></td><td>' + value.FileType.Title + '</td><td>₹ ' + value.Amount + '</td><td>' + link + '</td></tr>';
                    count++;
                }
                

                else if(value.AssignToId == 'currentUser')
                    {
                    var statusColour = "";
                    var link="";
                    if(value.Status == "WorkIn-Progress"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    }  
                    else if(value.Status == "Return"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    } 
                     else if(value.Status == "Delegate"){
                        statusColour = "work_in_progress";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    }   
                   
                      else if(value.Status == "Completed"){
                        statusColour = "complete_status";
                        link = '<a class="click_to_see_more" href="/sites/IDS/Pages/ViewRequestDetails.aspx?rid=' + value.ID + '">Click Here</a>';
                    }
                    
                    else if(value.Status=="Rejected"){
                    statusColour="Rejected";
                    link='<a class="Click_to_see_more"href="/sites/IDS/Pages/Approvel.aspx?rid=' + value.ID + '">Click Here</a>';
                    }
                    var date= new Date(value.Created).format('dd-MM-yyyy');
                        row += '<tr><td>' + count + '</td><td>' + value.ReferenceNumber + '</td><td>' + date + '</td><td>' + value.Description + '</td><td><span class="' + statusColour + '">' + value.Status + '</span></td><td>' + value.FileType.Title + '</td><td>₹ ' + value.Amount + '</td><td>' + link + '</td></tr>';
                    count++;
                }
                });




                $('#request_view tbody').append(row);
            }

            $('#request_view').DataTable();
        },
        error: function(data){
            console.log(data);
                    }   
                               
    });
}