const getElementPosition = (el) => {
  if (el.offsetParent) {
    let { left, top } = getElementPosition(el.offsetParent);
    left += el.offsetLeft;
    top += el.offsetTop;
    return { left, top };
  } else {
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
    };
  }
};

const getElementWidthHeight = (el) => {
  return {
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
};

const createCover = (style, clazz) => {
  const div = document.createElement("div");
  for (let i in style) {
    div.style[i] = style[i] + "px";
  }
  div.className = clazz;
  return div;
};

export { getElementPosition, getElementWidthHeight, createCover };
