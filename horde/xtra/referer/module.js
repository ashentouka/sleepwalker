{
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const UPPERCASE = lowercase.toUpperCase();
	const alphabetical = lowercase+UPPERCASE;
	const numeric = "0123456789";
	const alphanumeric = numeric + alphabetical;

	function getRandomInt(max) {
	  return Math.floor(Math.random() * max);
	}

	function generate(from, chars) {
		let str = "";
		while (str.length < chars) {
			str += from[getRandomInt(from.length)]
		}
		return str;
	}

	const weighted = {
		10: function() {
			return "https://mail.google.com/mail/u/0/#inbox/" + generate(UPPERCASE, 1) + generate(alphabetical, 34);
		},
		5: function() {
			return "https://mail.proton.me/u/2/inbox/" + generate(alphanumeric, 21) + "_" + generate(alphanumeric, 15) + "_" + generate(alphanumeric, 9) +
			 "_" + generate(alphanumeric, 38) + "=="
		},
		13: function() {
			return "https://www.facebook.com/groups/feed/"
		},
		20: function() {
			return "https://www.instagram.com/direct/inbox/"
		},
		35: function() {
			return "https://www.tiktok.com/foryou"
		},
		17: function() {
			return "https://web.snapchat.com"
		}
	}

	module.exports = ()=>{
		let value = getRandomInt(100);
		let total = 0;
		for (let key in weighted){
			total += parseInt(key);
			if (value < total) {
				return weighted[key]()
			}
		}
	}
}