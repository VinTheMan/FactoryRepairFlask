<?php

//response obj
class responseObj {
    public $name ;
    
}
//get post data
$data = $_POST['test'];

$file_name = $_POST['filename'] . ".xml";
 
//put data to xml
file_put_contents( $file_name,$data);
    
$reDive = new responseObj();
$reDive->name = $data;
$myJSON = json_encode($reDive);

readfile($data);
echo $myJSON;

?>