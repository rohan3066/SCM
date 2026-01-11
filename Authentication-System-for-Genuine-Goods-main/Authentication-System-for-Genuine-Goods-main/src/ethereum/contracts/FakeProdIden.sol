// SPDX-License-Identifier:MIT
pragma solidity ^0.8.23;

contract manufacturerFactory
{
    struct manufacturer
    {
        string id;
        address instance;
    }
    mapping(string => manufacturer) public manufacturersField;

    function createManufacturer(string memory id, string memory brandName) public 
    {
        address newManufacturer = address(new FakeProdIden());
        manufacturersField[brandName] = manufacturer(id,newManufacturer);
    }

    function getManufacturerInstance(string memory brandName) public view returns (address)
    {
        return manufacturersField[brandName].instance;
    }
}

contract FakeProdIden
{

    struct Product
    {
        string productId;
        string name;
        string brandName;
        bool hasmade;
        uint32 consumerCode;
    }

    // This struct is made to check whether product has reached from manufact. to seller
    struct reachSeller 
    {
        string sellerId;    // SellerId
        bool hasReached;    // Whether product has reached from manufac. to seller
    }

    // Struct to store seller Info
    struct SellerInfo{
        string sellerId;
        address sellerAddress;
    }

    mapping(string => reachSeller) public hasReachedToSeller;      // string is the product ID
    mapping(string => bool) public hasReachedToConsumer;     // string is the product ID
    mapping(string => Product) public productStorage;    // Mapping to store product Information
    mapping(string => SellerInfo) public allSellersInfo;  // Mapping to store information of all the sellers
    
    // Function to add Add a product
    function addProduct(string memory id, string memory name, string memory brandName) public
    {
        require(productStorage[id].hasmade == false);
        productStorage[id] = Product(id, name, brandName, true, 0);
    }

    // Function to sell product to seller call by manufacturer
    function sellToSeller(string memory prodId, string memory sellerId) public 
    {
        require(productStorage[prodId].hasmade == true);
        require(hasReachedToSeller[prodId].hasReached == false);
        hasReachedToSeller[prodId].sellerId = sellerId;
        hasReachedToSeller[prodId].hasReached = true; 

    }

    // Function to Add sellers.This will be called by only sellers to add their info
    function addSellers(string memory sellerId) public 
    {
        allSellersInfo[sellerId] = SellerInfo(sellerId, msg.sender);
    }

    // Function to sell product to consumer called by seller
    function sellToConsumer(string memory prodId, uint32 consumerCode) public 
    {
        require(productStorage[prodId].hasmade == true);
        require(hasReachedToConsumer[prodId] == false);
        hasReachedToConsumer[prodId] = true;
        productStorage[prodId].consumerCode = consumerCode;
    }

    // Function to verify authenticity of product
    function productVerification(string memory prodId, uint32 consumerCode) public view returns(bool) 
    {
        // require(hasReachedToSeller[prodId].hasReached == true);
        // require(hasReachedToConsumer[prodId] == true);
        // require(productStorage[prodId].consumerCode == consumerCode);
        // return true;

        if(hasReachedToSeller[prodId].hasReached == true && hasReachedToConsumer[prodId] == true && productStorage[prodId].consumerCode == consumerCode)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

}