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
        this.firstMove = true
        this.round = 'white'
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

                this.table[i][j].addEventListener('click', this.select.bind(this))

                this.piece[i][j] = null
            }
        }
    }

    select(event) {
        let i = event.currentTarget.getAttribute('data-i')
        let j = event.currentTarget.getAttribute('data-j')

        let selectedPiece = this.piece[i][j]
        let selectedSquare = this.table[i][j]
        let isLegalMove = false
        let isYourPiece = false

        if(selectedPiece != null && selectedPiece.node.classList.contains(this.round)){
            isYourPiece = true
        }

        if (selectedSquare.firstChild != null && selectedSquare.firstChild.classList.contains('highlighted') || selectedSquare.classList.contains('highlighted')) {
            isLegalMove = true
        }

        this.removeHighlights()
        if (this.lastSelected != null && (selectedPiece == null || selectedPiece != null && isYourPiece == false)) {
            this.lastSelected.style.backgroundColor = 'transparent'

            let lastI = this.lastSelected.parentNode.getAttribute('data-i')
            let lastJ = this.lastSelected.parentNode.getAttribute('data-j')

            if (isLegalMove == true) {
                this.movePiece(lastI, lastJ, i, j)
                this.round == 'black' ? application.table.firstMove = false : null
                this.round == 'white' ? this.round = 'black' : this.round = 'white'
            }

            this.lastSelected = null
        }
        else if (selectedPiece != null && isYourPiece == true) {
            if (this.lastSelected != null) {
                this.lastSelected.style.backgroundColor = 'transparent'
            }
            this.lastSelected = event.currentTarget.firstChild
            
            event.currentTarget.firstChild.style.backgroundColor = 'yellow'

            let moveTo = this.piece[+i][+j].canMove(+i, +j, this.piece, this.firstMove, this.round)

            this.highlightMove(moveTo)
        }
    }

    highlightMove(positions) {
        positions.forEach(element => {
            let i = element[0]
            let j = element[1]
            if (this.table[i][j].firstChild == null) {
                let div = document.createElement('div')

                div.classList.add('highlighted')

                div.classList.add('square')

                div.style.backgroundColor = 'rgba(255, 255, 0, 0.5)'

                this.table[i][j].appendChild(div)
            }
            else if(this.table[i][j].firstChild.classList.contains(this.round) == false){

                this.table[i][j].classList.add('highlighted')

                this.table[i][j].classList.add('red')

                this.table[i][j].style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
            }
        });
    }

    removeHighlights() {
        let elements = document.getElementsByClassName('highlighted')

        while (elements.length != 0) {
            if(elements[0].classList.contains('red')){
                elements[0].style.backgroundColor = 'transparent'
                elements[0].classList.remove('red')
                elements[0].classList.remove('highlighted')
            }
            else{
                elements[0].parentNode.removeChild(elements[0])
            }
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

    movePiece(fromI, fromJ, toI, toJ) {
        let child = this.table[fromI][fromJ].removeChild(this.table[fromI][fromJ].firstChild)

        if(this.table[toI][toJ].firstChild != null){
            this.table[toI][toJ].removeChild(this.table[toI][toJ].firstChild)
        }

        this.table[toI][toJ].appendChild(child)

        this.piece[toI][toJ] = this.piece[fromI][fromJ]

        this.piece[fromI][fromJ] = null
    }
}

class Piece {
    constructor(square = document.body, color) {
        let className = this.constructor.name.toLowerCase()

        let div = document.createElement('div')

        div.classList.add(color)

        div.classList.add('piece')

        this.node = square.appendChild(div)

        let img = document.createElement('img')

        img.classList.add('image')

        let src = 'https://github.com/HenriettaSzasz/JavaScript/blob/master/Chess%20Game/images/' + color + '_' + className + '.png' + '?raw=true'
        let alt = color + ' ' + className

        img.setAttribute('src', src)
        img.setAttribute('alt', alt)

        this.node.appendChild(img)
    }

    moveDiag(i, j, pieces) {
        let moves = []
        for (let l = i + 1, k = j + 1; l < 8 && k < 8; l++, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null)
                break
        }
        for (let l = i - 1, k = j + 1; l >= 0 && k < 8; l--, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null) 
                break
        }
        for (let l = i - 1, k = j - 1; l >= 0 && k >= 0; l--, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) 
                break
        }
        for (let l = i + 1, k = j - 1; l < 8 && k >= 0; l++, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) 
                break
        }
        return moves
    }

    moveLine(i, j, pieces) {
        let moves = []
        for (let k = j + 1; k < 8; k++) {
            moves.push([i, k])
            if (pieces[i][k] != null)
                break
        }
        for (let k = i + 1; k < 8; k++) { 
            moves.push([k, j])
            if (pieces[k][j] != null) 
                break;
        }
        for (let k = j - 1; k >= 0; k--) {
            moves.push([i, k])
            if (pieces[i][k] != null)
                break
        }
        for (let k = i - 1; k >= 0; k--) {
            moves.push([k, j])
            if (pieces[k][j] != null) 
                break
        }
        return moves
    }
}

