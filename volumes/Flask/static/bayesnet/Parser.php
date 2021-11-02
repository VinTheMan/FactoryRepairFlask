<?php

include 'array.php';
$output_stream = "";

$output_stream = $output_stream . "<BIF VERSION=\"0.3\">\n";
$output_stream = $output_stream . "<NETWORK>\n";
$output_stream = $output_stream . "<NAME>New Network</NAME>\n";

$i = 1;
$FY = 0;
$FN = 0;

foreach (file('source_new1.csv') as $line) {

    if ($i == 1) {

        $headers = explode(',', $line);

        for ($s = 0; $s < count($headers); $s++) {

            $output_stream = $output_stream . "<VARIABLE TYPE=\"nature\">\n";
            $output_stream = $output_stream . "<NAME>" . $headers[$s] . "</NAME>\n";
            $output_stream = $output_stream . "<OUTCOME>No</OUTCOME>\n";
            $output_stream = $output_stream . "<OUTCOME>Yes</OUTCOME>\n";
            $output_stream = $output_stream . "</VARIABLE>\n";
        }
    } else {
        $headers2 = explode(',', $line);
        if ($headers2[0] == "Yes") {
            $FY = $FY + 1;
        } else {
            $FN = $FN + 1;
        }
    }

    $i = $i + 1;
}


$output_stream = $output_stream . "<DEFINITION>\n";
$output_stream = $output_stream . "<FOR>" . $headers[0] . "</FOR>\n";
$output_stream = $output_stream . "<TABLE>\n";
$output_stream = $output_stream . $FN / ($FY + $FN) . " " . $FY / ($FY + $FN) . "\n";
$output_stream = $output_stream . "</TABLE>\n";
$output_stream = $output_stream . "</DEFINITION>\n";

$YY = 0;
$YN = 0;
$NY = 0;
$NN = 0;

for ($s = 1; $s < count($headers) - 1; $s++) {
    $i = 1;
    foreach (file('source_new1.csv') as $line) {
        if ($i > 1) {
            $headers2 = explode(',', $line);
            if ($headers2[0] == "Yes") {
                if ($headers2[$s] == "Yes") {
                    $YY = $YY + 1;
                } else {

                    $YN = $YN + 1;
                }
            } else {
                if ($headers2[$s] == "Yes") {
                    $NY = $NY + 1;
                } else {

                    $NN = $NN + 1;
                }
            }
        }

        $i = $i + 1;
    }

    $output_stream = $output_stream . "<DEFINITION>\n";
    $output_stream = $output_stream . "<FOR>" . $headers[$s] . "</FOR>\n";
    $output_stream = $output_stream . "<GIVEN>" . $headers[0] . "</GIVEN>\n";
    $output_stream = $output_stream . "<TABLE>\n";
    $output_stream = $output_stream . $NN / ($NY + $NN) . " " . $NY / ($NY + $NN) . "\n";
    $output_stream = $output_stream . $YN / ($YY + $YN) . " " . $YY / ($YY + $YN) . "\n";
    $output_stream = $output_stream . "</TABLE>\n";
    $output_stream = $output_stream . "</DEFINITION>\n";
}

$output_stream = $output_stream . "<DEFINITION>\n";
$output_stream = $output_stream . "<FOR>" . $headers[count($headers) - 1] . "</FOR>\n";
for ($s = 1; $s < count($headers) - 1; $s++) {

    $output_stream = $output_stream . "<GIVEN>" . $headers[$s] . "</GIVEN>\n";
}

$output_stream = $output_stream . "<TABLE>\n";

$inital_array = array_list(count($headers) - 2);
$positive_array = array();
$negative_array = array();
for ($s = 0; $s <= count($inital_array) - 1; $s++) {
    $positive_array[$inital_array[$s]] = 0;
    $negative_array[$inital_array[$s]] = 0;
}

$i = 1;
foreach (file('source_new1.csv') as $line) {
    if ($i <> 1) {
        $headers2 = explode(',', $line);
        $mykey = "";
        $myvalue = "";
        for ($s = 1; $s < count($headers2) - 1; $s++) {
            $mykey = $mykey . $headers2[$s];
        }

        $myvalue = $headers2[count($headers2) - 1];
        $myvalue = str_replace(PHP_EOL, '', $myvalue);
        // $output_stream = $output_stream . "XXX" . substr($myvalue, 0, 1) . "XXX" ; // test

        if (substr($myvalue, 0, 1) === "Y") {
            $positive_array[$mykey] = (int)$positive_array[$mykey] + 1;
        } else {
            $negative_array[$mykey] = (int)$negative_array[$mykey] + 1;
        }
    }

    $i = $i + 1;
}

foreach ($positive_array as $key => $value) {

    $A = (int)$negative_array[$key];
    $B = (int)$positive_array[$key];
    //$output_stream = $output_stream . $key;
    if ($A == "0") {
        if ($B == "0") {
            $output_stream = $output_stream . "0" . " " . "0" . "\n";
        } else {
            $output_stream = $output_stream . "0" . " " . (int)$B / ((int)$A + (int)$B) . "\n";
        }
    } else {

        if ($B == "0") {

            $output_stream = $output_stream . (int)$A / ((int)$A + (int)$B) . " " . "0" . "\n";
        } else {
            $output_stream = $output_stream . (int)$A / ((int)$A + (int)$B) . " " . (int)$B / ((int)$A + (int)$B) . "\n";
        }
    }
}

$output_stream = $output_stream . "</TABLE>\n";
$output_stream = $output_stream . "</DEFINITION>\n";
$output_stream = $output_stream . "</NETWORK>\n";
$output_stream = $output_stream . "</BIF>\n";

$file = 'Factory_model_new_solution.xml';

// Write the contents back to the file
file_put_contents($file, $output_stream);

print_r($positive_array);
print_r($negative_array);
