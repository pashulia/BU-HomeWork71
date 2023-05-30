import { expect } from 'chai';
import { ethers } from 'hardhat';

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe("homeWork4", function () {
    async function deploy() {
        const [owner1, owner2, user1, user2, otherAccount] = await ethers.getSigners();
        const percent = 5;
        const commission = 0;
        const eth = ethers.utils.parseUnits("1.0", "ether");
        const HomeWork4 = await ethers.getContractFactory("HomeWork4");
        const homeWork4 = await HomeWork4.deploy(percent);
        return { homeWork4, owner1, owner2, user1, user2, otherAccount, percent, commission: commission, eth };
    }

    describe("Deployment", function () {
        it("Check percent", async () => {
            const { homeWork4, percent } = await loadFixture(deploy);
            expect(await homeWork4.percent()).to.equal(percent);
        })
        it("Check owner", async () => {
            const { homeWork4, owner1 } = await loadFixture(deploy);
            let returnOwner = await homeWork4.owner();
            expect(owner1.address).to.equal(returnOwner);
        })
        it("Check commission", async () => {
            const { homeWork4, commission } = await loadFixture(deploy);
            let returnCommission= await homeWork4.commission();
            expect(commission).to.equal(returnCommission);
        })
    });

    describe("AddPayament", function () {
        it("Check change balance", async () => {
            const { homeWork4, owner1, user1, eth } = await loadFixture(deploy);
            await expect(homeWork4.addPayment(user1.address, { value: eth }))
            .to.changeEtherBalances(
                [owner1.address, homeWork4.address],
                [eth.mul(-1), eth]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth, percent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(percent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            let payment = await homeWork4.getPayment(user1.address);
            const expectPayment = { value: eth.sub(commission), target: user2.address };
            const returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
        it("Check change owner commission", async () => {
            const { homeWork4, user1, user2, eth, percent } = await loadFixture(deploy);
            let commissionBefore = await homeWork4.commission();
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(percent);
            const fee = (tmp.sub(eth.mod(100))).div(100); 
            let commissionAfter = await homeWork4.commission();
            expect(commissionBefore.add(fee)).to.equal(commissionAfter);     
        })
    })

    describe("Check SendPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork4, user1, eth } = await loadFixture(deploy);
                const tx = await homeWork4.addPayment(user1.address, { value: eth });
                await tx.wait();
                await expect(homeWork4.addPayment(user1.address))
                .to.revertedWith("You've already made a payment");
            })
        })
        it("Check change balance", async () => {
            const { homeWork4, owner1, user1, user2, eth, percent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            const tmp = eth.mul(percent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            await expect(homeWork4.connect(user2).sendPayment(user1.address))
            .to.changeEtherBalances(
                [user2.address, homeWork4.address],
                [eth.sub(commission), eth.sub(commission).mul(-1)]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth } = await loadFixture(deploy);
            let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait(); 
            tx = await homeWork4.connect(user2).sendPayment(user1.address);
            let payment = await homeWork4.getPayment(user1.address);
            const expectPayment = { value: 0, target: 0 };
            const returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
    })

    describe("SendPayament", function () {
        describe("Require", function () {
            it("Check sendPayament", async () => {
                const { homeWork4, owner1 } = await loadFixture(deploy);
                await expect(homeWork4.sendPayment(owner1.address))
                .to.revertedWith("There are no payments for you");
            })
        })
        it("Check change balance", async () => {
            const { homeWork4, user1, user2, eth, percent } = await loadFixture(deploy);
            const tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait();
            let tmp = eth.mul(percent);
            const commission = (tmp.sub(eth.mod(100))).div(100); 
            await expect(homeWork4.connect(user2).sendPayment(user1.address))
            .to.changeEtherBalances(
                [user2.address, homeWork4.address],
                [eth.sub(commission), eth.sub(commission).mul(-1)]
            )
        })
        it("Check change user payment", async () => {
            const { homeWork4, user1, user2, eth } = await loadFixture(deploy);
            let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
            await tx.wait(); 
            tx = await homeWork4.connect(user2).sendPayment(user1.address);
            let payment = await homeWork4.getPayment(user1.address);
            const expectPayment = { value: 0, target: 0 };
            const returnPayment = { value: payment.value, target: payment.target };
            expect(expectPayment).to.deep.equal(returnPayment);     
        })
        
        describe("Event", function () {
            it("Check Event SendPayment", async () => {
                const { homeWork4, user1, user2, eth, percent } = await loadFixture(deploy); 
                let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
                await tx.wait(); 
                const tmp = eth.mul(percent);
                const fee = (tmp.sub(eth.mod(100))).div(100); 
                await expect(homeWork4.connect(user2).sendPayment(user1.address))
                .to.emit(homeWork4, "SendPayment")
                .withArgs(eth.sub(fee), user1.address, user2.address)
            })
        })

        describe("withdraw", function () {
            describe("Requires", () => {
                it("Check withdraw", async () => {
                    const { homeWork4, otherAccount, user1, user2, eth, percent } = await loadFixture(deploy); 
                    let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
                    await tx.wait();
                    await expect(homeWork4.connect(otherAccount).withdraw())
                    .revertedWith("You are not owner!")
                })
            })
            describe("Withdraw", () => {
                it("Check withdraw change balance", async () => {
                    const { homeWork4, owner1, user1, user2, eth, percent } = await loadFixture(deploy); 
                    let tx = await homeWork4.connect(user1).addPayment(user2.address, { value: eth });
                    await tx.wait();
                    const tmp = eth.mul(percent);
                    const fee = (tmp.sub(eth.mod(100))).div(100);
                    await expect(homeWork4.connect(owner1).withdraw())
                    .changeEtherBalances(
                        [owner1.address, homeWork4.address],
                        [fee, fee.mul(-1)]
                    )
                })
            })
        })
    });
});
