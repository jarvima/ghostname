console.log('max int:', Number.MAX_SAFE_INTEGER);

var value = [12, 11, 10, 9, 8, 7, 6].some(function(num) {
  console.log('testing:', num);
  return num < 6;
});

console.log('value:', value);
