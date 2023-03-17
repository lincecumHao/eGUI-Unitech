/**
 *String Utility Tool
 *gwStringUtility.js
 *@NApiVersion 2.x
 */
define(['N/format'], function (format) {
  //字串補0
  function padding(str, length) {
    return (Array(length).join('0') + str).slice(-length)
  }

  function test1(str, length) {
    return (Array(length).join('0') + str).slice(-length)
  }

  function trim(str) {
    if (typeof str === 'undefined' || str == null || str.length == 0) {
      str = ''
    }
    if (typeof str === 'string') str = str.trim()
    return str
  }

  function trimOrAppendBlank(str) {
    if (typeof str === 'undefined' || str == null || str.length == 0) {
      str = ' '
    } else {
      if (typeof str === 'string') str = str.trim()
    }
    return str
  }

  function convertToFloat(str) {
    if (typeof str === 'undefined' || str == null || str.length == 0) {
      str = '0'
    } else {
      if (typeof str === 'string') str = str.trim()
      else str.toString()
    }
    return parseFloat(str)
  }
  
  function eToNumber(num) {
	  var sign = "";
	  (num += "").charAt(0) == "-" && (num = num.substring(1), sign = "-");
	  var arr = num.split(/[e]/ig);
	  if (arr.length < 2) return sign + num;
	  var dot = (.1).toLocaleString().substr(1, 1), n = arr[0], exp = +arr[1],
		  w = (n = n.replace(/^0+/, '')).replace(dot, ''),
		pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
		L   = pos - w.length, s = "" + BigInt(w);
		w   = exp >= 0 ? (L >= 0 ? s + "0".repeat(L) : r()) : (pos <= 0 ? "0" + dot + "0".repeat(Math.abs(pos)) + s : r());
	  L= w.split(dot); if (L[0]==0 && L[1]==0 || (+w==0 && +s==0) ) w = 0; 
	  return sign + w;
	  function r() {return w.replace(new RegExp('^(.{${pos}})(.)'), '$1${dot}$2')}
  }

  function convertToInt(str) {
    if (typeof str === 'undefined' || str == null || str.length == 0) {
      str = '0'
    } else {
      if (typeof str === 'string') str = str.trim()
      else str.toString()
    }
    return parseInt(str)
  }

  //中文字長度檢查
  function checkByteLength(str) {
    // returns the byte length of an utf8 string
    var s = str.length
    for (var i = str.length - 1; i >= 0; i--) {
      var code = str.charCodeAt(i)
      if (code > 0x7f && code <= 0x7ff) s++
      else if (code > 0x7ff && code <= 0xffff) s += 2
      if (code >= 0xdc00 && code <= 0xdfff) i-- //trail surrogate
    }
    return s
  }

  return {
    trim: trim,
    checkByteLength: checkByteLength,
    convertToFloat: convertToFloat,
    convertToInt: convertToInt,
    trimOrAppendBlank: trimOrAppendBlank,
    padding: padding,
	eToNumber: eToNumber,
    test1: test1,
  }
})
