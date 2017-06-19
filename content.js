

// try to read the settings on load
chrome.storage.sync.get(['hourlyWage', 'taxRate'], function(items) {
    if (items['hourlyWage']) {

        var hourlyWage = items.hourlyWage;
        var taxRate = items.taxRate || 0;

        replacePriceWithTime(hourlyWage, taxRate);
    }
});


function replacePriceWithTime(hourlyWage, taxRate) {

    var elements = document.getElementsByTagName('*');

    var currencyRegex = /((\$|£)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)|(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s?€)/gi;
    var re = new RegExp(currencyRegex);

    var hourlyNetWage = hourlyWage - (hourlyWage * (taxRate / 100));
    var hourlyWageInCents = hourlyNetWage * 100;
    var centsPerSecondWage = hourlyWageInCents / (60 * 60);

    var seconds = 0;

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        for (var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];

            if (node.nodeType === 3) {
                var text = node.nodeValue;

                // if doesn't have price then continue to next element
                if (!containsPrice(text)) {
                    continue;
                }

                // extract price
                var priceMatches = text.match(re);

                if (!priceMatches) {
                    continue;
                }

                var elementText = text;

                // replace all matches
                for (var i=0; i < priceMatches.length; i++) {
                    
                    var itemPrice = priceMatches[i];
                    var price = clearPrice(itemPrice);

                    // check if price is valid float
                    if (!isValidPrice(price)) {
                        continue;
                    }

                    var priceInCents = price * 100;

                    var costInSeconds = priceInCents/centsPerSecondWage;

                    var costInTime = formatTime(costInSeconds);

                    elementText = elementText.replace(itemPrice, costInTime);
                }

                if (elementText !== text) {
                    element.replaceChild(document.createTextNode(elementText), node);
                }
                
            }
        }
    }
}

function isValidPrice(price) {
    return !isNaN(parseFloat(price));
}

function clearPrice(price) {
    var result = price.replace('£','').replace('$','').replace('€','').trim();

    // check if comma is used as decimal separator then replace with full stop
    if (result.substring(result.length-3, result.length-2) === ',') {

        // clean thousands separator and replace comma with full stop
        result = result.replace(/\./g,'').replace(/,/g,'.');
    } else if (result.substring(result.length-3, result.length-2) === '.'){
        result = result.replace(/,/g, '');
    } else {
        result = result.replace(/\./g,'').replace(/,/g,'');
    }

    return result;
}

function formatTime(seconds) {
    var years = Math.floor(seconds / (60 * 60 * 24 * 365));
    var days = Math.floor((seconds % (60 * 60 * 24 * 365)) / (60 * 60 * 24));
    var hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((seconds % (60 * 60)) / (60));

    var result = "";
    if (years)
        result += years + "y ";
    if (days)
        result += days + "d ";
    if (hours)
        result += hours + "h ";
    if (minutes)
        result += minutes + "m ";

    return result;
}

function containsPrice(text) {
    return text.indexOf('£') > -1 || text.indexOf('$') > -1 || text.indexOf('€') > -1;
}