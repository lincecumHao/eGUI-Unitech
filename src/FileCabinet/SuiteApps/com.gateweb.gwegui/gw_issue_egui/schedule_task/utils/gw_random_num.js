/**
 *String Invoice Tool
 *gw_random_num.js
 *@NApiVersion 2.0
 */
define([], function () {
   
  function genHash(stringValue) {
    var hash = 7, i, chr;
    if (stringValue.length === 0) return hash
    for (i = 0; i < stringValue.length; i++) {
      chr = stringValue.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0 
    }
    return hash
  }
   
  function padding(str, length) {
    return (Array(length).join('0') + str).slice(-length)
  }

  //eguiNumber = 'AA12345678' , sellerTaxId = '24549210';
  function getRandomNum(eguiNumber, sellerTaxId) {
    var eguiNumberStr = eguiNumber + ''
    var sellerTaxIdStr = sellerTaxId + ''
    var randomNumber = (Math.abs(genHash(eguiNumberStr + sellerTaxIdStr)) % 10000).toString();
  
    randomNumber=padding(randomNumber, 4);

    return randomNumber
  } 
  
  return { 
	getRandomNum: getRandomNum 
  }
})