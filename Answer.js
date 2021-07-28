/*decided to use modern javaScript where possible, substituted var for const, if backwards compatibility is an issue, it can be easily transpiled*/

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
  // loop thrugh the selector to find els
  selectors.forEach((selectorGroup, i) => {
    if (i === 0) {
      elements.push(...select(selectorGroup)); // get initial elements. The test questions use this one because there are no descendants, (if no element is passed to select, it defaults to document)
    } else {
      // Now loop and drill for descendants, replacing parent nodes (similar to inside the select function but we replace...)
      elements = [...elements.map((el) => select(selectorGroup, el))].flat();
    }
  });

  // console.log("returning ", elements);

  return elements;
};

const select = (group = [], targetNode = document) => {
  // console.log(targetNode, group);
  const isSingleSelector = group.length === 1;
  let _els = []; // place to hold elements whilst we 'filter down'
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

// bit of a test suite to check if the engine can deal with descendant selectors (note that I had to defer the script load and make some changes to the html)

function test(query) {
  console.log("--------------------------------");
  console.log("testing Query" + "");
  console.log("EXPECTED ", Array.from(document.querySelectorAll(query)));
  console.log("--GOT--  ", $(query));
}

test("div ul li.lorem");
test("div ul li#liid");
test("div>ul li#liid");
