// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

contract HomeWork4 {

    struct Payment{
        uint256 value;
        address target;
    }

    uint256 public commission;
    uint256 public percent;
    address payable public owner;

    mapping(address => Payment) payments;

    event AddPayment(uint256 value, address sender, address target);
    event SendPayment(uint256 value, address sender, address target);

    constructor(uint256 _percent) {
        owner = payable(msg.sender);
        percent = _percent;
    }

    function addPayment(address target) public payable {
        // console.log("Contract: addPayment, msg.sender: ", msg.sender);
        require(payments[msg.sender].value == 0, "You've already made a payment");
        uint256 fee = msg.value * percent / 100;
        payments[msg.sender] = Payment(msg.value - fee, target);
        commission += fee;
        emit AddPayment(msg.value - fee, msg.sender, target);
    }

    function sendPayment(address sender) public returns(bool) {
        // console.log("Contract: sendPayment, msg.sender: ", msg.sender);
        Payment memory payment = payments[sender];
        require(payment.target == msg.sender, "There are no payments for you");
        bool successful = payable(payment.target).send(payment.value);
        delete payments[sender];
        emit SendPayment(payment.value, sender, payment.target);
        return successful;
    }

    function withdraw() public {
        require(msg.sender == owner, "You are not owner!");
        uint256 _commission = commission;
        commission = 0;
        owner.transfer(_commission);
    }

    function getPayment(address sender) public view returns(Payment memory){
        return payments[sender];
    }
}