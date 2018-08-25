//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mysql");
var mysql = require("mysql");
var app = express(); 
var nodemailer = require('nodemailer');
var cors = require('cors')
var url = require('url');
var http = require("http");

// Body Parser Middleware
app.use(bodyParser.json()); 

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

var msg91key="200835Ad7aLZdJ5a9ac154";

var pool      =    mysql.createPool({
    connectionLimit : 0, //important
    host     : 'd2p.cayzymtlzfaw.ap-south-1.rds.amazonaws.com',
    port	  : 3306,
    user     : 'D2P',
    password : 'password',
    database: 'D2P',
    debug    :  false,
	multipleStatements: true
});

	var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'codedeals2party@gmail.com',
    pass: 'jaipal2108'
  }
});


function handle_database(query,req,res) {
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   
       // // console.log('connected as id ' + connection.threadId);
        connection.query(query,function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}


//Setting up server
 var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 });
 
var corsOptions = {
    //origin: 'http://deals2party.com.s3-website.ap-south-1.amazonaws.com',
	origin: ['http://localhost:4200','http://deals2party.com.s3-website.ap-south-1.amazonaws.com','http://www.deals2party.com.s3-website.ap-south-1.amazonaws.com'],
   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204 
} 


//Initiallising connection string
var dbConfig = {
    user:  'D2P',
    password: 'password',
    server:'d2p.cayzymtlzfaw.ap-south-1.rds.amazonaws.com',
    database:'D2P',
	debug    :  false,
	multipleStatements: true
};

//GET API
app.get("/api/user" ,cors(corsOptions), function(req , res){
                var query = "select * from order_master";
                //executeQuery (res, query);
				handle_database(query, req, res);
});

//POST API
 app.post("/addToCart", function(req , res){
	 // detailList: [],
  // packageID: 1,
  // offerPackageID: 13,
  // guestCount: 20,
  // partyDate: '2018-02-17',
  // partyTime: '18:00',
  // offer_price: 260
	 // console.log(Math.random());
	 var query ="";
	 
	 query = query +	" delete from order_details where Order_Id in (select order_Id from order_master where `Order_Status_CD` = 1 and Cust_Id=" + req.body[0].Cust_Id + "); "
	 query = query +	" delete from order_master where `Order_Status_CD` = 1 and Cust_Id=" + req.body[0].Cust_Id + "; "
	 
	 for (i = 0; i < req.body.length; i++) { 
		// console.log(req.body[i]);
		
	query = query +	" INSERT INTO `D2P`.`order_master` (`Order_Date`, `Order_Time`,  `Cust_Id`,`Invoice_No`,`Order_Status_CD`,`Total_Amount`, " +
	"`Vendor_Caterer_Package_Offers`,`GuestCount`) "
		+ "VALUES ( '" + req.body[i].partyDate +  "','" + req.body[i].partyTime  + "',"+  req.body[i].Cust_Id +",'" + req.body[i].Cust_Id + "', 1, " +
		req.body[i].guestCount*req.body[i].offer_price + "," + req.body[i].offerPackageID + "," + req.body[i].guestCount + ");" 
	query = query + " SET @id = LAST_INSERT_ID();  ";
		//executeQuery (res, query);
		//console.log(query);
	if (req.body[i].detailList.length>0)
		for (j = 0; j < req.body[i].detailList.length; j++) { 
		
	query = query + " INSERT INTO `D2P`.`order_details`  ( `Order_Id`, `Menu_Dtl_Id`) VALUES ( @id," 
	+  req.body[i].detailList[j] + "); "

		}
}
//executeQuery (res, query);
// console.log(query);
		handle_database(query, req, res);
		//console.log(res);
	 // console.log("addToCart");
	 //var data = JSON.parse(req.body);
	 // console.log(req.body.length);
	 // console.log(req.body[0]);
	 // console.log(req.body[1]);
	 // console.log(req.body);
//return res.send(req.body);	 
 //var query = 'INSERT INTO [user] (Name,Email,Password) VALUES ( + req.body.Name , req.body.Email,req.body.Password)';
  //              executeQuery (res, query);
});

