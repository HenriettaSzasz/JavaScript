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
        return array
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

let initialInput = '59708072843556858145230522180223745694544745622336045476506437914986923372260274801316091345126141549522285839402701823884690004497674132615520871839943084040979940198142892825326110513041581064388583488930891380942485307732666485384523705852790683809812073738758055115293090635233887206040961042759996972844810891420692117353333665907710709020698487019805669782598004799421226356372885464480818196786256472944761036204897548977647880837284232444863230958576095091824226426501119748518640709592225529707891969295441026284304137606735506294604060549102824977720776272463738349154440565501914642111802044575388635071779775767726626682303495430936326809'
let input = initialInput

input = input.concat(duplicateElements([initialInput], 9999))

let output = FFT(input, 100)

let offset = output

console.log(output)