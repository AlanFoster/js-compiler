export default [
  {
    label: 'Basic Adding',
    value: `
      1 + 2;
    `
  },
  {
    label: 'Defining Functions',
    value: `
      function add(x, y) {
        x + y;
      };

      add(3, 5);
    `
  },
  {
    label: 'Currying',
    value: `
        function add(x) { function(y) { x + y; }; };
        add5 = add(5);
        add12 = add(12);

        add(add12(add5(2)))(3);
    `
  }
];
