
function merge(left, right, bLargerThanA)
{
    var result = [];

    while (left.length && right.length) {
        if (bLargerThanA(left[0],right[0])) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}

function mergeSort(arr, bLargerThanA)
{
    if (arr.length < 2)
        return arr;

    let middle = parseInt(arr.length / 2);
    let left   = arr.slice(0, middle);
    let right  = arr.slice(middle, arr.length);

    return merge(mergeSort(left, bLargerThanA), mergeSort(right, bLargerThanA), bLargerThanA);
};

module.exports = mergeSort;
