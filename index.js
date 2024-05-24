const fs = require('fs');
const axios = require('axios');

async function readInitDataFromFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        reject('Error reading file: ' + err);
      } else {
        const initDataList = data.split('\n').map(line => line.trim()).filter(line => line !== '');
        resolve(initDataList);
      }
    });
  });
}

async function startFarm(initData) {
  const headers = {
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
    'Referer': 'https://0xiceberg.com/webapp/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'sec-ch-ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'x-telegram-auth': initData,
  };

  try {
    const response = await axios.post(
      'https://0xiceberg.com/api/v1/web-app/farming/',
      {},
      { headers }
    );
    console.log(response.data);
    await axios.delete('https://0xiceberg.com/api/v1/web-app/farming/collect/',{headers})
    setTimeout(() => getBalance(headers), 1000); // Ensure headers are passed
  } catch (error) {
    console.log('Error during start farming:', error.response ? error.response.data : error.message);
    getBalance(headers); // Ensure headers are passed
  }
}

async function getBalance(headers) {
  try {
    const response = await axios.get(
      'https://0xiceberg.com/api/v1/web-app/balance/',
      { headers }
    );
    console.log('Balance:', response.data.amount);
    // scheduleClaimAndRefresh(token, response.data.farming.endTime); // Add this line if you want to use scheduleClaimAndRefresh
  } catch (error) {
    console.log('Error fetching balance:', error.response ? error.response.data : error.message);
  }
}

async function processInitData(initDataList, delay) {
  while (true) {
    for (const initData of initDataList) {
      try {
        await startFarm(initData);
        await new Promise(resolve => setTimeout(resolve, delay)); // Delay between each initData processing
      } catch (error) {
        console.error('Error processing initData:', error.response ? error.response.data : error.message);
      }
    }
  }
}


(async () => {
  try {
    const initDataList = await readInitDataFromFile('./initdata.txt');
    console.log('InitData List:', initDataList);

    const delay = 0
    await processInitData(initDataList, delay);
  } catch (error) {
    console.error('Error in main flow:', error.response ? error.response.data : error.message);
  }
})();
