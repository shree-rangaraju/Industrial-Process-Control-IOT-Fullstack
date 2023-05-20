const motorStatus = document.querySelector("#motorStatus");
const currentLevel = document.querySelector("#currentLevel");
const progressBar = document.querySelector("#progressBar");
const progressBarMinSetPoint = document.querySelector(
  "#progressBarMinSetPoint"
);
const progressBarMaxSetPoint = document.querySelector(
  "#progressBarMaxSetPoint"
);

const setLevel = document.querySelector("#setLevel");
const minLevel = document.querySelector("#minLevel");
const maxLevel = document.querySelector("#maxLevel");
const changeMotorStatus = document.querySelectorAll(".changeMotorStatus");
const firebaseConfig = {
  apiKey: "AIzaSyChIItVMV-2vp9afVNO1_kSWmqTw_ed9wk",
  authDomain: "process-control-9f9a8.firebaseapp.com",
  databaseURL:
    "https://process-control-9f9a8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "process-control-9f9a8",
  storageBucket: "process-control-9f9a8.appspot.com",
  messagingSenderId: "464278250998",
  appId: "1:464278250998:web:b03f6c506c7fe1c5d813d7",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const dataRef = database.ref("/");

progressBarMinSetPoint.style.height = "20%";
progressBarMaxSetPoint.style.height = "20%";

function convertRange(value, oldMin, oldMax, newMin, newMax) {
  const oldRange = oldMax - oldMin;
  const newRange = newMax - newMin;
  const newValue = ((value - oldMin) * newRange) / oldRange + newMin;
  return newValue;
}

const pullData = () => {
  dataRef
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      motorStatus.innerHTML =
        data.TankData.motorStatus == 0 ? "Offline" : "Online";
      currentLevel.innerHTML = data.TankData.currentLevel;
      updateProgress(data.TankData.currentLevel);
      minLevelValue.textContent = data.TankData.minLevel;
      maxLevelValue.textContent = data.TankData.maxLevel;
      progressBarMinSetPoint.style.top =
        80 - convertRange(data.TankData.minLevel, 0, 30, 0, 80) + "%";
      progressBarMaxSetPoint.style.top =
        80 - convertRange(data.TankData.maxLevel, 0, 30, 0, 80) + "%";
    })
    .catch((error) => {
      console.error("Failed to pull data:", error);
    });
};

const resetData = () => {
  const data = {
    TankData: {
      motorStatus: 0,
      minLevel: 0,
      maxLevel: 0,
      currentLevel: 0,
    },
  };
  dataRef.set(data).catch((error) => {
    console.error("Failed to push data:", error);
  });
};

// resetData();

//perfect ones
dataRef.on("value", () => {
  pullData();
});

const updateProgress = (progress) => {
  const percentage = 100 - ((progress - 0) / (30 - 0)) * 100;
  progressBar.style.height = percentage + "%";
};

for (let i = 0; i < changeMotorStatus.length; i++) {
  changeMotorStatus[i].addEventListener("click", function () {
    const buttonValue = this.value;
    const newData = {
      "TankData/motorStatus": Number(buttonValue),
    };
    dataRef.update(newData).catch((error) => {
      console.error("Failed to push data:", error);
    });
  });
}

setLevel.addEventListener("click", () => {
  if (Number(minLevel.value) < 0 || Number(minLevel.value) > 30) {
    alert("Warning! Cannot Exceed Minimum Level range of Values(0-30)");
  } else if (Number(maxLevel.value) < 0 || Number(maxLevel.value) > 30) {
    alert("Warning! Cannot Exceed Maximum Level range of Values(0-30)");
  } else if (Number(minLevel.value) > Number(maxLevel.value)) {
    alert("Warning! Minimum level cannot be greater than Maximum level!");
  } else {
    const newData = {
      "TankData/minLevel": Number(minLevel.value),
      "TankData/maxLevel": Number(maxLevel.value),
    };
    dataRef.update(newData).catch((error) => {
      console.error("Failed to push data:", error);
    });
  }
});
