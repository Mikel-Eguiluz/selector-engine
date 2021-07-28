/*The tests provided in the exercise could be completed with a much simpler engine than this, but then again, a selection engine that does not account for descendant selectors is probably not worth the name. I decided to implement that functionality and devised a couple tests for that purpose (Note that I had to slightly modify Test.html, namely defering the load of the js scripts and adding a couple nodes).

The engine is far from perfect and it does not support the following non-exhaustive list:
  Combinators other than the descendant combinator: (>, ~ , + ).
  Attribute selector: [attr].
  pseudo-classes and pseudo-elemnts.
  
I decided to use modern javaScript where possible, substituted var for let, if backwards compatibility is an issue, it can be easily transpiled

The full project is available at https://github.com/Mikel-Eguiluz/selector-engine
*/

/**
 * Function to select elements from a CSS selector string
 * @param {string} selector - the CSS selector string
 * @returns {array} - The elements found by that selector
 */

const $ = function (selector) {
  let elements = [];
  // get descendant parts of the chain
  let selectors = selector.split(" ");
  // split adjacent/compound selectors into sub-arrays
  selectors = selectors.map((selector) => {
    if (selector.search(/(?=[\.#])/g)) {
      return selector.split(/(?=[\.#])/g); // to transform 'div.class#id' into ['div', '.class' , #id]
    }
    return [selector]; // if singles, like 'li' then put in array
  });
  // For '.div#one li.classy p', selectors now looks like [['.div', '#one'], ['li', '.classy'], ['p']]

  // loop through the selector to find elements
  selectors.forEach((selectorGroup, i) => {
    if (i === 0) {
      elements.push(...select(selectorGroup)); // get initial elements. The test questions use this one because there are no descendants, (If no element is passed to select(), it defaults to document)
    } else {
      // Now loop and drill for descendants, replacing parent nodes
      elements = [...elements.map((el) => select(selectorGroup, el))].flat();
    }
  });
  return elements;
};

/**
 * Function to select elements from a single selector
 * @param {array} group - Representation of a string selector. e.g. .div#thing, a compound selector, is represented as ['.div', '#thing']. ['.thing'] represents a single selector
 * @param {DOMNode} targetNode - The element to be scanned
 * @returns {array} - The elements found by that selector
 */
const select = (group = [], targetNode = document) => {
  // console.log(targetNode, group);
  const isSingleSelector = group.length === 1;
  let _els = []; // place to hold elements while we 'filter down'
  for (const [i, selector] of group.entries()) {
    const firstCharacter = selector[0];
    const label = selector.slice(1);
    switch (firstCharacter) {
      case "#": {
        if (i === 0) {
          // Find nodes
          const el = targetNode.getElementById(label);
          // if this is a single selector we bail
          if (isSingleSelector) {
            return [el];
          }
          // ...otherwise we add to temp aray
          if (el) _els.push(el);
        } else {
          // Now, with the next parts of the selector, filter the array
          _els = _els.filter((el) => el.id === label);
        }
        break;
      }
      case ".": {
        if (i === 0) {
          const els = targetNode.getElementsByClassName(label);
          if (isSingleSelector) {
            return els;
          }
          if (els) _els.push(...els);
        } else {
          _els = _els.filter((el) => el.classList.contains(label));
        }
        break;
      }
      default: {
        if (i === 0) {
          const els = Array.from(targetNode.getElementsByTagName(selector));
          if (isSingleSelector) {
            return els;
          }
          if (els) _els.push(...els);
        } else {
          _els = _els.filter(({ tagName }) => tagName === selector);
        }
      }
    }
  }
  // Return the fndings of one adjacent selector

  return _els;
};

// Bit of a "test suite" to check if the engine can deal with descendant selectors (note that I had to defer the script load and make some changes to the html), check changes at https://github.com/Mikel-Eguiluz/selector-engine/blob/main/Test.html

function test(query) {
  console.log("--------------------------------");
  console.log("testing Query: " + query);
  console.log("EXPECTED ", Array.from(document.querySelectorAll(query)));
  console.log("--GOT--  ", $(query));
}

test("div ul li.lorem");
test("div ul li#liid");
test("div>ul li#liid"); //this will fail
