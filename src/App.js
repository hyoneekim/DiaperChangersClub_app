import React, { useEffect, useState } from "react";

const App = () => {
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

  useEffect(() => {
    const loadMap = () => {
      if (!document.querySelector('script[src*="https://maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAPS_KEY}&callback=initMap`;
        script.defer = true;
        script.async = true;
        document.head.appendChild(script);
      } else {
        if (window.google && window.google.maps) {
          window.initMap();
        }
      }
    };

    // Define the initMap function that will be used as the callback
    window.initMap = () => {
      initMap();
    };

    loadMap(); // Load the map on component mount
  }, []);

  const fetchMarkersData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/markers", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  const initMap = () => {
    if (!window.google) {
      console.error("Google Maps API is not loaded.");
      return;
    }

    const defaultPosition = { lat: 60.192, lng: 24.945 };
    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          initializeMap(pos, newInfoWindow);
        },
        () => {
          initializeMap(defaultPosition, newInfoWindow);
        }
      );
    } else {
      initializeMap(defaultPosition, newInfoWindow);
    }
  };

  const initializeMap = (centerPosition, infoWindow) => {
    const newMap = new window.google.maps.Map(document.getElementById("map"), {
      center: centerPosition,
      zoom: 14,
    });
    setMap(newMap);

    const locationButton = document.createElement("button");
    locationButton.textContent = "Current Location";
    locationButton.classList.add("custom-map-control-button");
    newMap.controls[window.google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            newMap.setCenter(pos);
          },
          () => {
            handleLocationError(true, newMap.getCenter(), infoWindow);
          }
        );
      } else {
        handleLocationError(false, newMap.getCenter(), infoWindow);
      }
    });

    // Fetch and display markers once the map is initialized
    fetchMarkersData().then((markersData) => {
      if (markersData && Array.isArray(markersData)) {
        markersData.forEach((location) => {
          // Ensure valid lat and lng data
          const lat = location.lat;
          const lng = location.lng;
          const loName = location.lo_name || "Unknown Location";
          const infoUrl = location.info || "#";
          const places = location.place || [];

          // Log parsed lat, lng, and lo_name
          console.log("Parsed lat:", lat, "Parsed lng:", lng, "Location Name:", loName);

          // Ensure there's valid data for location
          if (lat && lng) {
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: newMap,
              title: loName,
            });

            marker.addListener("click", () => {
              const placeDetails = places.length
                ? places.map(p => `<p>${p.name} - ${p.type}</p>`).join('')
                : '';

              const infoContent = `
                <div class="info-window">
                  <strong>${loName}</strong>
                  <br>
                  <a href="${infoUrl}" target="_blank" rel="noopener noreferrer">More information</a>
                  ${placeDetails}
                </div>
              `;

              infoWindow.setContent(infoContent);
              infoWindow.open(newMap, marker);
            });
          } else {
            console.warn("Invalid location data:", location);
          }
        });
      } else {
        console.warn("Fetched markers data is not an array or is empty");
      }
    });
  };

  const handleLocationError = (browserHasGeolocation, pos, infoWindow) => {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
  };

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
};

export default App;
