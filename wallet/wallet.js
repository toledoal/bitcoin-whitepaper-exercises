"use strict";

var path = require("path");
var fs = require("fs");

var Blockchain = require(path.join(__dirname,"blockchain.js"));

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_1 = fs.readFileSync(path.join(KEYS_DIR,"1.pub.pgp.key"),"utf8");
const PRIV_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.priv.pgp.key"),"utf8");
const PUB_KEY_TEXT_2 = fs.readFileSync(path.join(KEYS_DIR,"2.pub.pgp.key"),"utf8");

var wallet = {
	accounts: {},
};

addAccount(PRIV_KEY_TEXT_1,PUB_KEY_TEXT_1);
addAccount(PRIV_KEY_TEXT_2,PUB_KEY_TEXT_2);

// fake an initial balance in account #1
wallet.accounts[PUB_KEY_TEXT_1].outputs.push(
	{
		account: PUB_KEY_TEXT_1,
		amount: 42,
	}
);

main().catch(console.log);


// **********************************

async function main() {
	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/13
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*amount=*/5
	);

	await spend(
		/*from=*/wallet.accounts[PUB_KEY_TEXT_1],
		/*to=*/wallet.accounts[PUB_KEY_TEXT_2],
		/*amount=*/31
	);

	try {
		await spend(
			/*from=*/wallet.accounts[PUB_KEY_TEXT_2],
			/*to=*/wallet.accounts[PUB_KEY_TEXT_1],
			/*amount=*/40
		);
	}
	catch (err) {
		console.log(err);
	}

	console.log(accountBalance(PUB_KEY_TEXT_1));
	//console.log(accountBalance(PUB_KEY_TEXT_2));
	console.log(await Blockchain.verifyChain(Blockchain.chain));
}

function addAccount(privKey,pubKey) {
	wallet.accounts[pubKey] = {
		privKey,
		pubKey,
		outputs: [],
		inputs: [],
	};
}

async function spend(fromAccount,toAccount,amountToSpend) {

	var trData = {
		inputs: [],
		outputs: [],
	};

	var sortedInputs = fromAccount.outputs.sort((a, b) => a.amount - b.amount );
	//console.log(sortedInputs);
	let inputAmounts = 0;
	for (let input of sortedInputs){
		if (input.amount < amountToSpend) {
			//throw `Don't have enough to spend ${amountToSpend}!`;
			console.log(`Don't have enough to spend ${amountToSpend}!`);
		} else{

		inputAmounts = input.amount - amountToSpend;

		}
	}

	// TODO
	let input = {account: toAccount.pubKey, amount:amountToSpend};
	let output = {account: fromAccount.pubKey, amount:inputAmounts};

	toAccount.inputs.push(input);
	fromAccount.outputs.push(output);

	let inputAuth = Blockchain.authorizeInput(input, fromAccount.privKey);
	let outputAuth = Blockchain.authorizeInput(output, toAccount.privKey);

	let transaction = Blockchain.createTransaction({inputs:[inputAuth], outputs:[outputAuth]});
    
	let bl = Blockchain.createBlock(transaction);
	if (await Blockchain.verifyBlock(bl)){
			Blockchain.insertBlock(bl);
	}
	

}

function accountBalance(account) {

	let sortedOutputs = wallet.accounts[account].outputs.sort((a, b) => a.amount - b.amount );
	let sortedInputs = wallet.accounts[account].inputs.sort((a, b) => a.amount - b.amount );

    let output = sortedOutputs.reduce((ac,output) => {
		return output.amount + ac;
	}, 0);
	let input = sortedInputs.reduce((ac,input) => {
		return ac + input.amount;
	}, 0);
	console.log(sortedOutputs)
	//console.log(wallet.accounts[account].outputs);
	//console.log(`output: ${output}, input: ${input}`);
	return Math.abs(output) - Math.abs(input);
}