class Queen extends Piece {
    canMove(i, j, pieces) {
        return this.moveDiag(i, j, pieces).concat(this.moveLine(i, j, pieces))
    }
}

class King extends Piece {
    canMove(i, j, pieces) {
        let moves = []
        if (j < 7) {
            moves.push([i, j + 1])
        }
        if (j > 0) {
            moves.push([i, j - 1])
        }
        if (i < 7) {
            moves.push([i + 1, j])
        }
        if (i > 0) {
            moves.push([i - 1, j])
        }
        if (j < 7 && i < 7) {
            moves.push([i + 1, j + 1])
        }
        if (j > 0 && i > 0) {
            moves.push([i - 1, j - 1])
        }
        if (i < 7 && j > 0) {
            moves.push([i + 1, j - 1])
        }
        if (i > 0 && j < 7) {
            moves.push([i - 1, j + 1])
        }
        return moves
    }
}

class Bishop extends Piece {
    canMove(i, j, pieces) {
        return this.moveDiag(i, j, pieces)
    }
}

class Knight extends Piece {
    canMove(i, j, pieces) {
        let moves = []
        if (i < 7 && j < 6) {
            moves.push([i + 1, j + 2])
        }
        if (i > 0 && j < 6) {
            moves.push([i - 1, j + 2])
        }
        if (i < 7 && j > 1) {
            moves.push([i + 1, j - 2])
        }
        if (i > 0 && j > 1) {
            moves.push([i - 1, j - 2])
        }
        if (j < 7 && i < 6) {
            moves.push([i + 2, j + 1])
        }
        if (j > 0 && i < 6) {
            moves.push([i + 2, j - 1])
        }
        if (j < 7 && i > 1) {
            moves.push([i - 2, j + 1])
        }
        if (j > 0 && i > 1) {
            moves.push([i - 2, j - 1])
        }
        return moves
    }
}

class Rook extends Piece {
    canMove(i, j, pieces) {
        return this.moveLine(i, j, pieces)
    }
}

class Pawn extends Piece {
    canMove(i, j, pieces, firstMove, round) {
        let moves = []
        if (j < 7 && pieces[i][j + 1] == null && round == 'white') {
            moves.push([i, j + 1])
        }
        if (j > 0 && pieces[i][j - 1] == null && round == 'black') {
            moves.push([i, j - 1])
        }
        if (j < 7 && i < 7 && pieces[i + 1][j + 1] != null  && round == 'white') {
            moves.push([i + 1, j + 1])
        }
        if (j > 0 && i < 7 && pieces[i + 1][j - 1] != null && round == 'black') {
            moves.push([i + 1, j - 1])
        }
        if (j < 7 && i > 0 && pieces[i - 1][j + 1] != null && round == 'white') {
            moves.push([i - 1, j + 1])
        }
        if (j > 0 && i > 0 && pieces[i - 1][j - 1] != null && round == 'black') {
            moves.push([i - 1, j - 1])
        }
        if (firstMove) {
            if (j < 6 && pieces[i][j + 2] == null) {
                moves.push([i, j + 2])
            }
            if (j > 1 && pieces[i][j - 2] == null) {
                moves.push([i, j - 2])
            }
        }
        return moves
    }
}

class Player {
    constructor(name, color) {
        this.name = name
        this.color = color
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

        this.timer.setMaxTime(0)

        this.timer.startTimer(this.table.node)

        setTimeout(() => { this.table.createPieces() }, 1000 * this.timer.maxTime + 2000)

        this.firstPlayer = new Player('firstPlayer', 'white')
        this.secondPlayer = new Player('secondPlayer', 'black')
    }
}

application = new App()

application.startApp()

