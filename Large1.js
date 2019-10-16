
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

	<title></title>
	<script type="text/javascript"> 
 
    var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('BigList')/items?$top=20&$$select=Title,ID,Name,Number" ;
    var response = response || [];  // this variable is used for storing list items
    function GetListItems(){
           $.ajax({
            url: url,  
            method: "GET",  
            headers: {  
                "Accept": "application/json; odata=verbose"  
            },
            success: function(data){
                response = response.concat(data.d.results);
                 var tr = "";
                if (data.d.__next) {
                    url = data.d.__next;
                    GetListItems();
                }                
                for (var i = 0; i < data.d.results.length; i++)   
           {                      
               var value = data.d.results[i]; 
                  tr += '<tr><td>' +i + '</td><td>' + value.Title  + '</td><td>' +value.ID+ '</td><td>' +value.Name + '</td><td>'+value.Number + '</td></tr>';                    
                 
            }              
        $("#example tbody").append(tr); 
            },
            error: function(error){
                   alert("Failed")
            }
        });
    }



   function GetListItems1(){
   var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('BigList')/items?$top=20&$$select=Title,ID,Name,Number&$filter=Name eq 'Name 286'" ;
    var response = response || [];  // this variable is used for storing list items
           $.ajax({
            url: url,  
            method: "GET",  
            headers: {  
                "Accept": "application/json; odata=verbose"  
            },
            success: function(data){
                response = response.concat(data.d.results);
                 var tr = "";
                if (data.d.__next) {
                    url = data.d.__next;
                    GetListItems1();
                }                
                for (var i = 0; i < data.d.results.length; i++)   
           {                      
               var value = data.d.results[i]; 
                  tr += '<tr><td>' +i + '</td><td>' + value.Title  + '</td><td>' +value.ID+ '</td><td>' +value.Name + '</td><td>'+value.Number + '</td></tr>';                    
                 
            }              
        $("#example tbody").append(tr); 
            },
            error: function(error){
                   alert("Failed")
            }
        });
    }
  
</script>
</head>
<body>
	<div class="container">
	<input type="button" value="Load!" onclick="GetListItems()" >
<input type="button" value="Load!" onclick="GetListItems1()" >
	
	
	<table id="example" class="display" style="width:100%">
        <thead>
            <tr>
                 <th>i </th>
                <th>Title</th>
                <th>ID</th>
                <th>NAME</th>
                <th>CONTACT NO</th>
            </tr>
        </thead>
        <tbody>          
             </tbod>
    </table>
</div>
</body>
</html>