//PUT API
 app.post("/ConfirmCart", function(req , res){
 // console.log("ConfirmCart");
     // var d = new Date();
    // var invoiceNumber = d.getMonth() + d.getDate() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
 var query ="";
 // console.log(req.body.length);
	 
	 for (i = 0; i < req.body.length; i++) { 
			query = query +	"	UPDATE `D2P`.`order_master` SET `Order_Status_CD` = 2, Invoice_No='"+ req.body[i].InvoiceNumber + "' WHERE `Cust_Id` = " + req.body[i].Cust_Id + " and `Order_Status_CD` = 1  ; "
	}
// console.log(query);
		handle_database(query, req, res);
	
				
				
});

 app.post("/UpdateCommunication", function(req , res){
 // console.log("UpdateCommunication");
     // var d = new Date();
    // var invoiceNumber = d.getMonth() + d.getDate() + d.getFullYear() + d.getHours() + d.getMinutes() + d.getSeconds() + d.getMilliseconds();
 var query ="";
 // console.log(req.body.length);
	 
	 query = "	INSERT INTO  `D2P`.`order_communication_status`  (Invoice_No, order_communication_mode, communication_to, status) VALUES ( " 
						+  req.body.invoiceNumber + ", '" +  req.body.mode + "', '" +  req.body.To + "', '"  +  req.body.status + "') "
	
// console.log(query);
		handle_database(query, req, res);
	
				
				
});

function handle_Email_database(query) {
    pool.getConnection(function(err,connection){
        if (err) {
          //res.json({"code" : 100, "status" : "Error in connection database"});
          return "Error";
        }   
       // // console.log('connected as id ' + connection.threadId);
        connection.query(query,function(err,rows){
            connection.release();
            if(!err) {
				return "success";
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              return "Error";  
        });
  });
}


 app.post("/SendD2PEmail", function(req , res){

var mailOptions = {
  from: req.body.From,
  to: req.body.To,
  subject: req.body.subject,
  html: req.body.body
};

transporter.sendMail(mailOptions, function(error, info){
         // if(error){
             // res.send("Email could not sent due to error: "+error);
        // }else{
             // res.send("Requerimiento enviado con éxito");
        // } 
		
		// if(error){
             // res.send("Email could not sent due to error: "+error);
        // }else{
             // res.send("Requerimiento enviado con éxito");
        // } 
		if (error) {
			// console.log("Error in sending mail");
			// console.log(error);
			query = "	INSERT INTO  `D2P`.`order_communication_status`  (Invoice_No, order_communication_mode, communication_to, status) VALUES ( " 
						+  req.body.invoiceNumber + ", '" +  req.body.mode + "', '" +  req.body.To + "', 'failed') "
	
			// console.log(query);
			handle_Email_database(query);
          res.json({"code" : 100, "status" : "Error in sending mail"});
          return;
        }   
		else
		{
			// console.log(res);
			 var query ="";
			// console.log(req.body.length);
	 
			query = "	INSERT INTO  `D2P`.`order_communication_status`  (Invoice_No, order_communication_mode, communication_to, status) VALUES ( " 
						+  req.body.invoiceNumber + ", '" +  req.body.mode + "', '" +  req.body.To + "', 'success') "
	
			// console.log(query);
			handle_Email_database(query);
		
			res.json({"code" : 0, "status" : "Successfully sent mail"});
          return;
		}
});
});

app.get("/getPackage_Master",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;

// console.log(q);	

var query = 
        '    select v.Vendor_Name, v.Address vendoraddress, v.LogoPath,v.Email_id,v.Contact_No, vpo.vendor_caterer_package_offers, dt.description dishtype, ct.description  cuisinestype,   vm.*,  '
        + '  min(vpo.rangefrom)  rangefrom, max(vpo.rangeto) rangeto,min(vpo.offer_price) offer_price,vpo.pin  '
        + '      from vendor_caterer_package_master vm '
        + '    left join vendor_type vt on vm.vendor_type_cd = vt.vendor_type_cd  '
        + ' left join vendor_caterer_package_offers vpo  '
        + ' on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id '
        + ' left join dishes_type  dt on vm.dish_type_id =dt.dish_type_id '
        + ' left join cuisines_type ct on ct.cuisines_type_id=vm.cuisines_type_id '
		+ ' left join vendor_master v on vm.Vendor_Id=v.Vendor_Id'
        + ' where rangefrom is not null and rangeto is not null	and vpo.pin=' +  q.pin
		
		+ '  group by vm.vender_pkg_mst_id order by vm.vender_pkg_mst_id'

		 // console.log(query);
		handle_database(query,
        req, res);
});


