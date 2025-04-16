<?php

	if (count($argv) < 2)
		exit;

	$csv = $argv[1];

	$file = fopen($csv, 'r');
	$cnt = 0;

	$monthly = array();
	$ports = array();

	while (($line = fgetcsv($file)) !== FALSE) {
	   $cnt++;
	   if ($cnt < 2)
	   		continue;

	   if ($line[3] == trim("US-Canada Border")) {
		   
	   		$portcode = $line[2];

		   if (!isset($ports[$portcode]))
		   		$ports[$portcode] = (Object) array('lat'=>$line[7], 'lng'=>$line[8], 'name'=>$line[0], 'state'=>$line[1], 'portcode'=>$portcode);
		}



	}
	fclose($file);

	// file_put_contents('data.json', json_encode($monthly));

	// file_put_contents('ports.json', json_encode($ports));

	$fout = fopen("ports.csv","w");
	foreach($ports as $key=>$port) {
		echo $key . "," . $port->lat . "," . $port->lng . "\n";
		fwrite($fout, $key . "," . $port->lat . "," . $port->lng . "\n");
	}
	fclose($fout);
	//var_dump($ports);
?>