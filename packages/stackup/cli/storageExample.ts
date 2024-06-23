import {
    isStorageExist,
    deleteStorage,
    saveSilentShareStorage,
    getSilentShareStorage,
  } from './srcMpc/lib/storage'; // Update the path accordingly
  
  async function runExamples() {
    try {
      // Check if storage exists
      const storageExists = await isStorageExist();
      console.log('Storage Exists:', storageExists);
  
      // Delete storage
     
  
    //   // Example data to save
    //   const dataToSave = {
    //     PairingId: 'ExamplePairingId',
    //     wallets: { exampleWallet: 'walletData' },
    //     requests: { exampleRequest: 'requestData' },
    //     tempDistributedKey: null,
    //     accountId: null,
    //   };
  
    
      // Retrieve data from storage
      const retrievedData = await getSilentShareStorage();
      console.log('Retrieved Data:', retrievedData.pairingData.pairingId);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  runExamples();
  