import microsoftBrowser from './microsoftBrowser';

export default function transform(x, y) {
  const props = {};
  const isStyle = !microsoftBrowser;
  const px = isStyle ? 'px' : '';

  if (microsoftBrowser) {
    props.transform = `translate(${x}${px}, ${y}${px})`;
  }
  else {
    props.style = {transform: `translate(${x}${px}, ${y}${px})`};
  }

  return props;
}