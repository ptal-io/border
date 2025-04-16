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

	   	$date = DateTime::createFromFormat('M', $line[2]);
	   $month = (int)$date->format('n');
	   $year = (int) $line[0];
	   if ($line[3] == "Northern Border" and $year > 2022 and $month < 4) {
		   
		   preg_match('/\((.*?)\)/', $line[6], $matches);
		   $portcode = trim($matches[1]);

		   
		   //$month = (int)$date->format('n');
		   //$year = (int) $line[0];

		   $count = (int)$line[10];
		   if ($line[7] == 'Land' and $line[8] == "Travelers" and ($line[9] == "Passenger Vehicles" or $line[9] == "Pedestrians")) {

			   if (!isset($monthly[$portcode])) {
			   		$monthly[$portcode] = array(); 
			   }
			   if (!isset($monthly[$portcode][$year])) {
			   		$monthly[$portcode][$year] = array();
			   }
			   if (!isset($monthly[$portcode][$year][$month])) {
			   		$monthly[$portcode][$year][$month] = (Object) array('vehicle'=>(Object)array()); 
			   }

		   
		   		if (!isset($monthly[$portcode][$year][$month]->vehicle->car))
		   			$monthly[$portcode][$year][$month]->vehicle->car = $count;

		   		$monthly[$portcode][$year][$month]->vehicle->car += $count;
		   }

		   //if (!isset($ports[$portcode]))
		   	//	$ports[$portcode] = (Object) array('lat'=>$line[7], 'lng'=>$line[8], 'name'=>$line[0], 'state'=>$line[1], 'portcode'=>$portcode);
		}



	}
	fclose($file);

	$pre2025 = array();
	$y2025 = array();

	foreach($monthly as $portcode=>$val) {
		//echo $portcode . "\n";
		if (!isset($pre2025[$portcode]))
			$pre2025[$portcode] = array();

		if (!isset($y2025[$portcode]))
			$y2025[$portcode] = array();

		foreach($val as $year=>$val2) {
			foreach($val2 as $month=>$val3) {
				if ($year == 2024) {
					if (!isset($pre2025[$portcode][$month]))
						$pre2025[$portcode][$month] = array();
					if (property_exists($val3->vehicle, 'car'))
						$pre2025[$portcode][$month][] = $val3->vehicle->car;
				} else {
					if (property_exists($val3->vehicle, 'car'))
						$y2025[$portcode][$month] = $val3->vehicle->car;
				}
			}
		}
	}

	$diff = array();

	foreach($pre2025 as $port=>$val) {
		if (!isset($diff[$port]))
			$diff[$port] = array();
		foreach($val as $month=>$cnt) {
			if (!isset($diff[$port][$month]))
				$diff[$port][$month] = array();
			if (count($cnt) > 0) {
				$avg = (float) array_sum($cnt) / count($cnt);
				// echo $avg;
				$diff[$port][$month][0] = $avg;
				foreach($y2025 as $port2=>$val2) {
					if ($port2 == $port) {
						if (isset($val2[$month]))
							$diff[$port][$month][1] = $val2[$month];
					}
				}
			}
		}
		
	}

	foreach($diff as $port=>&$val) {
			ksort($val);
	}

	$file = fopen("ports_can.csv", 'r');
	$ports = array();
	while (($line = fgetcsv($file)) !== FALSE) {
	   $cnt++;
	   if ($cnt < 2)
	   		continue;

	   	$ports[$line[0]] = $line[1];
	}
	fclose($file);

	//var_dump($ports);

	$prov  = array();

	foreach($diff as $port=>$val1) {
		foreach($val1 as $month=>$vals) {

			if (count($vals) == 2) {
				$port = (int) $port;
				//echo $ports->{$port} . "\n";
				if (isset($ports[$port])) {
					if (!isset($prov[$ports[$port]]))
						$prov[$ports[$port]] = array();

					if (!isset($prov[$ports[$port]][$month]))
						$prov[$ports[$port]][$month] = array(0,0);
					//echo $vals[0];
					$prov[$ports[$port]][$month][0] += $vals[0];
					$prov[$ports[$port]][$month][1] += $vals[1];
				}
			}
		}
	} 

	$output = array();
	foreach($prov as $key=>$val) {
		$key = explode("/", $key);
		$key = trim($key[0]);
		$output[$key] = array();
		$output[$key][1] = round(($val[1][0]-$val[1][1])/$val[1][0]*-1000)/10;
		$output[$key][2] = round(($val[2][0]-$val[2][1])/$val[2][0]*-1000)/10;
		$output[$key][3] = round(($val[3][0]-$val[3][1])/$val[3][0]*-1000)/10;
	}


	file_put_contents('prov.json', json_encode($output));

?>