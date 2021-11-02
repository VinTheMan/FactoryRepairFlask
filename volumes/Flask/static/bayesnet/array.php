<?php

function Array_List($Questing_Count)
{
  $inital_array=array ("No","Yes");
  //$return_array[] = $var;
  if ($Questing_Count<=1 ){
    $return_array=$inital_array;
  }else{
    for($s=1;$s<=$Questing_Count-1;$s++){
        $return_array=array ();
        for($j=0;$j<count($inital_array);$j++){

            array_push($return_array, "No".$inital_array[$j]);

        }
        for($j=0;$j<count($inital_array);$j++){

            array_push($return_array, "Yes".$inital_array[$j]);

        }

        $inital_array=$return_array;
    }

  }

  return $return_array;
}
//print_r(array_list(2));

?>

