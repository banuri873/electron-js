let counterElement = document.getElementById("counterValue");

// Load the saved counter value when the page loads
window.onload = async function () {
  if (window.counterAPI) {
    const savedValue = await window.counterAPI.loadValue();
    counterElement.textContent = savedValue;
    updateCounterColor(savedValue);
  }
  window.counterAPI.onMenuReset(() => {
    onReset();
  });

  window.counterAPI.onMenuIncrement(() => {
    onIncrement();
  });

  window.counterAPI.onMenuDecrement(() => {
    onDecrement();
  });
};

function updateCounterColor(value) {
  if (value > 0) {
    counterElement.style.color = "green";
  } else if (value < 0) {
    counterElement.style.color = "red";
  } else {
    counterElement.style.color = "black";
  }
}

function onIncrement() {
  let previousCounterValue = counterElement.textContent;
  let updatedCounterValue = parseInt(previousCounterValue) + 1;
  counterElement.textContent = updatedCounterValue;
  updateCounterColor(updatedCounterValue);
  // Check for milestone values
  checkMilestone(updatedCounterValue);

  // Save the counter value
  if (window.counterAPI) {
    window.counterAPI.saveValue(updatedCounterValue);
  }
}

function onDecrement() {
  let previousCounterValue = counterElement.textContent;
  let updatedCounterValue = parseInt(previousCounterValue) - 1;
  counterElement.textContent = updatedCounterValue;
  updateCounterColor(updatedCounterValue);
  checkMilestone(updatedCounterValue);

  // Save the counter value
  if (window.counterAPI) {
    window.counterAPI.saveValue(updatedCounterValue);
  }
}

function onReset() {
  let updatedCounterValue = 0;
  counterElement.textContent = updatedCounterValue;
  counterElement.style.color = "black";

  // Save the counter value
  if (window.counterAPI) {
    window.counterAPI.saveValue(updatedCounterValue);
  }
}

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (window.contextMenuAPI) {
    window.contextMenuAPI.showContextMenu();
  }
})

function checkMilestone(value) {
  // Milestone values: multiples of 10, 50, 100
  if (value !== 0 && value % 100 === 0) {
    if (window.notificationAPI) {
      window.notificationAPI.showNotification(
        'Amazing Milestone!', 
        `You've reached ${value} on the counter!`
      );
    }
  } else if (value !== 0 && value % 50 === 0) {
    if (window.notificationAPI) {
      window.notificationAPI.showNotification(
        'Great Progress!', 
        `You've reached ${value} on the counter!`
      );
    }
  } else if (value !== 0 && value % 10 === 0) {
    if (window.notificationAPI) {
      window.notificationAPI.showNotification(
        'Counter Update', 
        `You've reached ${value} on the counter!`
      );
    }
  }
}