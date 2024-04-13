// 4. Glass

const inputDataSets = [
    "3\n0\n",
    "4\n2\n",
    "5\n4\n",
    "2\n1\n",
]

const expectedOutputs = [
    "\\       /\n  \\     /\n   \\---/\n",
    "\\         /\n\\       /\n\\^^^^^/\n\\---/",
    "\\           /\n\\^^^^^^^^^/\n\\       /\n\\     /\n\\---/",
    "\\     /\n\\---/",

]

module.exports = { inputDataSets, expectedOutputs }