
import { ethers } from 'ethers';
import { RPC_URL, FACTORY_ADDRESS } from '../constants/config';
import { ManufacturerFactoryABI, FakeProdIdenABI } from '../constants/abis';

// 1. Setup Provider
// Using JsonRpcProvider since we are reading state and not signing transactions from the mobile app for now.
// If signing is needed later, a Wallet or Signer would be required.
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// 2. Helper to get Factory Contract
const getFactoryContract = () => {
    return new ethers.Contract(FACTORY_ADDRESS, ManufacturerFactoryABI, provider);
};

// 3. Helper to get Manufacturer Contract
const getManufacturerContract = (address) => {
    return new ethers.Contract(address, FakeProdIdenABI, provider);
};

// 4. Main Verification Function
export const verifyProductOnBlockchain = async (manufacturerCode, productCode, consumerKey) => {
    try {
        const factory = getFactoryContract();
        const manufacturerAddress = await factory.getManufacturerInstance(manufacturerCode.trim());

        if (manufacturerAddress === "0x0000000000000000000000000000000000000000") {
            return { success: false, message: "Brand not found on this network!" };
        }

        const manufacturerContract = getManufacturerContract(manufacturerAddress);
        // Note: consumerKey should be an integer as per the ABI/web code usage
        const isValid = await manufacturerContract.productVerification(productCode, parseInt(consumerKey));

        return { success: true, isValid, manufacturerAddress };
    } catch (error) {
        console.error("Blockchain verification error:", error);
        return { success: false, message: "Verification failed. Check inputs or network.", error: error.message };
    }
};
