//import microsoftBrowser from './microsoftBrowser';

export default function transform(x, y) {
  let props;
  const isStyle = false; // !microsoftBrowser;
  const px = isStyle ? 'px' : '';
  const transform = `translate(${x}${px}, ${y}${px})`;

  if (isStyle) {
    props = {style : {transform}};
  }
  else {
    props = {transform};
  }

  return props;
}