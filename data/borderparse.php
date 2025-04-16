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

	    $year = (int) $line[0];
	   if ($line[3] == "Northern Border") {
		   
		   preg_match('/\((.*?)\)/', $line[6], $matches);
		   $portcode = trim($matches[1]);

		   $date = DateTime::createFromFormat('M', $line[2]);
		   $month = (int)$date->format('n');
		   $year = (int) $line[0];

		   $count = (int)$line[10];

		   if (!isset($monthly[$portcode])) {
		   		$monthly[$portcode] = array(); 
		   }
		   if (!isset($monthly[$portcode][$year])) {
		   		$monthly[$portcode][$year] = array();
		   }
		   if (!isset($monthly[$portcode][$year][$month])) {
		   		$monthly[$portcode][$year][$month] = (Object) array('vehicle'=>(Object)array()); 
		   }

		   if ($line[8] == "Travelers" and ($line[9] == "Passenger Vehicles" or $line[9] == "Pedestrians")) {
		   		if (!isset($monthly[$portcode][$year][$month]->vehicle->car))
		   			$monthly[$portcode][$year][$month]->vehicle->car = $count;

		   		$monthly[$portcode][$year][$month]->vehicle->car += $count;
		   }

		   //if (!isset($ports[$portcode]))
		   //		$ports[$portcode] = (Object) array('lat'=>$line[7], 'lng'=>$line[8], 'name'=>$line[0], 'state'=>$line[1], 'portcode'=>$portcode);
		}



	}
	fclose($file);

	echo count($monthly) . "\n";

	foreach($monthly as $key=>$val) {
		if (!isset($val[2025]) || count($val[2025]) < 3) {
			unset($monthly[$key]);
		} else {
			$cnt = 0;
			foreach($val[2025] as $month=>$val2) {
				if (property_exists($val2->vehicle,'car') and $month < 4) {
					$cnt++;
				}
			}
			if ($cnt < 3)
				unset($monthly[$key]);
		}
	}

	echo count($monthly);

	file_put_contents('data.json', json_encode($monthly));

	// file_put_contents('ports.json', json_encode($ports));

	//var_dump($ports);
?>