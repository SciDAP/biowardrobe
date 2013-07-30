<?php
/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the EMS web interface module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/

require("common.php");
require_once('response.php');
require_once('def_vars.php');
require_once('database_connection.php');

if(isset($_REQUEST['tablename']))
    $tablename = $_REQUEST['tablename'];
else
    $res->print_error('Not enough required parameters.');

check_val($tablename);

$con=def_connect();
if($tablename=="labdata") {
    $con->select_db($db_name_ems);
} else {
    $con->select_db($db_name_experiments);
}
if (!($stmt = $con->prepare("describe `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}
if (!$stmt->execute()) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$result = $stmt->get_result();

$TYPE=array();
$HEAD=array();
while($row=$result->fetch_assoc()) {
    $TYPE[$row['Field']]=$row['Type'];
    $HEAD[$row['Field']]=$row['Field'];
}
$stmt->close();


if (!($stmt = $con->prepare("SELECT * FROM `$tablename`"))) {
    $res->print_error("Prepare failed: (" . $con->errno . ") " . $con->error);
}
if (!($stmt->execute())) {
    $res->print_error("Exec failed: (" . $con->errno . ") " . $con->error);
}
$result = $stmt->get_result();

header("Content-type: text/csv");
header("Content-Disposition: attachment; filename=$tablename.csv");
header("Pragma: no-cache");
header("Expires: 0");


$i=0;
$outstream = fopen("php://output", 'w');
fputcsv($outstream, $HEAD,',','"');

while($row=$result->fetch_assoc()) {
    $RPKM = array();
    foreach($TYPE as $key => $val) {
        if($val == 'float')
        $RPKM[$key] = round($row[$key],2);
        else
        $RPKM[$key] = $row[$key];
    }
    fputcsv($outstream, $RPKM,',','"');
    $i++;
}

$stmt->close();
$con->close();
$outstream->close();
?>
