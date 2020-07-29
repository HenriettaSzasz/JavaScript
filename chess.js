class Timer {
    constructor(main = document.body) {
        this.maxTime = 5

        let div = document.createElement('div')

        div.classList.add('counter')

        let par = document.createElement('p')

        let counter = main.appendChild(div)

        counter.appendChild(par)

        this.node = main.appendChild(counter)
    }

    startTimer(table) {
        let i = this.maxTime
        this.timer = setInterval(() => {
            this.node.getElementsByTagName('p')[0].innerHTML = i--;
            if (i < 0) {
                this.stopTimer()
                table.style.display = 'block'
                this.node.style.display = 'none'
            }
        }, 1000)
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    setMaxTime(time) {
        this.maxTime = time
    }
}

class Table {
    constructor(main = document.body) {
        let div = document.createElement('div')

        this.node = main.appendChild(div)

        this.node.style.display = 'none'

        this.createSquares()
        this.lastSelected = null
    }

    createSquares() {
        this.table = []
        this.piece = []
        for (let i = 0; i < 8; i++) {

            this.table[i] = []
            this.piece[i] = []

            let div = document.createElement('div')

            div.classList.add('row')

            let row = this.node.appendChild(div)

            for (let j = 0; j < 8; j++) {
                div = document.createElement('div')

                let squareColor = ''
                if ((i + j) % 2 == 0) {
                    squareColor = 'black'
                }
                else {
                    squareColor = 'white'
                }

                div.classList.add(squareColor)

                div.classList.add('square')

                div.setAttribute('data-i', i)

                div.setAttribute('data-j', j)

                this.table[i][j] = row.appendChild(div)

                this.table[i][j].addEventListener('click', this.highlightSelected.bind(this))
            
                this.piece[i][j] = null
            }
        }
    }

    highlightSelected(event) {
        let i = event.currentTarget.getAttribute('data-i')
        let j = event.currentTarget.getAttribute('data-j')

        let selectedPiece = this.piece[i][j]
        this.removeHighlights()

        if (this.lastSelected != null && selectedPiece == null) {
            this.lastSelected.style.backgroundColor = 'transparent'

            let lastI = this.lastSelected.parentNode.getAttribute('data-i')
            let lastJ = this.lastSelected.parentNode.getAttribute('data-j')

            this.movePiece(lastI, lastJ, i, j)

            this.lastSelected = null
        }
        else if (selectedPiece != null) {
            if(this.lastSelected != null){
                this.lastSelected.style.backgroundColor = 'transparent'
            }
            this.lastSelected = event.currentTarget.firstChild
            event.currentTarget.firstChild.style.backgroundColor = 'yellow'

            let moveTo = this.piece[+i][+j].canMove(+i,+j, this.piece)

            this.highlightMove(moveTo)
        }
    }

    highlightMove(positions){
        positions.forEach(element => {
            let i = element[0]
            let j = element[1]
            if(this.table[i][j].firstChild == null){
                let div = document.createElement('div')

                div.classList.add('highlighted')

                div.classList.add('square')

                div.style.backgroundColor = 'rgba(255, 255, 0, 0.5)'

                this.table[i][j].appendChild(div)  
            }
        });
    }

    removeHighlights(){
        let elements = document.getElementsByClassName('highlighted')

        while(elements.length != 0){
            elements[0].parentNode.removeChild(elements[0])
        }
    }

    createPieces() {
        let color = 'white'
        let column = 0
        let column2 = 1
        let i = 2

        while (i > 0) {
            this.piece[0][column] = new Rook(this.table[0][column], color)
            this.piece[1][column] = new Knight(this.table[1][column], color)
            this.piece[2][column] = new Bishop(this.table[2][column], color)
            this.piece[3][column] = new Queen(this.table[3][column], color)
            this.piece[4][column] = new King(this.table[4][column], color)
            this.piece[5][column] = new Bishop(this.table[5][column], color)
            this.piece[6][column] = new Knight(this.table[6][column], color)
            this.piece[7][column] = new Rook(this.table[7][column], color)

            for (let j = 0; j < 8; j++) {
                this.piece[j][column2] = new Pawn(this.table[j][column2], color)
            }

            color = 'black'
            column = 7
            column2 = 6
            i--
        }
    }

    movePiece(fromI, fromJ, toI, toJ){
        let child = this.table[fromI][fromJ].removeChild(this.table[fromI][fromJ].firstChild)
    
        this.table[toI][toJ].appendChild(child)
    }
}

class Piece {
    constructor(square = document.body, color) {
        let className = this.constructor.name

        let div = document.createElement('div')

        div.classList.add('piece')

        this.node = square.appendChild(div)

        let img = document.createElement('img')

        img.classList.add('image')

        let src = color + '_' + className + '.png'
        let alt = color + ' ' + className

        img.setAttribute('src', src)
        img.setAttribute('alt', alt)

        this.node.appendChild(img)
    }

    moveDiag(i,j,pieces){
        let moves = []
        for(let l = i + 1,k = j + 1; l < 8 && k < 8; l++, k++){
            if(pieces[l][k] == null){
                moves.push([l, k])
            }
            else{
               break;
            }
        }
        for(let l = i - 1,k = j + 1; l >= 0 && k < 8; l--, k++){
            if(pieces[l][k] == null){
                moves.push([l, k])
            }
            else{
                break;
            }
        }
        for(let l = i - 1,k = j - 1; l >= 0 && k >= 0; l--, k--){
            if(pieces[l][k] == null){
                moves.push([l, k])
            }
            else{
                break;
            }
        }
        for(let l = i + 1,k = j - 1; l < 8 && k >= 0; l++, k--){
            if(pieces[l][k] == null){
                moves.push([l, k])
            }
            else{
                break;
            }
        }
        return moves
    }

    moveLine(i,j,pieces){
        let moves = []
        for(let k = j + 1; k < 8; k++){
            if(pieces[i][k] == null){
                moves.push([i, k])
            }
            else{
                break;
            }
        }
        for(let k = i + 1; k < 8; k++){
            if(pieces[k][j] == null){
                moves.push([k, j])
            }
            else{
                break;
            }
        }
        for(let k = j - 1; k >= 0; k--){
            if(pieces[i][k] == null){
                moves.push([i, k])
            }
            else{
                break;
            }
        }
        for(let k = i - 1; k >= 0; k--){
            if(pieces[k][j] == null){
                moves.push([k, j])
            }
            else{
                break;
            }
        }
        return moves
    }
}

class Queen extends Piece {
    canMove(i, j, pieces){
        return this.moveDiag(i,j,pieces).concat(this.moveLine(i,j,pieces))
    }
}

class King extends Piece {
    canMove(i, j, pieces){
        let moves = []
        if(j < 7 && pieces[i][j+1] == null){
            moves.push([i, j + 1])
        }
        if(j > 0 && pieces[i][j-1] == null){
            moves.push([i, j - 1])
        }
        if(i < 7 && pieces[i+1][j] == null){
            moves.push([i + 1, j])
        }
        if(i > 0 && pieces[i-1][j] == null){
            moves.push([i - 1, j])
        }
        return moves
    }
}

class Bishop extends Piece {
    canMove(i, j, pieces){        
        return this.moveDiag(i,j,pieces)
    }
}

class Knight extends Piece {
    canMove(i, j, pieces){
        let moves = []
        if(i < 7 && j < 6 && pieces[i+1][j+2] == null){
            moves.push([i + 1, j + 2])
        }
        if(i > 0 && j < 6 && pieces[i-1][j+2] == null){
            moves.push([i - 1, j + 2])
        }
        if(i < 7 && j > 1 && pieces[i+1][j-2] == null){
            moves.push([i + 1, j - 2])
        }
        if(i > 0 && j > 1 && pieces[i-1][j-2] == null){
            moves.push([i - 1, j - 2])
        }
        return moves
    }
}

class Rook extends Piece {
    canMove(i, j, pieces){
        return this.moveLine(i,j,pieces)
    }
}

class Pawn extends Piece {
    canMove(i, j, pieces){
        let moves = []
        if(j < 7 && pieces[i][j+1] == null){
            moves.push([i, j + 1])
            if(j < 6 && pieces[i][j+2] == null){
                moves.push([i, j + 2])
            }
        }
        if(j > 0 && pieces[i][j-1] == null){
            moves.push([i, j - 1])
            if(j > 1 && pieces[i][j-2] == null){
                moves.push([i,j - 2])
            }
        }
        return moves
    }
}

class App {
    constructor() {
        let div = document.createElement('div')

        div.classList.add('main')

        this.main = document.body.appendChild(div)
    }
    startApp() {
        this.table = new Table(this.main)

        this.timer = new Timer(this.main)

        this.timer.setMaxTime(1)

        this.timer.startTimer(this.table.node)

        setTimeout(() => { this.table.createPieces() }, 1000 * this.timer.maxTime + 2000)
    }
}

application = new App()

application.startApp()

