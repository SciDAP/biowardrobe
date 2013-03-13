<?php

   require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

$data=json_decode($_REQUEST['data']);

if(!isset($data))
    $res->print_error("no data");

$con=def_connect();
$con->select_db($db_name_ems);

$count=1;

if(gettype($data)=="array") {
    foreach($data as $key => $val ) {
        if(execSQL($con,"insert into rhead(project_id,name) values(?,?)",array("is",$val->project_id,$val->item),true)==0) {
            $res->print_error("Cant insert");
        }
    }
    $count=count($data);
} else {
    if(execSQL($con,"insert into rhead(project_id,name) values(?,?)",array("is",$data->project_id,$data->item),true)==0) {
        $res->print_error("Cant insert");
    }
}

$con->close();


$res->success = true;
$res->message = "Data loaded";
$res->total = $count;
//$res->data = $query_array;
print_r($res->to_json());

?>