app.get("/getCustomerOrderEmailData",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	
		// handle_database("select * from CartOrder where Email_id='" + q.Email_id + "' LIMIT 1",
        // req, res);
	//var query = "select * from CartOrder where emailid='" + q.Email_id + "' or mobile='" + q.mobile + "'";
	
var query = "    select distinct v.Vendor_Id,v.Vendor_Name,v.Email_id vendor_Email_Id, om.Invoice_No,om.Order_Date,om.Order_Time,om.Total_Amount,om.GuestCount,vpo.vendor_caterer_package_offers," 
+ " vpo.Offer_Price, vm.Package_Name,vm.Package_Desc,vm.Package_Price" 
+ " ,dt.description packagedishtype,  ct.description  packagecuisinestype, " 
+ " v.Vendor_Name, v.Email_id,v.Address,v.Contact_No,dm.Description DishName,dt1.description dishtype,  ct1.description  cuisinestype " 
+ " ,cot.Description courseType " 
+ " from order_master om " 
+ " join vendor_caterer_package_offers vpo  on  om.Vendor_Caterer_Package_Offers=vpo.vendor_caterer_package_offers " 
+ " join vendor_caterer_package_master vm on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id " 
+ " left join dishes_type  dt on vm.dish_type_id =dt.dish_type_id " 
+ " left join cuisines_type ct on ct.cuisines_type_id=vm.cuisines_type_id  " 
+ " left join vendor_master v on vm.Vendor_Id=v.Vendor_Id  " 
+ "  left join order_details od on  om.Order_Id=od.Order_Id " 
+ "  left join dishes_master dm on dm.Dish_Id=od.Menu_Dtl_Id " 
+ "  left join dishes_type  dt1 on dm.Dish_Type_ID =dt1.dish_type_id  " 
+ "  left join cuisines_type ct1 on ct1.cuisines_type_id=dm.Cuisines_Type_ID  " 
+ "  left join course_type cot on dm.Course_Type_ID=cot.Course_Type_ID " 
+ "  where om.Cust_Id="+ q.Cust_Id +" and om.Order_Status_CD=2 and om.Invoice_No= " + q.Invoice_No 
+ "  order by v.Vendor_Id,vpo.vendor_caterer_package_offers,cot.Course_Type_ID,dm.Dish_Type_ID "

	 // console.log(query);
		handle_database(query,
        req, res);
});


// app.get("/getOrderHistory",cors(corsOptions),function(req,res){
	// var q = url.parse(req.url, true).query;
	
// var query =  "   select distinct v.Vendor_Id,v.Vendor_Name,v.Email_id vendor_Email_Id, om.Invoice_No,om.Order_Date,om.Total_Amount,om.GuestCount,vpo.vendor_caterer_package_offers, " 
// + " 	   vpo.Offer_Price, vm.Package_Name,vm.Package_Desc,vm.Package_Price "
// + " 	    ,dt.description packagedishtype,  ct.description  cuisinestype, "
// + " 	    v.Vendor_Name, v.Email_id,v.Address,v.Contact_No,dm.Description DishName,dt1.description dishtype,  ct1.description  cuisinestype "
// + " 	    ,cot.Description courseType "
// + " 	      from order_master om  "
// + " 	      join vendor_caterer_package_offers vpo  on  om.Vendor_Caterer_Package_Offers=vpo.vendor_caterer_package_offers "
// + " 	      join vendor_caterer_package_master vm on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id "
// + " 	        left join dishes_type  dt on vm.dish_type_id =dt.dish_type_id  "
// + " 	 left join cuisines_type ct on ct.cuisines_type_id=vm.cuisines_type_id  "
// + " 	 left join vendor_master v on vm.Vendor_Id=v.Vendor_Id  "
// + " 	  left join order_details od on  om.Order_Id=od.Order_Id "
// + " 	  left join dishes_master dm on dm.Dish_Id=od.Menu_Dtl_Id "
// + " 	 left join dishes_type  dt1 on dm.Dish_Type_ID =dt1.dish_type_id  "
// + " 	 left join cuisines_type ct1 on ct1.cuisines_type_id=dm.Cuisines_Type_ID "
// + " 	 left join course_type cot on dm.Course_Type_ID=cot.Course_Type_ID  "
// + " 	 where om.Cust_Id=22 and om.Order_Status_CD=2 and om.Invoice_No= 2337 "
// + " 	 order by v.Vendor_Id,vpo.vendor_caterer_package_offers,cot.Course_Type_ID,dm.Dish_Type_ID "

	// // console.log(query);
		// handle_database(query,req, res);
