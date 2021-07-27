/*decided to use modern javaScript where possible, substituted var for const, if backwards compatibility is an issue, it can be easily transpiled*/

const $ = function (selector) {
  let elements = [];

  //Split the selectors. First separate by space, getting all the descendant selectors
  const selectors = selector.split(" ");
  selectors.forEach((descendant, i) => {
    //now, nested in that array another a array with  classnames, tagname and id, the aray should look like [[parent],[descendantTagName, descendantID, descendantClassName],etc]
    selectors[i] = descendant.split(/(?=[\.#])/g);
  });
  // console.log(selectors);
  let currentElements = [document];
  selectors.forEach((adjacentSelectorGroup) => {
    console.log("current elements", currentElements);
    let res = [];
    currentElements.forEach((parent) => {
      res = checkAdjacentSelectors(adjacentSelectorGroup, parent);
      console.log(
        parent,
        checkAdjacentSelectors(adjacentSelectorGroup, parent),
      );
      currentElements.concat(res);
      //console.log(adjacentSelectorGroup, parent);
      //need to constructthe array of parents here, to pass it to the next iteration
    });
    //AAAAAAAAAAAAAAAAAAAAAAAAAARGGGGH!!
    elements = res;
  });
  return elements;
};

function checkAdjacentSelectors(selectors, parents) {
  let result = [];
  selectors.forEach((sel, i) => {
    if (i === 0) {
      result = singleSelector(sel, parents);
    } else {
      //filter out the elements that do not satisfy all the conditions
      result = result.filter((e) => singleSelector(sel, parents).includes(e));
    }
  });
  return result;
}

function singleSelector(string, element) {
  const name = string.slice(1);
  switch (string[0]) {
    case "#":
      //console.log("in ID " + string, element);
      //element.getElementById() does not exist, only document has that method
      if (element === document) {
        return [document.getElementById(name)];
      } else if (element.id === name) {
        return [element];
      }
      return [];
    case ".":
      //console.log("in class " + string, element);
      return Array.from(element.getElementsByClassName(name));
    default:
      //console.log("in tagName " + string, element);
      console.log("error here", element);
      return Array.from(element.getElementsByTagName(string));
  }
}

// bit of a test suite to check if the engine can deal with descendant selectors (note that I had to defer the script load and make some changes to the html)

function test(query) {
  console.log("--------------------------------");
  console.log("EXPECTED ", Array.from(document.querySelectorAll(query)));
  console.log("--GOT--  ", $(query));
}

test("div ul li.lorem");
