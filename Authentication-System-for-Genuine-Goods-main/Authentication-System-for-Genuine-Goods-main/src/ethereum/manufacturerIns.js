import web3 from './web3';
import FakeProdIden from './build/FakeProdIden.json';

const Manufacturer = (address) =>
{
    return new web3.eth.Contract(FakeProdIden.abi, address);
}
export default Manufacturer;