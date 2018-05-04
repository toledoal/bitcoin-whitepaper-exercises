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

var difficulty = 10;

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

for (let line of poem) {
	let bl = createBlock(line);
	Blockchain.blocks.push(bl);
	console.log(`Hash (Difficulty: ${difficulty}): ${bl.hash}`);

	difficulty++;
}


// **********************************

function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};

	bl.hash = blockHash(bl);


	return bl;
}

function blockHash(bl) {
	
	let bin = "";
	let hash = "";

	while (bin !== difficulty) 
	{
	let nonce = randomString(4);
	hash = crypto.createHash("sha256").update(JSON.stringify(bl) + nonce).digest("hex");
	let hex = (hash+"").substr(0,4);
	let binary = ConvertBase(hex).from(16).to(2);
	let bon = binary.toString().padEnd(16, '*');
	
	let ban = bon.match(/\*/g);
	bin = ban !== null ? ban.length : 0;//.replace('1','');
	//console.log(ban);
	}
	

	return hash;

}

function hashIsLowEnough(hash) {
	// TODO
}

function verifyBlock(bl) {
	if (bl.data == null) return false;
	if (bl.index === 0) {
		if (bl.hash !== "000000") return false;
	}
	else {
		if (!bl.prevHash) return false;
		if (!(
			typeof bl.index === "number" &&
			Number.isInteger(bl.index) &&
			bl.index > 0
		)) {
			return false;
		}
		if (bl.hash !== blockHash(bl)) return false;
	}

	return true;
}

function verifyChain(chain) {
	var prevHash;
	for (let bl of chain.blocks) {
		if (prevHash && bl.prevHash !== prevHash) return false;
		if (!verifyBlock(bl)) return false;
		prevHash = bl.hash;
	}

	return true;
}

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function hexStringToBinary(str) {
	if (!str) {
	  return new Uint8Array();
	}
	
	var a = [];
	for (var i = 0, len = str.length; i < len; i+=2) {
	  a.push(parseInt(str.substr(i,2),2));
	}
	
	return new(a);
  }


function ConvertBase(num) {
	return {
		from : function (baseFrom) {
			return {
				to : function (baseTo) {
					return parseInt(num, baseFrom).toString(baseTo);
				}
			};
		}
	};
};
	