// });

app.get("/getOrderHistory",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	
var query =  "   select distinct v.Vendor_Id,v.Vendor_Name,v.Email_id vendor_Email_Id, om.Invoice_No,om.Order_Date, om.Order_Time,om.CreatedOn, om.Total_Amount,om.GuestCount, vpo.vendor_caterer_package_offers, " 
+ " 	   vpo.Offer_Price, vm.Package_Name,vm.Package_Desc,vm.Package_Price "
+ " 	    ,dt.description packagedishtype,  IFNULL(ct.description,'')  cuisinestype, "
+ " 	    v.Vendor_Name, v.Email_id,v.Address,v.City,v.State,v.Pin, v.Contact_No " 

+ " 	      from order_master om  "
+ " 	      join vendor_caterer_package_offers vpo  on  om.Vendor_Caterer_Package_Offers=vpo.vendor_caterer_package_offers "
+ " 	      join vendor_caterer_package_master vm on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id "
+ " 	        left join dishes_type  dt on vm.dish_type_id =dt.dish_type_id  "
+ " 	 left join cuisines_type ct on ct.cuisines_type_id=vm.cuisines_type_id  "
+ " 	 left join vendor_master v on vm.Vendor_Id=v.Vendor_Id  "
+ " 	  left join order_details od on  om.Order_Id=od.Order_Id "
+ " 	  left join dishes_master dm on dm.Dish_Id=od.Menu_Dtl_Id "
+ " 	 left join dishes_type  dt1 on dm.Dish_Type_ID =dt1.dish_type_id  "
+ " 	 left join cuisines_type ct1 on ct1.cuisines_type_id=dm.Cuisines_Type_ID "
+ " 	 left join course_type cot on dm.Course_Type_ID=cot.Course_Type_ID  "
+ " 	 where om.Cust_Id=" +  + q.userID + " and om.Order_Status_CD=2 "
+ " 	 order by om.CreatedOn desc;  " 

	 var query = query + 	" select om.Order_Id, om.Invoice_No, dm.dish_id, dm.description dishname, ct.description coursetype , "
	   + "   dm.course_type_id, dm.price, dt.description dishtype  , cot.Description menuCoursetype " // ,   om.*
	   + "   from order_master om  "
	   + "   join order_details od on om.Order_Id = od.Order_Id "
	   + "   join dishes_master dm on dm.Dish_Id=od.Menu_Dtl_Id  "
	   + " 	 join dishes_type  dt on dm.Dish_Type_ID =dt.dish_type_id  "
	   + " 	 join cuisines_type ct on ct.cuisines_type_id=dm.Cuisines_Type_ID  "
	   + " 	 join course_type cot on dm.Course_Type_ID=cot.Course_Type_ID   "
	   + " 	 where om.Cust_Id=    " +   q.userID + " and om.Order_Status_CD=2  " //-- om.Invoice_No = 2786

	 // console.log(query);
		handle_database(query,req, res);
});


//http://localhost:3000/createCustomer?Mobile_No=8552941306,Login_Id=8552941306
app.get("/createCustomer",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	var Query = "insert into user_master (User_Type_CD, Login_Id, Mobile_No) values (3,'" + q.Login_Id + "','" + q.Mobile_No + "')";
	// console.log(Query);
	// handle_database("select * from user_master where Email_id='" + q.Email_id + "' LIMIT 1",
        // req, res);
	handle_database(Query,
        req, res);
});
//http://localhost:3000/getCustomerMaster?Mobile_No=7218700909
app.get("/getCustomerMaster",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	var query = "select * from user_master where Mobile_No='" + q.Mobile_No + "' or User_Id='" + q.user_id + "' LIMIT 1";

	// console.log(query);
	handle_database(query,
        req, res);
});

