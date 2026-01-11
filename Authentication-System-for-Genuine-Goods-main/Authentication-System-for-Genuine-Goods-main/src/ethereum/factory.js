import web3 from "./web3";
import manuFactory from "./build/manufacturerFactory.json";

const instance = new web3.eth.Contract(
  manuFactory.abi,
  "0x23Fdddb100a003Fe2217310c2e6Bf9F9FbDc0Ccd"
);

export default instance;
