import hre, { ethers } from 'hardhat';

async function main() {
    const [acc_1, acc_2] = await ethers.getSigners();
    const targetAddress = acc_2.address;
    const value = 1000;
    const percent = 5; 
    
    const contractAddress = await hre.run("deploy", {
        percent: percent,
        account: acc_1
    })

    console.log("Contract balance: ", await ethers.provider.getBalance(contractAddress), "\n");
    
    console.log("getPayment in script: ", await hre.run("getPayment", {
        contractAddress: contractAddress,
        sender: acc_1.address,
        account: acc_1
    })); 

    console.log("addPayment in script: ", await hre.run("addPayment", {
        contractAddress: contractAddress,
        target: acc_1.address,
        value: 2000,
        account: acc_2
    }));

    console.log("Contract balance: ", await ethers.provider.getBalance(contractAddress), "\n");

    console.log("getPayment in script: ", await hre.run("getPayment", {
        contractAddress: contractAddress,
        sender: acc_2.address,
        account: acc_1
    }));

    console.log("sendPayment in script: ", await hre.run("sendPayment", {
        contractAddress: contractAddress,
        sender: acc_2.address,
        account: acc_1
    }));

    console.log("Contract balance: ", await ethers.provider.getBalance(contractAddress), "\n");

    console.log("getPayment in script: ", await hre.run("getPayment", {
        contractAddress: contractAddress,
        sender: acc_2.address,
        account: acc_1
    }));

    console.log("getPayment in script: ", await hre.run("getPayment", {
        contractAddress: contractAddress,
        sender: acc_1.address,
        account: acc_1
    }));

    console.log("Contract balance: ", await ethers.provider.getBalance(contractAddress), "\n");

    console.log("withdraw in script: ", await hre.run("withdraw", {
        contractAddress: contractAddress,
        account: acc_1
    }));

    console.log("Contract balance: ", await ethers.provider.getBalance(contractAddress));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