app.get("/getCustomerAddress",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	handle_database("select * from user_master m left join user_address a on m.User_Id=a.user_id where m.User_Id=" + q.user_id + " LIMIT 1",
        req, res);
});
//http://localhost:3000/CreateCustomerAddress?user_id=22&address1=adddress1&address2=address2&city=city&state=state&postcode=postcode&country=country
//createCustomerAddress?user_id22&address1=adddress1&address2=address2&city=city&state=state&postcode=412207&country=India
//createCustomerAddress?user_id=22&address1=adddress1&address2=address2&city=city&state=state&postcode=412207&country=India
//createCustomerAddress?Email_id=jsthakur@gmail.com&Name=Jaipal3&address_id=1&user_id=22&address1=D 83&address2=wagholi&city=pune&state=MH&postcode=412207&country=India
//createCustomerAddress?Email_id=jsthakur@gmail.com&Name=Jaipal3&address_id=1&user_id=22&address1=D 83&address2=wagholi&city=pune&state=MH&postcode=412207&country=India
//createCustomerAddress?Email_id=jsthakur@gmail.com&Name=Jaipal3&address_id=1&user_id=22&address1=D83&address2=wagholi&city=pune&state=MH&postcode=412207&country=India
app.get("/createCustomerAddress",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	var query;
	if (q.address_id)
	{
		query = " UPDATE `D2P`.`user_address` SET `address1`= '" + q.address1 +  "' , `address2` = '" + q.address2 + "', `city` ='" + q.city +
			"', `state` = '" + q.state + "' , `postcode` = " + q.postcode + " , `country` = '" + q.country + "' WHERE `address_id` = " + q.address_id + ";" ;

	}
	else
	{
	query = "INSERT INTO `D2P`.`user_address` (`user_id`,`address1`,`address2`,`city`,`state`,`postcode`,`country`) " +
		"VALUES  (" + q.user_id + ",'" + q.address1 + "','" + q.address2 + "','" + q.city + "','" + q.state + "','" + q.postcode
		 + "','" + q.country + "')" + ";"
	}
	var query = query + " UPDATE `D2P`.`user_master` SET  `Name` = '" + q.Name + "', `Email_id` = '" + q.Email_id + "'  WHERE `User_Id` = " + q.user_id + ";";
	
	 // console.log(query);
	handle_database(query,req, res);
});

app.get("/Customer_UpdateMobile",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	// console.log("update `user_master` set `Mobile_No` = '" + q.Mobile_No + "' where `Login_Id` = '"+ q.Login_Id + "';");
	var query = "update `user_master` set `Mobile_No` = '" + q.Mobile_No + "' where `User_Id` = '"+ q.User_Id + "';";
	// console.log(query);
	handle_database(query ,
        req, res);
});	


app.get("/sendOTP",cors(corsOptions),function(req1,res1){

var q = url.parse(req1.url, true).query;
var options = {
  "method": "POST",
  "hostname": "control.msg91.com",
  "port": null,
  "path": "/api/sendotp.php?authkey="+ msg91key +"&mobile="+ q.mobilenumber,
  "headers": {}
};
	

var req = http.request(options, function (res) {
  var chunks = [];
  res.on("data", function (chunk) {
    chunks.push(chunk);
  });
  res.on("end", function () {
    var body = Buffer.concat(chunks);
   // // console.log(body.toString());
	res1.json(body.toString());
	return;
  });
});
req.end();
});

app.post("/SendD2PSMS", function(req , res){
	
var options = {
  "method": "POST",
  "hostname": "control.msg91.com",
  "port": null,
  "path": "/api/v2/sendsms",
  "headers": {
    "authkey": msg91key,
    "content-type": "application/json"
  }
};

var smsdata =
			{ sender: 'DLSPRT',
			route: '4',
			country: '91',
			sms : []
			 }; 
	for (x in req.body)
	{
		smsdata.sms.push(req.body[x]);
		console.log(req.body[x]);
	}
			 

		var req = http.request(options, function (res) {
		  var chunks = [];

		  res.on("data", function (chunk) {
			chunks.push(chunk);
		  });

		  res.on("end", function () {
			var body = Buffer.concat(chunks);
			//console.log(body.tostring());
		  });
		});

		req.write(JSON.stringify(smsdata));
		req.end();
	
});


