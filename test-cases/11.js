// 11. Hard - Boat

const inputDataSets = [
    "3\nSheep\nSheep\nSheep\n",
    "8\nSheep\n-\nHoly Basil\nSheep\nDog\n-\nSheep\n",
    "6\nSheep\n-\nDog\n-\n",
    "5\nDog\n",
    "5\nSheep\n-\nDog\nSheep\nHoly Basil\n",
]

const expectedOutputs = [
    "No!\n",
    "Yes!\n",
    "No! Dog Eat Sheep\n",
    "No! Sheep Eat Holy Basil\n",
    "No!\n",
]

module.exports = { inputDataSets, expectedOutputs }