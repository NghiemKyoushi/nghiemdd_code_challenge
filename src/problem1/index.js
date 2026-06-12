var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    return Array.from({ length: n }, (_, i) => i + 1)
                .reduce((total, num) => total + num, 0);
};

var sum_to_n_c = function(n) {
    let sum = 0;
    while (n > 0) {
        sum += n;
        n--;
    }
    return sum;
};
const testCases = [
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
    { input: 100, expected: 5050 },
];
console.log("--- Start run funtions ---");
testCases.forEach(({ input, expected }, index) => {
    const resA = sum_to_n_a(input);
    const resB = sum_to_n_b(input);
    const resC = sum_to_n_c(input);

    console.log(`Test Case ${index + 1}: input = ${input}`);
    console.log(`  - Expect: ${expected}`);
    console.log(`  - funtion sum_to_n_a:   ${resA} -> ${resA === expected ? 'TRUE' : 'WRONG'}`);
    console.log(`  - funtion sum_to_n_b:   ${resB} -> ${resB === expected ?  'TRUE' : 'WRONG'}`);
    console.log(`  - funtion sum_to_n_c:   ${resC} -> ${resC === expected ?  'TRUE' : 'WRONG'}`);
    console.log("------------------------");
});