app.get("/resendOTP",cors(corsOptions),function(req1,res1){

var q = url.parse(req1.url, true).query;
var options = {
  "method": "POST",
  "hostname": "control.msg91.com",
  "port": null,
  "path": "/api/retryotp.php?authkey="+ msg91key +"&mobile="+ q.mobilenumber,
  "headers": {}
};
	
	
var req = http.request(options, function (res) {
  var chunks = [];
  res.on("data", function (chunk) {
    chunks.push(chunk);
  });
  res.on("end", function () {
    var body = Buffer.concat(chunks);
   // // console.log(body.toString());
	res1.json(body.toString());
	return;
  });
});
req.end();
});

app.get("/verifyOTP",cors(corsOptions),function(req1,res1){
var q = url.parse(req1.url, true).query;

var optionsVerify = {
  "method": "POST",
  "hostname": "control.msg91.com",
  "port": null,
  "path": "/api/verifyRequestOTP.php?authkey="+ msg91key +"&mobile="+ q.mobilenumber + "&otp=" + q.otp,
  "headers": {}
};	
	
var req = http.request(optionsVerify, function (res) {
  var chunks = [];
  res.on("data", function (chunk) {
    chunks.push(chunk);
  });
  res.on("end", function () {
    var body = Buffer.concat(chunks);
    //// console.log(body.toString());
	res1.json(body.toString());
	return;
  });
});
req.end();
});




app.get("/getCuisines_type",cors(corsOptions),function(req,res){-
    handle_database(
    "select * from cuisines_type",
        req, res);
});

// app.get("/getPackage_Master",cors(corsOptions), function (req, res) {
    // -
    // handle_database(
        // '    select v.Vendor_Name,v.Email_id,v.Contact_No, vpo.vendor_caterer_package_offers, dt.description dishtype, ct.description  cuisinestype,   vm.*,  '
        // + '  vpo.rangefrom,vpo.rangeto,vpo.offer_price  '
        // + '      from vendor_caterer_package_master vm '
        // + '    left join vendor_type vt on vm.vendor_type_cd = vt.vendor_type_cd  '
        // + ' left join vendor_caterer_package_offers vpo  '
        // + ' on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id '
        // + ' left join dishes_type  dt on vm.dish_type_id =dt.dish_type_id '
        // + ' left join cuisines_type ct on ct.cuisines_type_id=vm.cuisines_type_id '
		// + ' left join vendor_master v on vm.Vendor_Id=v.Vendor_Id'
        // + ' where rangefrom is not null and rangeto is not null	'
        // , req, res);
// });


app.get("/getDishType",cors(corsOptions), function (req, res) {-
        handle_database(
            ' select * from dishes_type	'
            ,req, res);
});
app.get("/getFacilities_Master",cors(corsOptions), function (req, res) {
    -
    handle_database(
        ' select * from facilities_master	'
        , req, res);
});
app.get("/getCourse_Type",cors(corsOptions), function (req, res) {
    -
        handle_database(
            ' select * from course_type	'
            , req, res);
});
app.get("/getvendor_Type",cors(corsOptions), function (req, res) {
    -
        handle_database(
            ' select * from vendor_type	'
            , req, res);
});
app.get("/getoccasion_type",cors(corsOptions), function (req, res) {
    -
        handle_database(
            ' select * from occasion_type	'
            , req, res);
});
app.get("/getvenue_Type",cors(corsOptions), function (req, res) {
    -
        handle_database(
            ' select * from venue_type	'
            , req, res);
});

app.get("/getPackageRangeSelection",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	

var query = 

    '  select vpo.* '
	+ ' from vendor_caterer_package_master vm  '
    + ' join vendor_caterer_package_offers vpo  on vpo.vender_pkg_mst_id =vm.vender_pkg_mst_id  and'
    + ' vm.vender_pkg_mst_id=' + q.vender_pkg_mst_id 
	+ ' order by vpo.rangefrom '  
  	
		

		// console.log(query);
		handle_database(query,
        req, res);
});


