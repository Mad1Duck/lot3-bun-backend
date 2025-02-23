function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let success = false;
      if (success) {
        resolve("sukses mengambil data");
      } else {
        reject("gagal mengambil data");
      }
    }, 2000); // delay 2s
  });
}

fetchData()
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });


function fetchA() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("A"), 2000);
  });
}

function fetchB() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("B"), 3000);
  });
}

Promise.all([fetchA(), fetchB()])
  .then((results) => {
    console.log(results);
  })
  .catch((error) => {
    console.error(error);
  });