
	document.getElementById("wrapperAbout").addEventListener("click", function(event) {
	  document.getElementById('wrapperAbout').style.display = "none";
	  document.getElementById('about').style.display = "none";
    document.getElementById('provdetails').style.display = "none";
	});

	document.getElementById("close").addEventListener("click", function(event) {
	  document.getElementById('wrapperAbout').style.display = "none";
	  document.getElementById('about').style.display = "none";
	});

  document.getElementById("close2").addEventListener("click", function(event) {
    document.getElementById('wrapperAbout').style.display = "none";
    document.getElementById('provdetails').style.display = "none";
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
  var allports = null;
  let myChartInstance = null;

  // Step 1: Load and plot initial markers
  fetch('data/ports.json')
    .then(response => response.json())
    .then(portData => {
      allports = portData;
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
    var xlab = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    var yvals = {};

    for (let year in p) {
      yvals[year] = [];
      for (let month in p[year]) {
        if (year == 2025 && month > 8) continue;
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

function getColorClass(value) {
  if (value >= 5) return "color-green";
  else if (value >= 0) return "color-lightgreen";
  else if (value >= -10) return "color-yellow";
  else if (value >= -20) return "color-orange";
  else if (value >= -30) return "color-red";
  else return "color-deepred";
}

fetch('data/prov.json')
  .then(response => response.json())
  .then(provData => {
    const ctx = document.getElementById("provinceChart").getContext("2d");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const monthKeys = ["1", "2", "3", "4", "5", "6", "7", "8"];

    // Sort province names alphabetically
    const sortedProvinces = Object.keys(provData).sort();

    // Define a color palette
    const colors = [
      "#1b9e77", "#d95f02", "#7570b3", "#e7298a",
      "#66a61e", "#e6ab02", "#a6761d", "#666666",
      "#386cb0", "#f0027f", "#bf5b17", "#999999"
    ];

    // Build one dataset per province
    const datasets = sortedProvinces.map((prov, i) => ({
      label: prov,
      data: monthKeys.map(k => provData[prov][k]),
      borderColor: colors[i % colors.length],
      borderWidth: 2,
      fill: false,
      tension: 0.3
    }));

    // Create the line chart
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: datasets
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: false
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              usePointStyle: true
            },
            onClick: (evt, legendItem, legend) => {
              const prov = legendItem.text; // dataset label = province name
              // If you hold Alt/Option (or Ctrl/Cmd), also toggle visibility like default behavior
              const toggleLikeDefault = evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey;

              // Open the province details overlay
              if (typeof loadprov === 'function') {
                loadprov(prov); // uses your existing function to build & show the modal:contentReference[oaicite:3]{index=3}
              }

              // Optional: also toggle visibility when a modifier key is held
              if (toggleLikeDefault) {
                const ci = legend.chart;
                const index = legendItem.datasetIndex;
                ci.toggleDataVisibility(index);
                ci.update();
              }
            }
          },
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            title: {
              display: true,
              text: '% Change'
            },
            beginAtZero: false
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  });


  var ports_provs = [];
  fetch('data/ports.geojson')
  .then(response => response.json())
  .then(data => {
    ports_provs = data;
    for(feat in data.features) {
      prov = data.features[feat].properties.PRNAME.split("/")[0].trim();
      portcode = data.features[feat].properties.portcode;
      if (!Array.isArray(ports_provs[prov])) {
        ports_provs[prov] = [];
      }
      ports_provs[prov].push(portcode);
    }
  })
  .catch(error => {
    console.error('Error loading GeoJSON:', error);
  });


  function loadprov(prov) {
    document.getElementById('wrapperAbout').style.display = "block";
    document.getElementById('provdetails').style.display = "block";
    document.getElementById('provname').innerHTML = "Border Crossings in "+prov;

    var s = null;
    var missing = 0;
    content = '<table><thead><tr><th class="table-head" style="width:220px">Border Crossing</th>';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    months.forEach(m => content += `<th class="table-head">${m}</th>`);
    content += '</tr></thead><tbody>';

    for (port in ports_provs[prov]) {
      pp = String(ports_provs[prov][port]).padStart(4, '0');
      if (typeof allports[pp] === "object" && allports[pp] !== null && typeof _stats[pp] === "object" && _stats[pp] !== null) {
        s = _stats[pp];
        f = allports[pp];
        content += '<tr><td class="table-cell" style="width:350px;text-align:left;">' + f.name + " ("+f.state+") </td>";
        
        for(month in s[2025]) {
          if (month < 9) {
            var x = Math.round((s[2024][month].vehicle.car - s[2025][month].vehicle.car)/s[2024][month].vehicle.car*-1000)/10;
            const cls = getColorClass(x);
            content += `<td class="table-cell ${cls}">${x.toFixed(1)}%</td>`;
            
          }
        }
      } else {
        missing++;
      }
      content += "</tr>";
    }
    content += '</tbody></table>';
    if (missing > 0) {
      content += "<div style='margin-top:10px;text-align:left;color:#660000'>";
      if (missing == 1) {
        content += "<i>Details for "+missing + " crossing is not reported due to a lack of data.</i>"
      } else if (missing > 1) {
        content += "<i>Details for "+missing + " crossings are not reported due to a lack of data.</i>"
      }
      content += "</div>";
    }
    document.getElementById('crossings').innerHTML = content;
  }