app.get("/getPackageMenuSelection",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	

var query = 

			'	select   distinct vpc.pkg_course_max_selection maxselection, pc.vender_pkg_mst_id,  '
		+	'	 ct.description coursetype , dm.course_type_id, '
		+	'	 case when pc.dish_id > 0 then 1 else 0 '
		+	'	 end dishselected   '
		+	'	 from dishes_master dm    '
		+	'	 join vendor_master vm on dm.vendor_id = vm.vendor_id   '
		+	'	 join vendor_package_master vcm on vcm.vendor_id = vm.vendor_id '  
		+	'	 join vendor_caterer_package_menu pc on pc.dish_id = dm.dish_id and pc.vender_pkg_mst_id = vcm.vender_pkg_mst_id and pc.vender_pkg_mst_id=' + q.vender_pkg_mst_id
		+	'	 join course_type ct on dm.course_type_id = ct.course_type_id   '
		+	'	 join vendor_caterer_package_course vpc on (vpc.vender_pkg_mst_id=pc.vender_pkg_mst_id and vpc.course_type_id=ct.course_type_id) '
		+   '    order by sorting_order '
			      	
		

		// console.log(query);
		handle_database(query,
        req, res);
});



app.get("/getPackageMenu",cors(corsOptions),function(req,res){
	var q = url.parse(req.url, true).query;
	

var query = 
            'select '
        + '  distinct vpc.pkg_course_max_selection maxselection, pc.vender_pkg_mst_id, dm.dish_id, dm.description dishname, ct.description coursetype , dm.course_type_id, dm.price, dt.description dishtype , case when pc.dish_id > 0 then 1 else 0 end dishselected '
            + '  from dishes_master dm  '
            + '  join vendor_master vm on dm.vendor_id = vm.vendor_id '
            + '  join dishes_type dt on dt.dish_type_id = dm.dish_type_id '
            + '  join vendor_package_master vcm on vcm.vendor_id = vm.vendor_id '
            + '  join vendor_caterer_package_menu pc on pc.dish_id = dm.dish_id and pc.vender_pkg_mst_id = vcm.vender_pkg_mst_id and pc.vender_pkg_mst_id=' + q.vender_pkg_mst_id
            + '  join course_type ct on dm.course_type_id = ct.course_type_id '
      + '  join vendor_caterer_package_course vpc on (vpc.vender_pkg_mst_id=pc.vender_pkg_mst_id and vpc.course_type_id=ct.course_type_id) '
	+'  order by ct.sorting_order'
		

		// console.log(query);
		handle_database(query,
        req, res);
});
app.get("/getPackageMenu",cors(corsOptions), function (req, res) {
    -
        handle_database(
            'select '
        + '  distinct vpc.pkg_course_max_selection maxselection, pc.vender_pkg_mst_id, dm.dish_id, dm.description dishname, ct.description coursetype , dm.course_type_id, dm.price, dt.description dishtype , case when pc.dish_id > 0 then 1 else 0 end dishselected '
            + '  from dishes_master dm  '
            + '  join vendor_master vm on dm.vendor_id = vm.vendor_id '
            + '  join dishes_type dt on dt.dish_type_id = dm.dish_type_id '
            + '  join vendor_package_master vcm on vcm.vendor_id = vm.vendor_id '
            + '  join vendor_caterer_package_menu pc on pc.dish_id = dm.dish_id and pc.vender_pkg_mst_id = vcm.vender_pkg_mst_id '
            + '  join course_type ct on dm.course_type_id = ct.course_type_id '
      + '  join vendor_caterer_package_course vpc on (vpc.vender_pkg_mst_id=pc.vender_pkg_mst_id and vpc.course_type_id=ct.course_type_id) '
            , req, res);
});

app.get("/getIndia_States",cors(corsOptions), function (req, res) {
    -
    handle_database(
        ' select * from india_states'
        , req, res);
});

// DELETE API
 app.delete("/api/user /:id", function(req , res){
                var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
                executeQuery (res, query);
});
