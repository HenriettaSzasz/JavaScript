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
        const event = new Event('timesUp');
        let i = this.maxTime
        this.timer = setInterval(() => {
            this.node.getElementsByTagName('p')[0].innerHTML = i--;
            if (i < 0) {
                this.stopTimer()
                this.node.style.display = 'none'
                table.dispatchEvent(event)
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
    constructor(main = document.body, backup) {
        let div = document.createElement('div')

        this.node = main.appendChild(div)

        this.node.addEventListener('timesUp', () => {
            this.createPieces()
            this.createBoard(main)

            if (backup.length > 0)
                this.doBackup(backup)

            this.node.style.display = 'block'
            this.board.style.display = 'flex'
        })

        this.node.style.display = 'none'

        this.createSquares()
        this.lastSelected = null

        this.round = 'white'

        this.kingsPosition = { 'white': [4, 0], 'black': [4, 7] }

        this.backup = backup

        this.lastTaken = null
        this.lastTakenPiece = null
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

        if (selectedPiece != null && selectedPiece.node.classList.contains(this.round)) {
            isYourPiece = true
        }

        if (selectedSquare.firstChild != null && selectedSquare.firstChild.classList.contains('highlighted') || selectedSquare.classList.contains('highlighted')) {
            isLegalMove = true
        }

        this.removeHighlights()
        if (this.lastSelected != null && (selectedPiece == null || selectedPiece != null && isYourPiece == false)) {
            this.lastSelected.style.backgroundColor = 'transparent'

            if (isLegalMove == true) {
                if (this.piece[this.lastI][this.lastJ] instanceof King) {
                    this.kingsPosition[this.round] = [i, j]
                }
                let currentPiece = null
                if (this.piece[i][j] != null)
                    currentPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[i][j])), this.piece[i][j])

                let lastPiece = null

                if (this.piece[this.lastI][this.lastJ] != null)
                    lastPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[this.lastI][this.lastJ])), this.piece[this.lastI][this.lastJ])

                this.piece[i][j] = lastPiece
                this.piece[this.lastI][this.lastJ] = null

                if (this.check() == false) {

                    this.movePiece(this.lastI, this.lastJ, i, j)

                    if (this.checkMate()) {
                        this[this.round == 'white' ? 'firstPlayer' : 'secondPlayer'].won();
                    }
                    else if (currentPiece != null) {
                        this.lastTakenPiece = currentPiece
                        this.round == 'white' ? this.firstPlayer.addScore(currentPiece.getPoints()) : this.secondPlayer.addScore(currentPiece.getPoints())
                    }
                    else {
                        this.lastTakenPiece = null
                    }

                    this.piece[i][j].firstMove = false

                    this.changePlayer()

                    this.backup[0] = [this.round, this.firstPlayer.score, this.secondPlayer.score]

                    this.backup.push([this.lastI, this.lastJ, i, j])

                    localStorage.setItem('savedMoves', JSON.stringify(this.backup))

                    document.getElementsByClassName('undo')[0].disabled = false
                }
                else {
                    if (lastPiece instanceof King) {
                        this.kingsPosition[this.round] = [this.lastI, this.lastJ]
                    }

                    this.piece[i][j] = currentPiece
                    this.piece[this.lastI][this.lastJ] = lastPiece
                }
            }

            this.lastSelected = null
        }
        else if (selectedPiece != null && isYourPiece == true) {
            if (this.lastSelected != null) {
                this.lastSelected.style.backgroundColor = 'transparent'
            }
            this.lastSelected = this.piece[i][j].node

            this.lastI = i
            this.lastJ = j

            event.currentTarget.firstChild.style.backgroundColor = 'yellow'

            let moveTo = this.piece[i][j].canMove(+i, +j, this.piece, this.round)

            this.highlightMove(moveTo)
        }
    }

    checkMate() {
        let oponent = this.round == 'white' ? 'black' : 'white'

        this.round = oponent

        let isCheckMate = true

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.piece[i][j] != null && this.piece[i][j].node.classList.contains(oponent)) {
                    let moves = this.piece[i][j].canMove(i, j, this.piece, oponent)

                    moves.forEach(el => {

                        let currentPiece = null
                        let lastPiece = null

                        if (this.piece[i][j] != null)
                            lastPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[i][j])), this.piece[i][j])

                        if (this.piece[el[0]][el[1]] != null)
                            currentPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[el[0]][el[1]])), this.piece[el[0]][el[1]])

                        this.piece[i][j] = null
                        this.piece[el[0]][el[1]] = lastPiece

                        if (lastPiece instanceof King) {
                            this.kingsPosition[this.round] = [el[0], el[1]]
                        }

                        if (this.check() == false) {
                            isCheckMate = false
                        }

                        if (lastPiece instanceof King) {
                            this.kingsPosition[this.round] = [i, j]
                        }

                        this.piece[i][j] = lastPiece
                        this.piece[el[0]][el[1]] = currentPiece
                    })
                }
            }
        }

        oponent == 'white' ? this.round = 'black' : this.round = 'white'

        return isCheckMate
    }

    check() {
        let oponent = ''
        this.round == 'white' ? oponent = 'black' : oponent = 'white'
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let element = this.piece[i][j]
                if (element != null && element.node.classList.contains(oponent)) {
                    let moves = element.canMove(i, j, this.piece, oponent)
                    let check = false
                    moves.forEach(el => {
                        if (el[0] == this.kingsPosition[this.round][0] && el[1] == this.kingsPosition[this.round][1]) {
                            check = true
                        }
                    })
                    if (check) {
                        return true
                    }
                }
            }
        }
        return false
    }

    movePiece(fromI, fromJ, toI, toJ) {
        let child = this.table[fromI][fromJ].removeChild(this.table[fromI][fromJ].firstChild)

        if (this.table[toI][toJ].firstChild != null) {
            this.lastTaken = this.table[toI][toJ].removeChild(this.table[toI][toJ].firstChild)
        }
        else {
            this.lastTaken = null
        }

        this.table[toI][toJ].appendChild(child)
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
            else if (this.table[i][j].firstChild.classList.contains(this.round) == false) {

                this.table[i][j].classList.add('highlighted')

                this.table[i][j].classList.add('red')

                this.table[i][j].style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
            }
        });
    }

    removeHighlights() {
        let elements = document.getElementsByClassName('highlighted')

        while (elements.length != 0) {
            if (elements[0].classList.contains('red')) {
                if (elements[0].classList.contains('white'))
                    elements[0].style.backgroundColor = 'whitesmoke'
                if (elements[0].classList.contains('black'))
                    elements[0].style.backgroundColor = 'gray'
                elements[0].classList.remove('red')
                elements[0].classList.remove('highlighted')
            }
            else {
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

    createBoard(main = document.body) {
        let div = document.createElement('div')

        div.classList.add('board')

        this.board = main.appendChild(div)

        this.board.style.display = 'none'

        this.firstPlayer = new Player(this.board, 'firstPlayer', 'white')
        this.secondPlayer = new Player(this.board, 'secondPlayer', 'black')

        this.firstPlayer.node.style.transform = 'scale(1.2)'
        this.secondPlayer.node.style.transform = 'scale(0.9)'
    }

    changePlayer() {
        if (this.round == 'white') {
            this.round = 'black'
            this.firstPlayer.node.style.transform = 'scale(0.8)'
            this.secondPlayer.node.style.transform = 'scale(1.2)'
        }
        else {
            this.round = 'white'
            this.secondPlayer.node.style.transform = 'scale(0.9)'
            this.firstPlayer.node.style.transform = 'scale(1.2)'
        }
    }

    doBackup(moves) {
        moves.forEach((element, index) => {
            if (index == 0) {
                this.round = element[0]
                this.firstPlayer.addScore(element[1])
                this.secondPlayer.addScore(element[2])
            }
            else {
                let fromI = element[0]
                let fromJ = element[1]
                let toI = element[2]
                let toJ = element[3]

                this.movePiece(fromI, fromJ, toI, toJ)
                this.piece[toI][toJ] = this.piece[fromI][fromJ]
                this.piece[fromI][fromJ] = null
                this.piece[toI][toJ].firstMove = false

                if (this.piece[toI][toJ] instanceof King) {
                    this.kingsPosition[this.piece[toI][toJ].color] = [toI, toJ]
                }
            }

        })
    }

    undo() {
        if (this.backup.length == 0)
            return

        let fromI = this.backup[this.backup.length - 1][2]
        let fromJ = this.backup[this.backup.length - 1][3]
        let toI = this.backup[this.backup.length - 1][0]
        let toJ = this.backup[this.backup.length - 1][1]

        let child = this.table[fromI][fromJ].removeChild(this.table[fromI][fromJ].firstChild)

        this.table[toI][toJ].appendChild(child)

        this.piece[toI][toJ] = this.piece[fromI][fromJ]
        this.piece[fromI][fromJ] = null
        this.piece[toI][toJ].firstMove = false

        if (this.piece[toI][toJ] instanceof King) {
            this.kingsPosition[this.piece[toI][toJ].color] = [toI, toJ]
        }

        this.round = this.round == 'white' ? 'black' : 'white'

        if (this.lastTaken != null) {
            this.table[fromI][fromJ].appendChild(this.lastTaken)

            this.piece[fromI][fromJ] = this.lastTakenPiece

            this[this.lastTakenPiece.color == 'black' ? 'firstPlayer' : 'secondPlayer'].addScore(-this.lastTakenPiece.getPoints())

            this.lastTaken = null
            this.lastTakenPiece = null
        }

        if ((toJ == 1 || toJ == 6) && this.piece[toI][toJ] instanceof Pawn) {
            this.piece[toI][toJ].firstMove = true
        }

        document.getElementsByClassName('undo')[0].disabled = true
    }
}

class Piece {
    constructor(square = document.body, color) {
        let className = this.constructor.name.toLowerCase()

        let div = document.createElement('div')

        div.classList.add(color)

        div.classList.add('piece')

        this.node = square.appendChild(div)

        this.color = color

        let img = document.createElement('img')

        img.classList.add('image')

        let src = 'https://github.com/HenriettaSzasz/JavaScript/blob/master/Chess%20Game/images/' + color + '_' + className + '.png' + '?raw=true'
        let alt = color + ' ' + className

        img.setAttribute('src', src)
        img.setAttribute('alt', alt)

        this.node.appendChild(img)
    }

    moveDiag(i, j, pieces, round) {
        let moves = []
        for (let l = i + 1, k = j + 1; l < 8 && k < 8; l++, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i - 1, k = j + 1; l >= 0 && k < 8; l--, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i - 1, k = j - 1; l >= 0 && k >= 0; l--, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i + 1, k = j - 1; l < 8 && k >= 0; l++, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        return moves
    }

    moveLine(i, j, pieces, round) {
        let moves = []
        for (let k = j + 1; k < 8; k++) {
            moves.push([i, k])
            if (pieces[i][k] != null) {
                if (pieces[i][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = i + 1; k < 8; k++) {
            moves.push([k, j])
            if (pieces[k][j] != null) {
                if (pieces[k][j].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = j - 1; k >= 0; k--) {
            moves.push([i, k])
            if (pieces[i][k] != null) {
                if (pieces[i][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = i - 1; k >= 0; k--) {
            moves.push([k, j])
            if (pieces[k][j] != null) {
                if (pieces[k][j].color == round)
                    moves.pop()
                break
            }
        }
        return moves
    }
}

class Queen extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveDiag(i, j, pieces, round).concat(this.moveLine(i, j, pieces, round))
    }
    getPoints() {
        return 9
    }
}

class King extends Piece {
    canMove(i, j, pieces, round) {
        let moves = []
        if (j < 7) {
            if (pieces[i][j + 1] == null || (pieces[i][j + 1] != null && pieces[i][j + 1].color != round))
                moves.push([i, j + 1])
        }
        if (j > 0) {
            if (pieces[i][j - 1] == null || (pieces[i][j - 1] != null && pieces[i][j - 1].color != round))
                moves.push([i, j - 1])
        }
        if (i < 7) {
            if (pieces[i + 1][j] == null || (pieces[i + 1][j] != null && pieces[i + 1][j].color != round))
                moves.push([i + 1, j])
        }
        if (i > 0) {
            if (pieces[i - 1][j] == null || (pieces[i - 1][j] != null && pieces[i - 1][j].color != round))
                moves.push([i - 1, j])
        }
        if (j < 7 && i < 7) {
            if (pieces[i][j + 1] == null || (pieces[i][j + 1] != null && pieces[i][j + 1].color != round))
                moves.push([i, j + 1])
        }
        if (j > 0 && i > 0) {
            if (pieces[i - 1][j - 1] == null || (pieces[i - 1][j - 1] != null && pieces[i - 1][j - 1].color != round))
                moves.push([i - 1, j - 1])
        }
        if (i < 7 && j > 0) {
            if (pieces[i + 1][j - 1] == null || (pieces[i + 1][j - 1] != null && pieces[i + 1][j - 1].color != round))
                moves.push([i + 1, j - 1])
        }
        if (i > 0 && j < 7) {
            if (pieces[i - 1][j + 1] == null || (pieces[i - 1][j + 1] != null && pieces[i - 1][j + 1].color != round))
                moves.push([i - 1, j + 1])
        }
        return moves
    }
}

class Bishop extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveDiag(i, j, pieces)
    }
    getPoints() {
        return 3
    }
}

class Knight extends Piece {
    canMove(i, j, pieces, round) {
        let moves = []
        if (i < 7 && j < 6 && (pieces[i + 1][j + 2] == null || (pieces[i + 1][j + 2] != null && pieces[i + 1][j + 2].color != round))) {
            moves.push([i + 1, j + 2])
        }
        if (i > 0 && j < 6 && (pieces[i - 1][j + 2] == null || (pieces[i - 1][j + 2] != null && pieces[i - 1][j + 2].color != round))) {
            moves.push([i - 1, j + 2])
        }
        if (i < 7 && j > 1 && (pieces[i + 1][j - 2] == null || (pieces[i + 1][j - 2] != null && pieces[i + 1][j - 2].color != round))) {
            moves.push([i + 1, j - 2])
        }
        if (i > 0 && j > 1 && (pieces[i - 1][j - 2] == null || (pieces[i - 1][j - 2] != null && pieces[i - 1][j - 2].color != round))) {
            moves.push([i - 1, j - 2])
        }
        if (j < 7 && i < 6 && (pieces[i + 2][j + 1] == null || (pieces[i + 2][j + 1] != null && pieces[i + 2][j + 1].color != round))) {
            moves.push([i + 2, j + 1])
        }
        if (j > 0 && i < 6 && (pieces[i + 2][j - 1] == null || (pieces[i + 2][j - 1] != null && pieces[i + 2][j - 1].color != round))) {
            moves.push([i + 2, j - 1])
        }
        if (j < 7 && i > 1 && (pieces[i - 2][j + 1] == null || (pieces[i - 2][j + 1] != null && pieces[i - 2][j + 1].color != round))) {
            moves.push([i - 2, j + 1])
        }
        if (j > 0 && i > 1 && (pieces[i - 2][j - 1] == null || (pieces[i - 2][j - 1] != null && pieces[i - 2][j - 1].color != round))) {
            moves.push([i - 2, j - 1])
        }
        return moves
    }
    getPoints() {
        return 3
    }
}

class Rook extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveLine(i, j, pieces, round)
    }
    getPoints() {
        return 5
    }
}

class Pawn extends Piece {
    constructor(square = document.body, color) {
        super(square, color)
        this.firstMove = true
    }
    canMove(i, j, pieces, round) {
        let moves = []
        if (j < 7 && pieces[i][j + 1] == null && round == 'white') {
            moves.push([i, j + 1])
        }
        if (j > 0 && pieces[i][j - 1] == null && round == 'black') {
            moves.push([i, j - 1])
        }
        if (j < 7 && i < 7 && pieces[i + 1][j + 1] != null && round == 'white') {
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
        if (this.firstMove) {
            if (j < 6 && pieces[i][j + 2] == null && pieces[i][j + 1] == null) {
                moves.push([i, j + 2])
            }
            if (j > 1 && pieces[i][j - 2] == null && pieces[i][j - 1] == null) {
                moves.push([i, j - 2])
            }
        }
        return moves
    }
    getPoints() {
        return 1
    }
}

class Player {
    constructor(board = document.body, name, color) {
        this.name = name
        this.color = color
        this.score = 0

        let div = document.createElement('button')

        div.classList.add('player')

        div.classList.add(color)

        this.node = board.appendChild(div)

        this.node.innerText = this.score
    }

    addScore(points) {
        this.score += points
        this.node.innerText = this.score
    }

    won() {
        this.node.innerText = 'WINNER'
        setTimeout(() => {
            application.main.dispatchEvent(new Event('endGame'))
        })
    }
}

class App {
    constructor() {
        let div = document.createElement('div')

        div.classList.add('main')

        this.main = document.body.appendChild(div)

        this.main.addEventListener('endGame', () => {
            if (confirm('Restart game?')) {
                this.restartGame()
            }
        })

        this.createMenu()
    }
    startApp() {
        let backup = []
        let item = null
        item = localStorage.getItem('savedMoves')

        if (item !== null) {
            if (confirm('Reload game?')) {
                backup = JSON.parse(item)
            }
            else {
                localStorage.removeItem('savedMoves')
            }
        }

        this.table = new Table(this.main, backup)

        this.timer = new Timer(this.main)

        this.timer.setMaxTime(0)

        this.timer.startTimer(this.table.node)
    }

    restartGame() {
        this.main.removeChild(this.table.node)
        this.main.removeChild(this.table.board)
        this.table = new Table(this.main, [])
        this.table.createBoard(this.main)
        this.timer.startTimer(this.table.node)
    }

    createMenu() {
        let div = document.createElement('div')

        div.classList.add('menu')

        let menu = this.main.appendChild(div)

        let button = menu.appendChild(document.createElement('button'))

        button.classList.add('button')

        button.innerText = '??'

        button = menu.appendChild(document.createElement('button'))

        button.classList.add('button')

        button.innerText = 'Restart game'

        button.addEventListener('click', () => {
            if (confirm('Are U sure?'))
                this.restartGame()
        })

        button = menu.appendChild(document.createElement('button'))

        button.classList.add('button')

        button.classList.add('undo')

        button.disabled = true

        button.innerText = 'Undo last move'

        button.addEventListener('click', () => {
            this.table.undo()
        })
    }
}

window.application = new App()

application.startApp()

