"use strict";

var crypto = require("crypto");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

function createBlock(line){
	let block = {
		index: Blockchain.blocks[Blockchain.blocks.length - 1].index + 1,
		prevHash: Blockchain.blocks[Blockchain.blocks.length - 1].hash,
		data: line,
		timestamp: Date.now()
	}

	Object.assign(block,  {hash: 	blockHash(`${block.index};${block.prevHash};${block.data};${block.timestamp};`).toString()})
	return block;
}



// TODO: insert each line into blockchain
 for (let line of poem) {
	 Blockchain.blocks.push(createBlock(line));
 }


 

console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);

function verifyChain(blockchain){
	let bc = blockchain.blocks;

		for (let b of bc){
			if (!isGenesis(bc[0])){
				if (!verifyBlock(b)){
					return false;
				}
			}
			
		}

		return true;
}

function isGenesis(bc){
  return bc.index === 0 && bc.hash === '000000' ? true : false;
}

function verifyBlock(bl){

	if (typeof bl !== "object"){
		return false;
	}
	if (!bl.data){
		return false;
	} 

	if (!bl.prevHash){
		return false;
	} 

	if (!bl.index >= 0){
		return false;
	} 

	if (bl.hash !== blockHash(bl).toString()){
		return false;
	}
	
	return true;
}


// **********************************

function blockHash(bl) {
	return crypto.createHash("sha256").update(
		bl
	).digest("hex");
}
