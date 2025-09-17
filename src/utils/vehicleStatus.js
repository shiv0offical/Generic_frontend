const checkifTimeisOneHourOlder = (providedDate) => {
  if (!providedDate) return false;

  const dateToCheck = new Date(providedDate);
  // console.log("🚀 ~ checkifTimeisOneHourOlder ~ dateToCheck:", dateToCheck)

  // Check for invalid date
  if (isNaN(dateToCheck.getTime())) {
    console.error("Invalid date provided.");
    return false;
  }
  const now = new Date();
  const diffInMs = now.getTime() - dateToCheck.getTime();
  const oneHourInMs = 60 * 60 * 1000;

  return diffInMs > oneHourInMs;
};

const colorOfDot = (ignition, movement, time) => {
  if (ignition && movement & !checkifTimeisOneHourOlder(time)) {
    return "rgb(0,128,0)";
  }
  if (ignition && !movement & !checkifTimeisOneHourOlder(time)) {
    return "rgb(255, 255, 0)";
  }
  if (!ignition && !movement & !checkifTimeisOneHourOlder(time)) {
    return "rgb(255, 0, 0)";
  }
  if (checkifTimeisOneHourOlder(time)) {
    return "rgb(0,0,255)";
  }
};

export const processVehicles = (vehicles) => {
  const devices = vehicles.map((vehicle) => {
    const ioData = Array.isArray(vehicle.ioElements) ? vehicle.ioElements : [];

    if (ioData.length > 0) {
      const ignition = ioData.find((item) => item.id === 239);
      const battery = ioData.find((item) => item.id === 68);
      const movement = ioData.find((item) => item.id === 240);
      const externalPower = ioData.find((item) => item.id === 66);

      const localTime = !isNaN(new Date(vehicle?.timestamp))
        ? new Date(vehicle.timestamp).toISOString()
        : "";

      const isBattery = battery?.value > 0;
      const isExternalPower = externalPower?.value > 0;
      const isGPS = vehicle.latitude != null && vehicle.longitude != null;

      const isOffline = checkifTimeisOneHourOlder(localTime);
      const hasIgnition = ignition?.value === 1;
      const isMoving = movement?.value === 1;

      // 🔥 Status logic
      let status = "Unknown";
      if (isOffline) {
        status = "Offline";
      } else if (hasIgnition && isMoving) {
        status = "Running";
      } else if (hasIgnition && !isMoving) {
        status = "Idle";
      } else if (!hasIgnition && !isMoving) {
        status = "Parked";
      }

      return {
        id: vehicle.id,
        vehicle_name: vehicle.vehicle_name,
        timestamp: localTime,
        speed_limit: vehicle.speed || 0,
        speed: vehicle.speed || 0,
        lat: vehicle.latitude || 0,
        lng: vehicle.longitude || 0,
        hasGPS: isGPS,
        hasIgnition: ignition?.value === 1,
        hasBattery: isBattery,
        hasExternalPower: isExternalPower,
        movement: movement?.value === 1,
        color: colorOfDot(ignition?.value, movement?.value, localTime),
        isOffline: checkifTimeisOneHourOlder(localTime),
        status,
      };
    } else {
      return vehicle;
    }
  });

  // const runningDevices = devices.filter(
  //   (d) =>
  //     d.hasIgnition && d.movement && !checkifTimeisOneHourOlder(d.timestamp)
  // );
  // // console.log("🚀 ~ :77 ~ processVehicles ~ runningDevices:", runningDevices);

  // const idelDevices = devices.filter(
  //   (d) =>
  //     d.hasIgnition && !d.movement && !checkifTimeisOneHourOlder(d.timestamp)
  // );

  // const parkedDevices = devices
  //   .filter((d) => "lat" in d)
  //   .filter(
  //     (d) => !d.hasIgnition && !d.movement && !checkifTimeisOneHourOlder(d.timestamp)
  //   );

  // const offlineVehicleData = devices.filter((d) =>
  //   checkifTimeisOneHourOlder(d.timestamp)
  // );

  const runningDevices = devices.filter((d) => d.status === "Running");
  const idelDevices = devices.filter((d) => d.status === "Idle");
  const parkedDevices = devices.filter((d) => d.status === "Parked");
  const offlineVehicleData = devices.filter((d) => d.status === "Offline");

  return {
    devices,
    runningDevices,
    idelDevices,
    parkedDevices,
    offlineVehicleData,
  };
};
