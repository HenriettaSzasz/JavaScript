let duplicateElements = function(array, times) {
    return array.reduce((res, current) => {
        return res.concat(Array(times).fill(current));
    }, []);
  } // ?? stackoverflow

let initial = [0, 1, 0, -1]
let FFT = function(array, phase){
    let newArray = ''
    let n = array.length
    if(0 == phase){
        console.log(array)
        return 0
    }
    for(let i  = 0; i < n; i++){
        let sum = 0
        pattern = duplicateElements(initial, i+1)
        for(let j = 0, k = 1; j < n; j++){
            if(pattern.length - 1 < k){
                k = 0
            }
            sum += array.charAt(j)*pattern[k++]
        }
        newArray += String(sum).charAt(String(sum).length - 1)
    }
    FFT(newArray, phase - 1)
}
FFT("12345678", 1)
