
	document.getElementById("wrapperAbout").addEventListener("click", function(event) {
	  document.getElementById('wrapperAbout').style.display = "none";
	  document.getElementById('about').style.display = "none";
	});

	document.getElementById("close").addEventListener("click", function(event) {
	  document.getElementById('wrapperAbout').style.display = "none";
	  document.getElementById('about').style.display = "none";
	});

	document.getElementById("moreinfo").addEventListener("click", function(event) {
	  document.getElementById('wrapperAbout').style.display = "block";
	  document.getElementById('about').style.display = "block";
	});

	const map = L.map('map').setView([55, -73], 4);


	const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20
	}).addTo(map);

	var customIcon = L.icon({
	    iconUrl: 'img/marker.png', // e.g., 'images/marker-icon.png'
	    iconSize: [30, 38],       // size of the icon
	    iconAnchor: [15, 38],     // point of the icon which will correspond to marker's location
	    popupAnchor: [0, -38]     // point from which the popup should open relative to the iconAnchor
	});

  const portMarkers = {};

  var _stats = null;
  let myChartInstance = null;

  // Step 1: Load and plot initial markers
  fetch('data/ports.json')
    .then(response => response.json())
    .then(portData => {
      Object.entries(portData).forEach(([portcode, port]) => {
        const lat = parseFloat(port.lat);
        const lng = parseFloat(port.lng);
        const name = port.name;
        const state = port.state;
        const portc = port.portcode;

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<strong>${name}</strong><br>${state}`);

        marker.on('click', function (e) {
		  //console.log('Marker clicked:', e.target); // or `this` refers to the marker
		  // You can also manually open the popup if needed
		  this.openPopup();
		  document.getElementById('instructions').style.display = 'none';
		  setChart(port.portcode, port.name, port.state);
		});

        // Store marker by portcode
        portMarkers[portcode] = marker;
      });

      // Step 2: Load additional data and update popups
      fetch('data/data.json')
        .then(response => response.json())
        .then(statsData => {
           _stats = statsData;
        });
    });


    function setChart(port, name, stated) {
  document.getElementById('chartname').innerHTML = name;
  document.getElementById('chartstate').innerHTML = stated;

  if (_stats.hasOwnProperty(port)) {
    document.getElementById('myChart2').style.display = 'none';
    document.getElementById('myChart').style.display = 'block';

    var p = _stats[port];
    var xlab = ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
    var yvals = {};

    for (let year in p) {
      yvals[year] = [];
      for (let month in p[year]) {
        if (year == 2025 && month > 3) continue;
        yvals[year].push(p[year][month].vehicle.car);
      }
    }

    const datasets = [
      {
        data: yvals[2025],
        label: "2025",
        borderColor: "#386cb0",
        fill: false,
        borderWidth: 6,
        lineTension: 0.4
      },
      {
        data: yvals[2024],
        label: "2024",
        borderColor: "#1b9e77",
        fill: false,
        lineTension: 0.4
      },
      {
        data: yvals[2023],
        label: "2023",
        borderColor: "#d95f02",
        fill: false,
        lineTension: 0.4
      },
      {
        data: yvals[2022],
        label: "2022",
        borderColor: "#7570b3",
        fill: false,
        lineTension: 0.4
      }
    ];

    // If chart doesn't exist, create it
    if (!myChartInstance) {
      const ctx = document.getElementById("myChart").getContext("2d");
      myChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: xlab,
          datasets: datasets
        },
        options: {
		  animation: {
		    x: {
		      duration: 1000,
		      easing: 'easeOutExpo'
		    },
		    y: {
		      duration: 1000,
		      easing: 'easeOutExpo'
		    }
		  }
		}
      });
    } else {
      myChartInstance.data.datasets.forEach((ds, idx) => {
		  ds.data = datasets[idx].data;
		});
		myChartInstance.update();
    }

  } else {
    document.getElementById('myChart').style.display = 'none';
    document.getElementById('myChart2').style.display = 'block';
  }
}

fetch('data/prov.json')
  .then(response => response.json())
  .then(provData => {
    const container = document.getElementById("provinceTable");
    const months = ["January", "February", "March"];
    const monthKeys = ["1", "2", "3"];

    // Define breakpoints for 5 classes (green = high positive, red = low negative)
    function getColorClass(value) {
      if (value >= 5) return "color-green";
      else if (value >= 0) return "color-lightgreen";
      else if (value >= -10) return "color-yellow";
      else if (value >= -25) return "color-orange";
      else return "color-red";
    }

    // Sort province names alphabetically
    const sortedProvinces = Object.keys(provData).sort();

    // Build HTML table
    let html = '<table><thead><tr><th class="table-head" style="width:220px">Province of Departure</th>';
    months.forEach(m => html += `<th class="table-head">${m}</th>`);
    html += '</tr></thead><tbody>';

    sortedProvinces.forEach(prov => {
      html += `<tr><td class="table-cell" style="text-align:left;">${prov}</td>`;
      monthKeys.forEach(k => {
        const val = provData[prov][k];
        const cls = getColorClass(val);
        html += `<td class="table-cell ${cls}">${val.toFixed(1)}%</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  });
